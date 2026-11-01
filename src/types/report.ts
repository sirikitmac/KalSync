export type IncidentCategory =
  | 'pothole'
  | 'flooding'
  | 'accident'
  | 'obstruction'
  | 'debris'
  | 'construction'
  | 'landslide'
  | 'traffic'
  | 'other'

export type ReportStatus = 'pending' | 'verified' | 'resolved' | 'rejected'

/** `demo` = seeded sample data. `user` = submitted from this browser. */
export type ReportSource = 'demo' | 'user'

export type Severity = 'high' | 'medium' | 'low'

/** Geographic scopes the app can display. Extend with more cities later. */
export type GeographicScope = 'iligan' | 'philippines'

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
}

export type SortOrder = 'newest' | 'oldest' | 'most-confirmed'

export interface ReportFilters {
  categories: IncidentCategory[]
  statuses: ReportStatus[]
  query: string
  sort: SortOrder
}
