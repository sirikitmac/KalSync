import { getCategory, isActiveStatus } from '../data/categories'
import { DEMO_CONTRIBUTORS } from '../data/mockReports'
import { distanceKm, isInScope } from '../data/locations'
import type { Coordinates, GeographicScope, Report, ReportFilters, Schedule, Severity } from '../types/report'

export const DEFAULT_FILTERS: ReportFilters = {
  categories: [],
  statuses: [],
  query: '',
  sort: 'newest',
}

export const NEARBY_KM = 5

export const effectiveConfirmations = (r: Report, confirmed: Set<string>) =>
  r.confirmations + (confirmed.has(r.id) ? 1 : 0)

export const severityOf = (r: Report): Severity => getCategory(r.category).severity

export function filterReports(
  reports: Report[],
  scope: GeographicScope,
  filters: ReportFilters,
  confirmed: Set<string>,
): Report[] {
  const q = filters.query.trim().toLowerCase()
  const out = reports.filter((r) => {
    if (!isInScope(r.city, scope)) return false
    if (filters.categories.length && !filters.categories.includes(r.category)) return false
    if (filters.statuses.length && !filters.statuses.includes(r.status)) return false
    if (q) {
      const hay = `${r.title} ${r.location} ${r.barangay ?? ''} ${r.city} ${getCategory(r.category).label}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
  return sortReports(out, filters.sort, confirmed)
}

export function sortReports(reports: Report[], sort: ReportFilters['sort'], confirmed: Set<string>) {
  const copy = [...reports]
  copy.sort((a, b) => {
    if (sort === 'most-confirmed') return effectiveConfirmations(b, confirmed) - effectiveConfirmations(a, confirmed)
    const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    return sort === 'oldest' ? -diff : diff
  })
  return copy
}

export const hasActiveFilters = (f: ReportFilters) => f.categories.length > 0 || f.statuses.length > 0 || f.query.trim() !== ''

export interface ScopeStats {
  total: number
  active: number
  cities: number
  contributors: number
  highSeverityActive: number
}

/** Illustrative metrics derived from the (demo + local) data set in scope. */
export function computeStats(reports: Report[], scope: GeographicScope): ScopeStats {
  const inScope = reports.filter((r) => isInScope(r.city, scope))
  const active = inScope.filter((r) => isActiveStatus(r.status))
  const cities = new Set(inScope.map((r) => r.city))
  const demoContributors = [...cities].reduce((sum, c) => sum + (DEMO_CONTRIBUTORS[c] ?? 0), 0)
  const hasLocal = inScope.some((r) => r.source === 'user')
  return {
    total: inScope.length,
    active: active.length,
    cities: cities.size,
    contributors: demoContributors + (hasLocal ? 1 : 0),
    highSeverityActive: active.filter((r) => severityOf(r) === 'high').length,
  }
}

/** Active, potentially dangerous reports first, newest first within each tier. */
export function alertFeed(reports: Report[], scope: GeographicScope, barangays: string[] = []) {
  const rank: Record<Severity, number> = { high: 0, medium: 1, low: 2 }
  const followed = new Set(barangays)
  return reports
    .filter((r) => isInScope(r.city, scope) && isActiveStatus(r.status))
    .filter((r) => followed.size === 0 || r.source === 'user' || (r.barangay && followed.has(r.barangay)))
    .sort((a, b) => {
      // User submissions from this browser always surface first
      if (a.source !== b.source) return a.source === 'user' ? -1 : 1
      // Official closures next
      const ca = a.roadStatus?.kind === 'closed' ? 0 : 1
      const cb = b.roadStatus?.kind === 'closed' ? 0 : 1
      if (ca !== cb) return ca - cb
      const s = rank[severityOf(a)] - rank[severityOf(b)]
      if (s !== 0) return s
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
}

export function distanceTo(r: Report, me?: Coordinates) {
  if (!me || !r.coordinates) return undefined
  return distanceKm(me, r.coordinates)
}

const dateFmt = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
const timeFmt = new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit' })

export function formatDateTime(iso: string) {
  const d = new Date(iso)
  return `${dateFmt.format(d)} · ${timeFmt.format(d)}`
}

export function formatRelative(iso: string, now = Date.now()) {
  const diff = Math.round((now - new Date(iso).getTime()) / 1000)
  if (diff < 45) return 'Just now'
  if (diff < 3600) return `${Math.round(diff / 60)} min ago`
  if (diff < 86400) return `${Math.round(diff / 3600)} hr ago`
  if (diff < 86400 * 7) return `${Math.round(diff / 86400)} d ago`
  return dateFmt.format(new Date(iso))
}

/** e.g. "Nov 14 · 6:00 AM – 10:00 PM" or across days "Nov 14, 6:00 AM – Nov 16, 10:00 PM". */
export function formatSchedule(s: Schedule) {
  const a = new Date(s.startsAt)
  const b = new Date(s.endsAt)
  const day = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' })
  const sameDay = a.toDateString() === b.toDateString()
  return sameDay
    ? `${day.format(a)} · ${timeFmt.format(a)} – ${timeFmt.format(b)}`
    : `${day.format(a)}, ${timeFmt.format(a)} – ${day.format(b)}, ${timeFmt.format(b)}`
}

export type ScheduleState = 'upcoming' | 'ongoing' | 'ended'
export function scheduleState(s: Schedule, now = Date.now()): ScheduleState {
  if (now < new Date(s.startsAt).getTime()) return 'upcoming'
  if (now > new Date(s.endsAt).getTime()) return 'ended'
  return 'ongoing'
}

export const formatKm = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`)
