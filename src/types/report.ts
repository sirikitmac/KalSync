export type IncidentCategory =
  | 'pothole'
  | 'flooding'
  | 'accident'
  | 'obstruction'
  | 'debris'
  | 'construction'
  | 'landslide'
  | 'traffic'
  | 'parking'
  | 'event'
  | 'other'

export type ReportStatus = 'pending' | 'verified' | 'resolved' | 'rejected'

/** `demo` = seeded sample data. `user` = submitted from this browser. */
export type ReportSource = 'demo' | 'user'

export type Severity = 'high' | 'medium' | 'low'

/** KaDaan covers Iligan City only (see SRS scope). */
export type GeographicScope = 'iligan'

export interface Coordinates {
  lat: number
  lng: number
}

/** A freely licensed stock photo used to illustrate a DEMO report. */
export interface StockPhoto {
  src: string
  title: string
  author: string
  license: string
  licenseUrl?: string
  /** Page on Wikimedia Commons (or other source) with full license details */
  sourceUrl: string
}

/** Offices a report can be routed to (see data/organizations.ts). */
export type OrgId = 'barangay' | 'ictpmo' | 'icdrrmo' | 'ceo' | 'dpwh' | 'pnp'

/**
 * Advisory = informational (community or office heads-up).
 * Closed = officially closed; only personnel can set this and it needs a reference
 * (e.g. SP resolution / permit number).
 */
export interface RoadStatus {
  kind: 'advisory' | 'closed'
  reference?: string
  issuedBy?: OrgId
}

export interface Schedule {
  startsAt: string
  endsAt: string
}

export interface Detour {
  description: string
  path?: Coordinates[]
}

export interface Report {
  id: string
  title: string
  category: IncidentCategory
  description: string
  /** Street / barangay / landmark */
  location: string
  city: string
  province: string
  /** Omitted when the reporter gave no position — never fabricated. */
  coordinates?: Coordinates
  /** For demo data: key of an illustrative scene. For user data: IndexedDB image key. */
  imageKey?: string
  /** Stock photo for demo reports (not taken at this location). */
  photo?: StockPhoto
  createdAt: string
  status: ReportStatus
  statusUpdatedAt?: string
  /** Base confirmation count (excluding this browser's confirmation). */
  confirmations: number
  source: ReportSource
  /** Iligan barangay the issue is in — used for routing and barangay alerts. */
  barangay?: string
  /** Offices the reporter chose to notify. */
  reportedTo?: OrgId[]
  roadStatus?: RoadStatus
  /** Planned closures / events. */
  schedule?: Schedule
  /** Affected road segment drawn on the map. */
  segment?: Coordinates[]
  detour?: Detour
  /** Office that verified the report (personnel action). */
  verifiedBy?: OrgId
  /** Set when the entry was posted directly by an office (official advisory). */
  postedBy?: OrgId
}

export interface NewReportInput {
  title: string
  category: IncidentCategory
  description: string
  location: string
  city: string
  province: string
  coordinates?: Coordinates
  image?: Blob
  barangay: string
  reportedTo: OrgId[]
  schedule?: Schedule
}

export type SortOrder = 'newest' | 'oldest' | 'most-confirmed'

export interface ReportFilters {
  categories: IncidentCategory[]
  statuses: ReportStatus[]
  query: string
  sort: SortOrder
}
