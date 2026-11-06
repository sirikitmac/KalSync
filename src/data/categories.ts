import {
  Car,
  CircleHelp,
  Construction,
  Mountain,
  OctagonAlert,
  TrafficCone,
  TreePine,
  Waves,
  CircleDashed,
  CircleParkingOff,
  CalendarClock,
  type LucideIcon,
} from 'lucide-react'
import type { IncidentCategory, ReportStatus, Severity } from '../types/report'

export interface CategoryMeta {
  id: IncidentCategory
  /** Form / filter label */
  label: string
  /** Landing-page card title */
  title: string
  description: string
  icon: LucideIcon
  severity: Severity
  /** Marker + accent colour */
  color: string
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'pothole',
    label: 'Pothole / Damaged Road',
    title: 'Potholes & Damaged Roads',
    description: 'Cracks, potholes, and broken pavement that can throw a rider off balance.',
    icon: CircleDashed,
    severity: 'medium',
    color: '#B45309',
  },
  {
    id: 'flooding',
    label: 'Flooding',
    title: 'Flooding',
    description: 'Water on the road, clogged drainage, or stretches that become impassable when it rains.',
    icon: Waves,
    severity: 'high',
    color: '#2563EB',
  },
  {
    id: 'accident',
    label: 'Road Accident',
    title: 'Road Accidents',
    description: 'Collisions and crashes that slow down traffic or block lanes.',
    icon: Car,
    severity: 'high',
    color: '#DC2626',
  },
  {
    id: 'obstruction',
    label: 'Road Obstruction',
    title: 'Road Obstructions',
    description: 'Stalled vehicles, illegally parked trucks, or objects blocking a lane.',
    icon: OctagonAlert,
    severity: 'high',
    color: '#EA580C',
  },
  {
    id: 'debris',
    label: 'Fallen Tree / Debris',
    title: 'Fallen Trees & Debris',
    description: 'Branches, rocks, or loose materials left on the road after storms or hauling.',
    icon: TreePine,
    severity: 'medium',
    color: '#15803D',
  },
  {
    id: 'construction',
    label: 'Road Construction',
    title: 'Road Construction',
    description: 'Road works, lane closures, and re-blocking that may need a detour.',
    icon: Construction,
    severity: 'medium',
    color: '#CA8A04',
  },
  {
    id: 'landslide',
    label: 'Landslide',
    title: 'Landslides',
    description: 'Soil or rock slides on mountain and highway roads — common during heavy rain.',
    icon: Mountain,
    severity: 'high',
    color: '#92400E',
  },
  {
    id: 'traffic',
    label: 'Heavy Traffic',
    title: 'Heavy Traffic',
    description: 'Unusual congestion, gridlock, or slow-moving stretches worth avoiding.',
    icon: TrafficCone,
    severity: 'low',
    color: '#7C3AED',
  },
  {
    id: 'parking',
    label: 'Illegal Parking / Vendors',
    title: 'Illegal Parking & Vendors',
    description: 'Vehicles parked on the roadway or sidewalk vendors narrowing a lane — a top cause of slowdowns downtown.',
    icon: CircleParkingOff,
    severity: 'medium',
    color: '#DB2777',
  },
  {
    id: 'event',
    label: 'Planned Closure / Event',
    title: 'Planned Closures & Events',
    description: 'Fiestas, parades, and scheduled road works with a start and end time so you can plan around them.',
    icon: CalendarClock,
    severity: 'medium',
    color: '#0891B2',
  },
  {
    id: 'other',
    label: 'Other',
    title: 'Other Road Hazards',
    description: 'Missing signs, broken streetlights, stray animals, and anything else riders should know.',
    icon: CircleHelp,
    severity: 'low',
    color: '#475569',
  },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  IncidentCategory,
  CategoryMeta
>

export const getCategory = (id: IncidentCategory) => CATEGORY_MAP[id] ?? CATEGORY_MAP.other

export const SEVERITY_META: Record<Severity, { label: string; className: string; dot: string }> = {
  high: { label: 'High severity', className: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-danger' },
  medium: { label: 'Moderate', className: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber' },
  low: { label: 'Low', className: 'bg-slate-50 text-slate-600 ring-slate-200', dot: 'bg-slate-400' },
}

export const STATUS_META: Record<ReportStatus, { label: string; className: string; dot: string; hint: string }> = {
  pending: {
    label: 'Pending Verification',
    className: 'bg-amber-50 text-amber-800 ring-amber-200',
    dot: 'bg-amber',
    hint: 'Sent to the selected offices. Waiting for barangay or city personnel to verify it.',
  },
  verified: {
    label: 'Verified',
    className: 'bg-mint text-forest ring-green-200',
    dot: 'bg-brand',
    hint: 'Verified by barangay or city personnel (demo).',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
    dot: 'bg-slate-400',
    hint: 'Marked resolved by authorized personnel.',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 ring-red-200',
    dot: 'bg-danger',
    hint: 'Personnel could not confirm it, or it did not meet reporting guidelines.',
  },
}

export const STATUSES: ReportStatus[] = ['pending', 'verified', 'resolved', 'rejected']

/** Active = could still affect a journey. */
export const isActiveStatus = (s: ReportStatus) => s === 'pending' || s === 'verified'
