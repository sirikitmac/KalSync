import { MOCK_REPORTS } from '../data/mockReports'
import { getDeviceId } from '../lib/deviceId'
import { PHOTO_BUCKET, supabase } from '../lib/supabase'
import type { Coordinates, IncidentCategory, NewReportInput, OrgId, Report, ReportStatus } from '../types/report'
import { compressImage } from './imageService'
import { STORES, clear, get, getAll, local, put, remove } from './storageService'

/**
 * Simulated network latency so the UI behaves like it talks to a server
 * (loading and saving states). Remove once a real backend is connected.
 */
export const simulateLatency = (min = 300, max = 700) =>
  new Promise<void>((r) => window.setTimeout(r, min + Math.random() * (max - min)))

/**
 * The contract the UI depends on. The current implementation is browser-local;
 * a Supabase implementation (Postgres + Storage + Realtime) can implement the
 * same interface later without touching components.
 */
export interface ReportService {
  list(): Promise<Report[]>
  create(input: NewReportInput): Promise<Report>
  /** Personnel-only in production (barangay / ICTPMO / ICDRRMO). Not exposed in the public app. */
  updateStatus(id: string, status: ReportStatus): Promise<void>
  getImageBlob(imageKey: string): Promise<Blob | undefined>
  getConfirmedIds(): Set<string>
  confirm(id: string): Promise<void>
  /** Prototype utility: remove this browser's submissions and demo changes. */
  resetLocalData(): Promise<void>
}

interface StatusOverride {
  id: string
  status: ReportStatus
  statusUpdatedAt: string
}

const CONFIRMED_KEY = 'kadaan:confirmed'

export function generateReportId(date = new Date()) {
  const ymd = `${date.getFullYear().toString().slice(2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = new Uint8Array(5)
  crypto.getRandomValues(bytes)
  const rand = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
  return `KD-${ymd}-${rand}`
}

class LocalReportService implements ReportService {
  async list(): Promise<Report[]> {
    await simulateLatency(400, 900)
    const [userReports, demo] = await Promise.all([getAll<Report>(STORES.reports), this.listDemo()])
    return [...userReports, ...demo]
  }

  /** Demo reports with any status changes made in this browser. */
  async listDemo(): Promise<Report[]> {
    const overrides = await getAll<StatusOverride>(STORES.overrides)
    const ov = new Map(overrides.map((o) => [o.id, o]))
    return MOCK_REPORTS.map((r) => {
      const o = ov.get(r.id)
      return o ? { ...r, status: o.status, statusUpdatedAt: o.statusUpdatedAt } : r
    })
  }

  async create(input: NewReportInput): Promise<Report> {
    await simulateLatency(600, 1100)
    const now = new Date()
    const id = generateReportId(now)
    let imageKey: string | undefined
    if (input.image) {
      imageKey = `img:${id}`
      const blob = await compressImage(input.image)
      await put(STORES.images, blob, imageKey)
    }
    const report: Report = {
      id,
      title: input.title.trim(),
      category: input.category,
      description: input.description.trim(),
      location: input.location.trim(),
      city: input.city.trim(),
      province: input.province.trim(),
      coordinates: input.coordinates,
      barangay: input.barangay,
      reportedTo: input.reportedTo,
      schedule: input.schedule,
      roadStatus: { kind: 'advisory' },
      imageKey,
      createdAt: now.toISOString(),
      status: 'pending',
      confirmations: 0,
      source: 'user',
    }
    await put(STORES.reports, report)
    return report
  }

  async updateStatus(id: string, status: ReportStatus): Promise<void> {
    const statusUpdatedAt = new Date().toISOString()
    const user = await get<Report>(STORES.reports, id)
    if (user) {
      // Original submission details are preserved — only status fields change.
      await put(STORES.reports, { ...user, status, statusUpdatedAt })
      return
    }
    await put<StatusOverride>(STORES.overrides, { id, status, statusUpdatedAt })
  }

  async getImageBlob(imageKey: string) {
    return get<Blob>(STORES.images, imageKey)
  }

  getConfirmedIds() {
    return new Set(local.read<string[]>(CONFIRMED_KEY, []))
  }

  async confirm(id: string) {
    await simulateLatency(200, 450)
    const ids = this.getConfirmedIds()
    if (ids.has(id)) return
    ids.add(id)
    local.write(CONFIRMED_KEY, [...ids])
  }

  async resetLocalData() {
    const reports = await getAll<Report>(STORES.reports)
    await Promise.all(reports.filter((r) => r.imageKey).map((r) => remove(STORES.images, r.imageKey!)))
    await Promise.all([clear(STORES.reports), clear(STORES.overrides), clear(STORES.images)])
    local.write(CONFIRMED_KEY, [])
  }
}

/* ------------------------------------------------------------------ Supabase */

const MINE_KEY = 'kadaan:my-reports'
const isDemoId = (id: string) => id.startsWith('DEMO-')

interface ReportRow {
  id: string
  title: string
  category: IncidentCategory
  description: string
  location: string
  barangay: string
  city: string
  province: string
  lat: number | null
  lng: number | null
  photo_path: string | null
  status: ReportStatus
  status_updated_at: string | null
  road_status: 'advisory' | 'closed'
  closure_reference: string | null
  issued_by: OrgId | null
  schedule_starts_at: string | null
  schedule_ends_at: string | null
  segment: Coordinates[] | null
  detour_description: string | null
  detour_path: Coordinates[] | null
  verified_by: OrgId | null
  posted_by: OrgId | null
  confirmations: number
  created_at: string
  report_offices?: { office_id: OrgId }[]
}

const REPORT_SELECT = '*, report_offices(office_id)'

class SupabaseReportService implements ReportService {
  private readonly db = supabase!
  private readonly demo = new LocalReportService()

  private mine() {
    return new Set(local.read<string[]>(MINE_KEY, []))
  }

  private toReport(row: ReportRow, mine: Set<string>, confirmed: Set<string>): Report {
    return {
      id: row.id,
      title: row.title,
      category: row.category,
      description: row.description,
      location: row.location,
      city: row.city,
      province: row.province,
      coordinates: row.lat != null && row.lng != null ? { lat: row.lat, lng: row.lng } : undefined,
      imageKey: row.photo_path ? `sb:${row.photo_path}` : undefined,
      createdAt: row.created_at,
      status: row.status,
      statusUpdatedAt: row.status_updated_at ?? undefined,
      // The UI adds this browser's own confirmation on top of the base count.
      confirmations: Math.max(0, row.confirmations - (confirmed.has(row.id) ? 1 : 0)),
      source: mine.has(row.id) ? 'user' : 'community',
      barangay: row.barangay,
      reportedTo: row.report_offices?.map((o) => o.office_id) ?? [],
      roadStatus: {
        kind: row.road_status,
        reference: row.closure_reference ?? undefined,
        issuedBy: row.issued_by ?? undefined,
      },
      schedule:
        row.schedule_starts_at && row.schedule_ends_at
          ? { startsAt: row.schedule_starts_at, endsAt: row.schedule_ends_at }
          : undefined,
      segment: row.segment ?? undefined,
      detour: row.detour_description
        ? { description: row.detour_description, path: row.detour_path ?? undefined }
        : undefined,
      verifiedBy: row.verified_by ?? undefined,
      postedBy: row.posted_by ?? undefined,
    }
  }

  async list(): Promise<Report[]> {
    const [{ data, error }, demo] = await Promise.all([
      this.db.from('reports').select(REPORT_SELECT).order('created_at', { ascending: false }),
      this.demo.listDemo(),
    ])
    if (error) throw error
    const mine = this.mine()
    const confirmed = this.getConfirmedIds()
    return [...(data as ReportRow[]).map((r) => this.toReport(r, mine, confirmed)), ...demo]
  }

  async create(input: NewReportInput): Promise<Report> {
    let photoPath: string | null = null
    if (input.image) {
      const blob = await compressImage(input.image)
      photoPath = `reports/${crypto.randomUUID()}.jpg`
      const { error } = await this.db.storage
        .from(PHOTO_BUCKET)
        .upload(photoPath, blob, { contentType: blob.type || 'image/jpeg', upsert: false })
      if (error) throw error
    }
    const { data, error } = await this.db.rpc('submit_report', {
      p_title: input.title.trim(),
      p_category: input.category,
      p_description: input.description.trim(),
      p_location: input.location.trim(),
      p_barangay: input.barangay,
      p_offices: input.reportedTo,
      p_consent: true, // the form blocks submission until consent is given
      p_lat: input.coordinates?.lat ?? null,
      p_lng: input.coordinates?.lng ?? null,
      p_photo_path: photoPath,
      p_starts_at: input.schedule?.startsAt ? new Date(input.schedule.startsAt).toISOString() : null,
      p_ends_at: input.schedule?.endsAt ? new Date(input.schedule.endsAt).toISOString() : null,
    })
    if (error) throw error
    const row = data as ReportRow
    local.write(MINE_KEY, [...this.mine(), row.id])
    return this.toReport({ ...row, report_offices: input.reportedTo.map((office_id) => ({ office_id })) }, this.mine(), new Set())
  }

  async updateStatus(id: string, status: ReportStatus): Promise<void> {
    if (isDemoId(id)) return this.demo.updateStatus(id, status)
    const { error } = await this.db.from('reports').update({ status }).eq('id', id)
    if (error) throw error
  }

  async getImageBlob(imageKey: string) {
    if (!imageKey.startsWith('sb:')) return this.demo.getImageBlob(imageKey)
    const { data, error } = await this.db.storage.from(PHOTO_BUCKET).download(imageKey.slice(3))
    if (error) throw error
    return data
  }

  getConfirmedIds() {
    return this.demo.getConfirmedIds()
  }

  async confirm(id: string) {
    if (!isDemoId(id)) {
      const { error } = await this.db.rpc('confirm_report', { p_report_id: id, p_device_id: getDeviceId() })
      if (error) throw error
    }
    const ids = this.getConfirmedIds()
    ids.add(id)
    local.write(CONFIRMED_KEY, [...ids])
  }

  async resetLocalData() {
    await this.demo.resetLocalData()
    local.write(MINE_KEY, [])
  }
}

export const isLiveBackend = supabase !== null

export const reportService: ReportService = supabase ? new SupabaseReportService() : new LocalReportService()
