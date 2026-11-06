import { Building2, HardHat, Landmark, ShieldCheck, Siren, TrafficCone, type LucideIcon } from 'lucide-react'
import type { IncidentCategory, OrgId } from '../types/report'

export interface Organization {
  id: OrgId
  /** Short name used in chips and badges */
  short: string
  name: string
  /** What they handle on the road */
  handles: string
  icon: LucideIcon
  color: string
  /** Can verify, resolve, and post official closures in the personnel app. */
  personnel: boolean
}

export const ORGANIZATIONS: Organization[] = [
  {
    id: 'barangay',
    short: 'Barangay',
    name: 'Barangay Hall (Tanod / BPSO)',
    handles: 'First responder in your area: obstructions, illegal parking and vendors, fiestas and local events, minor flooding.',
    icon: Landmark,
    color: '#15803D',
    personnel: true,
  },
  {
    id: 'ictpmo',
    short: 'ICTPMO',
    name: 'Iligan City Traffic & Parking Management Office',
    handles: 'Traffic flow, parking enforcement, road closures, rerouting and detours.',
    icon: TrafficCone,
    color: '#7C3AED',
    personnel: true,
  },
  {
    id: 'icdrrmo',
    short: 'ICDRRMO',
    name: 'Iligan City Disaster Risk Reduction & Management Office',
    handles: 'Flooding, landslides, storm debris and other disaster-related road hazards.',
    icon: Siren,
    color: '#2563EB',
    personnel: true,
  },
  {
    id: 'ceo',
    short: 'City Engineering',
    name: 'City Engineer’s Office',
    handles: 'Repairs on city roads: potholes, damaged pavement, drainage and debris clearing.',
    icon: HardHat,
    color: '#CA8A04',
    personnel: false,
  },
  {
    id: 'dpwh',
    short: 'DPWH',
    name: 'DPWH – Lanao del Norte District Engineering Office',
    handles: 'National highway repairs and construction.',
    icon: Building2,
    color: '#B45309',
    personnel: false,
  },
  {
    id: 'pnp',
    short: 'PNP',
    name: 'Iligan City Police Office (Traffic)',
    handles: 'Road accidents and incidents that need police presence.',
    icon: ShieldCheck,
    color: '#1D4ED8',
    personnel: false,
  },
]

export const ORG_MAP = Object.fromEntries(ORGANIZATIONS.map((o) => [o.id, o])) as Record<OrgId, Organization>

export const getOrg = (id: OrgId) => ORG_MAP[id]

const SUGGESTIONS: Record<IncidentCategory, OrgId[]> = {
  pothole: ['ceo'],
  flooding: ['icdrrmo', 'barangay'],
  accident: ['pnp', 'ictpmo'],
  obstruction: ['barangay', 'ictpmo'],
  debris: ['ceo', 'barangay'],
  construction: ['ceo', 'dpwh'],
  landslide: ['icdrrmo', 'barangay'],
  traffic: ['ictpmo'],
  parking: ['barangay', 'ictpmo'],
  event: ['barangay', 'ictpmo'],
  other: ['barangay'],
}

/** Offices a report of this category is routed to by default. The reporter can change it. */
export const suggestOrgs = (category: IncidentCategory): OrgId[] => SUGGESTIONS[category] ?? ['barangay']

export const orgNames = (ids: OrgId[] = []) => ids.map((id) => ORG_MAP[id]?.short ?? id).join(', ')
