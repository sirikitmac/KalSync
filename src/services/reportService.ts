import { MOCK_REPORTS } from '../data/mockReports'
import type { NewReportInput, Report, ReportStatus } from '../types/report'
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
    const [userReports, overrides] = await Promise.all([
      getAll<Report>(STORES.reports),
      getAll<StatusOverride>(STORES.overrides),
    ])
    const ov = new Map(overrides.map((o) => [o.id, o]))
    const demo = MOCK_REPORTS.map((r) => {
      const o = ov.get(r.id)
      return o ? { ...r, status: o.status, statusUpdatedAt: o.statusUpdatedAt } : r
    })
    return [...userReports, ...demo]
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

export const reportService: ReportService = new LocalReportService()
