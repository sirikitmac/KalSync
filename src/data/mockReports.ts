import type { Report } from '../types/report'
import { DEMO_PHOTOS } from './demoPhotos'

/**
 * DEMO DATA — illustrative sample reports only.
 *
 * These are NOT real or current road incidents. Titles, descriptions,
 * timestamps, statuses and confirmation counts are invented to show how
 * KaDaan works. Coordinates are approximate demonstration positions.
 * Resolution and permit numbers marked DEMO are invented.
 *
 * Every record has `source: 'demo'` so the UI can label it as sample data.
 * Each report gets a freely licensed stock photo (see demoPhotos.ts) that shows the
 * incident type only. `imageKey: 'scene:*'` is the drawn fallback if a photo can't load.
 */
const SEED: Report[] = [
  // ───────── Iligan City ─────────
  {
    id: 'DEMO-ILG-001',
    title: 'Deep pothole on the outer lane',
    category: 'pothole',
    description:
      'Sample report: a pothole roughly the width of a motorcycle tire on the outer lane. Easy to miss at night — riders should keep to the inner lane and slow down.',
    location: 'Andres Bonifacio Ave., near MSU-IIT gate',
    city: 'Iligan City',
    province: 'Lanao del Norte',
    coordinates: { lat: 8.2398, lng: 124.2441 },
    imageKey: 'scene:pothole',
    createdAt: '2026-10-24T07:42:00+08:00',
    status: 'verified',
    statusUpdatedAt: '2026-10-24T10:05:00+08:00',
    confirmations: 23,
    source: 'demo',
  },
  {
    id: 'DEMO-ILG-002',
    title: 'Ankle-deep flooding after heavy rain',
    category: 'flooding',
    description:
      'Sample report: rainwater pooling across both lanes due to a clogged drainage inlet. Small vehicles are slowing to a crawl; avoid splashing pedestrians.',
    location: 'Pala-o, near the public market',
    city: 'Iligan City',
    province: 'Lanao del Norte',
    coordinates: { lat: 8.2318, lng: 124.2491 },
    imageKey: 'scene:flooding',
    createdAt: '2026-10-23T16:18:00+08:00',
    status: 'verified',
    statusUpdatedAt: '2026-10-23T17:02:00+08:00',
    confirmations: 41,
    source: 'demo',
  },
  {
    id: 'DEMO-ILG-003',
    title: 'Stalled truck blocking one lane',
    category: 'obstruction',
    description:
      'Sample report: a delivery truck with engine trouble is parked on the right lane with no early-warning device. Traffic is merging into a single lane.',
    location: 'Tubod, national highway',
    city: 'Iligan City',
    province: 'Lanao del Norte',
    coordinates: { lat: 8.2221, lng: 124.2389 },
    imageKey: 'scene:obstruction',
    createdAt: '2026-10-22T13:05:00+08:00',
    status: 'pending',
    confirmations: 7,
    source: 'demo',
  },
  {
    id: 'DEMO-ILG-004',
    title: 'Road re-blocking, one lane closed',
    category: 'construction',
    description:
      'Sample report: concrete re-blocking with flaggers directing alternating traffic. Expect short queues during rush hour; a detour via the inner road is possible.',
    location: 'Quezon Ave. Extension, Pala-o',
    city: 'Iligan City',
    province: 'Lanao del Norte',
    coordinates: { lat: 8.2296, lng: 124.2431 },
    imageKey: 'scene:construction',
    createdAt: '2026-10-21T08:30:00+08:00',
    status: 'verified',
    statusUpdatedAt: '2026-10-21T09:12:00+08:00',
    confirmations: 18,
    source: 'demo',
  },
  {
    id: 'DEMO-ILG-005',
    title: 'Fallen branches on the shoulder',
    category: 'debris',
    description:
      'Sample report: large acacia branches fell after strong winds and are partly on the road shoulder. Motorcycles hugging the shoulder should watch out.',
    location: 'Hinaplanon, along the highway',
    city: 'Iligan City',
    province: 'Lanao del Norte',
    coordinates: { lat: 8.2462, lng: 124.2561 },
    imageKey: 'scene:debris',
    createdAt: '2026-10-19T06:50:00+08:00',
    status: 'resolved',
    statusUpdatedAt: '2026-10-19T12:40:00+08:00',
    confirmations: 12,
    source: 'demo',
  },
  {
    id: 'DEMO-ILG-006',
    title: 'Small rockfall on the uphill road',
    category: 'landslide',
    description:
      'Sample report: loose soil and a few rocks slid onto the uphill lane after continuous rain. Passable with care; avoid the area during downpours.',
    location: 'Road to Maria Cristina Falls',
    city: 'Iligan City',
    province: 'Lanao del Norte',
    coordinates: { lat: 8.1846, lng: 124.1978 },
    imageKey: 'scene:landslide',
    createdAt: '2026-10-18T15:22:00+08:00',
    status: 'pending',
    confirmations: 9,
    source: 'demo',
  },
  {
    id: 'DEMO-ILG-007',
    title: 'Slow traffic at the intersection',
    category: 'traffic',
    description:
      'Sample report: dismissal-time congestion stretching about 300 meters. Jeepneys loading and unloading on the curb lane add to the slowdown.',
    location: 'Tibanga, near the school zone',
    city: 'Iligan City',
    province: 'Lanao del Norte',
    coordinates: { lat: 8.2418, lng: 124.2428 },
    imageKey: 'scene:traffic',
    createdAt: '2026-10-17T17:10:00+08:00',
    status: 'verified',
    statusUpdatedAt: '2026-10-17T17:35:00+08:00',
    confirmations: 15,
    source: 'demo',
  },
  {
    id: 'DEMO-ILG-008',
    title: 'Minor two-motorcycle collision',
    category: 'accident',
    description:
      'Sample report: a minor collision between two motorcycles; responders already on site. Lane partly blocked while vehicles are moved aside.',
    location: 'Santiago, national highway',
    city: 'Iligan City',
    province: 'Lanao del Norte',
    coordinates: { lat: 8.2568, lng: 124.2625 },
    imageKey: 'scene:accident',
    createdAt: '2026-10-16T19:44:00+08:00',
    status: 'resolved',
    statusUpdatedAt: '2026-10-16T21:10:00+08:00',
    confirmations: 6,
    source: 'demo',
  },
  {
    id: 'DEMO-ILG-009',
    title: 'Cracked pavement near the bridge',
    category: 'pothole',
    description:
      'Sample report: a series of cracks and a sunken patch on the bridge approach. Noticeable bump for motorcycles — slow down before the bridge.',
    location: 'Mahayahay, bridge approach',
    city: 'Iligan City',
    province: 'Lanao del Norte',
    coordinates: { lat: 8.2251, lng: 124.2342 },
    imageKey: 'scene:pothole',
    createdAt: '2026-10-14T11:15:00+08:00',
    status: 'pending',
    confirmations: 4,
    source: 'demo',
  },
  {
    id: 'DEMO-ILG-010',
    title: 'Streetlights out on a dark stretch',
    category: 'other',
    description:
      'Sample report: several streetlights not working along a dark stretch. Combined with stray dogs crossing, visibility is poor for riders at night. (No precise pin provided.)',
    location: 'Dalipuga area',
    city: 'Iligan City',
    province: 'Lanao del Norte',
    imageKey: 'scene:other',
    createdAt: '2026-10-12T21:05:00+08:00',
    status: 'pending',
    confirmations: 3,
    source: 'demo',
  },
  {
    id: 'DEMO-ILG-011',
    title: 'Flooded underpass after downpour',
    category: 'flooding',
    description:
      'Sample report: low section along the coastal road holds water after heavy rain. Wait for water to recede before crossing on two wheels.',
    location: 'Buru-un, coastal road',
    city: 'Iligan City',
    province: 'Lanao del Norte',
    coordinates: { lat: 8.1902, lng: 124.1806 },
    imageKey: 'scene:flooding',
    createdAt: '2026-10-09T14:30:00+08:00',
    status: 'rejected',
    statusUpdatedAt: '2026-10-09T18:00:00+08:00',
    confirmations: 1,
    source: 'demo',
  },

]

/** Routing, verification and road-status details for the seeded reports. */
const DETAILS: Record<string, Partial<Report>> = {
  'DEMO-ILG-001': { barangay: 'Tibanga', reportedTo: ['ceo'], verifiedBy: 'barangay', roadStatus: { kind: 'advisory' } },
  'DEMO-ILG-002': {
    barangay: 'Pala-o',
    reportedTo: ['icdrrmo', 'barangay'],
    verifiedBy: 'icdrrmo',
    roadStatus: { kind: 'advisory', issuedBy: 'icdrrmo' },
    segment: [
      { lat: 8.2331, lng: 124.2477 },
      { lat: 8.2318, lng: 124.2491 },
      { lat: 8.2305, lng: 124.2504 },
    ],
    detour: {
      description: 'Take the inner road behind the public market and rejoin the highway past the flooded stretch.',
      path: [
        { lat: 8.2331, lng: 124.2477 },
        { lat: 8.2338, lng: 124.2497 },
        { lat: 8.2318, lng: 124.2512 },
        { lat: 8.2305, lng: 124.2504 },
      ],
    },
  },
  'DEMO-ILG-003': { barangay: 'Tubod', reportedTo: ['barangay', 'ictpmo'], roadStatus: { kind: 'advisory' } },
  'DEMO-ILG-004': {
    barangay: 'Pala-o',
    reportedTo: ['ceo'],
    verifiedBy: 'ictpmo',
    roadStatus: { kind: 'advisory', issuedBy: 'ictpmo' },
    detour: { description: 'Light vehicles can use the inner road parallel to Quezon Ave. Extension during rush hour.' },
  },
  'DEMO-ILG-005': { barangay: 'Hinaplanon', reportedTo: ['ceo', 'barangay'], verifiedBy: 'barangay' },
  'DEMO-ILG-006': { barangay: 'Maria Cristina', reportedTo: ['icdrrmo', 'barangay'], roadStatus: { kind: 'advisory' } },
  'DEMO-ILG-007': { barangay: 'Tibanga', reportedTo: ['ictpmo'], verifiedBy: 'ictpmo', roadStatus: { kind: 'advisory' } },
  'DEMO-ILG-008': { barangay: 'Santiago', reportedTo: ['pnp', 'ictpmo'], verifiedBy: 'ictpmo' },
  'DEMO-ILG-009': { barangay: 'Mahayahay', reportedTo: ['ceo'], roadStatus: { kind: 'advisory' } },
  'DEMO-ILG-010': { barangay: 'Dalipuga', reportedTo: ['barangay'], roadStatus: { kind: 'advisory' } },
  'DEMO-ILG-011': { barangay: 'Buru-un', reportedTo: ['icdrrmo'] },
}

/** Entries posted directly by offices (official closures, scheduled events) plus a parking report. */
const OFFICIAL: Report[] = [
  {
    id: 'DEMO-ILG-012',
    title: 'Road closed for drainage works',
    category: 'construction',
    description:
      'Sample official advisory: one block closed to all vehicles while the drainage line is replaced. Use the detour shown on the map. Pedestrian access stays open.',
    location: 'Quezon Avenue, Poblacion',
    city: 'Iligan City',
    province: 'Lanao del Norte',
    barangay: 'Poblacion',
    coordinates: { lat: 8.2287, lng: 124.2402 },
    segment: [
      { lat: 8.2295, lng: 124.2396 },
      { lat: 8.2287, lng: 124.2402 },
      { lat: 8.2279, lng: 124.2409 },
    ],
    detour: {
      description: 'Turn right one block before the closure and use the parallel street, then rejoin Quezon Avenue after the works.',
      path: [
        { lat: 8.2295, lng: 124.2396 },
        { lat: 8.2301, lng: 124.2410 },
        { lat: 8.2286, lng: 124.2422 },
        { lat: 8.2279, lng: 124.2409 },
      ],
    },
    roadStatus: { kind: 'closed', reference: 'SP Res. No. DEMO-2026-041', issuedBy: 'ictpmo' },
    schedule: { startsAt: '2026-11-03T06:00:00+08:00', endsAt: '2026-11-20T18:00:00+08:00' },
    postedBy: 'ictpmo',
    verifiedBy: 'ictpmo',
    imageKey: 'scene:construction',
    createdAt: '2026-11-02T15:00:00+08:00',
    status: 'verified',
    statusUpdatedAt: '2026-11-02T15:00:00+08:00',
    confirmations: 27,
    source: 'demo',
  },
  {
    id: 'DEMO-ILG-013',
    title: 'Fiesta procession — main road closed',
    category: 'event',
    description:
      'Sample barangay advisory: the main road will be closed during the fiesta procession and street program. Expect heavy foot traffic; tricycles will use the alternate route.',
    location: 'Tibanga main road, near the chapel',
    city: 'Iligan City',
    province: 'Lanao del Norte',
    barangay: 'Tibanga',
    coordinates: { lat: 8.2428, lng: 124.2447 },
    segment: [
      { lat: 8.2437, lng: 124.2441 },
      { lat: 8.2428, lng: 124.2447 },
      { lat: 8.2419, lng: 124.2454 },
    ],
    detour: { description: 'Tricycles and private vehicles will be rerouted through the national highway.' },
    roadStatus: { kind: 'closed', reference: 'Brgy. Permit No. DEMO-118', issuedBy: 'barangay' },
    schedule: { startsAt: '2026-11-15T06:00:00+08:00', endsAt: '2026-11-15T13:00:00+08:00' },
    postedBy: 'barangay',
    verifiedBy: 'barangay',
    imageKey: 'scene:event',
    createdAt: '2026-11-04T09:30:00+08:00',
    status: 'verified',
    statusUpdatedAt: '2026-11-04T09:30:00+08:00',
    confirmations: 9,
    source: 'demo',
  },
  {
    id: 'DEMO-ILG-014',
    title: 'Double parking and vendors narrowing the lane',
    category: 'parking',
    description:
      'Sample report: vehicles double-parked in front of stores and vendor stalls on the roadside leave only one lane open. Jeepneys stop in the middle of the road to load.',
    location: 'Near the public market, Poblacion',
    city: 'Iligan City',
    province: 'Lanao del Norte',
    barangay: 'Poblacion',
    coordinates: { lat: 8.2299, lng: 124.2376 },
    reportedTo: ['barangay', 'ictpmo'],
    roadStatus: { kind: 'advisory' },
    imageKey: 'scene:parking',
    createdAt: '2026-11-05T08:20:00+08:00',
    status: 'pending',
    confirmations: 11,
    source: 'demo',
  },
]

export const MOCK_REPORTS: Report[] = [
  ...OFFICIAL,
  ...SEED.map((r) => ({ ...r, ...DETAILS[r.id], photo: DEMO_PHOTOS[r.id] })),
]

/**
 * Illustrative contributor counts per city used by the stats section.
 * Sample metrics only — there are no real accounts in this prototype.
 */
export const DEMO_CONTRIBUTORS: Record<string, number> = {
  'Iligan City': 128,
}
