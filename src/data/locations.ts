import type { Coordinates, GeographicScope } from '../types/report'

/**
 * Approximate demonstration coordinates. Good enough to place markers on a
 * city-level map; not survey-grade. Iligan City only.
 */
export interface Place {
  name: string
  /** Barangay / district / road this belongs to (for display) */
  kind: 'city' | 'barangay' | 'road' | 'landmark'
  city: string
  province: string
  coordinates: Coordinates
}

export const ILIGAN_CITY = 'Iligan City'

export const PLACES: Place[] = [
  // Iligan City
  { name: 'Iligan City', kind: 'city', city: ILIGAN_CITY, province: 'Lanao del Norte', coordinates: { lat: 8.228, lng: 124.2452 } },
  { name: 'Tibanga', kind: 'barangay', city: ILIGAN_CITY, province: 'Lanao del Norte', coordinates: { lat: 8.2405, lng: 124.2436 } },
  { name: 'Pala-o', kind: 'barangay', city: ILIGAN_CITY, province: 'Lanao del Norte', coordinates: { lat: 8.2327, lng: 124.2482 } },
  { name: 'Tubod', kind: 'barangay', city: ILIGAN_CITY, province: 'Lanao del Norte', coordinates: { lat: 8.2226, lng: 124.2396 } },
  { name: 'Andres Bonifacio Avenue', kind: 'road', city: ILIGAN_CITY, province: 'Lanao del Norte', coordinates: { lat: 8.2372, lng: 124.2449 } },
  { name: 'Quezon Avenue Extension', kind: 'road', city: ILIGAN_CITY, province: 'Lanao del Norte', coordinates: { lat: 8.2302, lng: 124.2426 } },
  { name: 'Hinaplanon', kind: 'barangay', city: ILIGAN_CITY, province: 'Lanao del Norte', coordinates: { lat: 8.2458, lng: 124.2552 } },
  { name: 'Santiago', kind: 'barangay', city: ILIGAN_CITY, province: 'Lanao del Norte', coordinates: { lat: 8.2563, lng: 124.2617 } },
  { name: 'Dalipuga', kind: 'barangay', city: ILIGAN_CITY, province: 'Lanao del Norte', coordinates: { lat: 8.2915, lng: 124.2669 } },
  { name: 'Mahayahay', kind: 'barangay', city: ILIGAN_CITY, province: 'Lanao del Norte', coordinates: { lat: 8.2254, lng: 124.2337 } },
  { name: 'Tambo', kind: 'barangay', city: ILIGAN_CITY, province: 'Lanao del Norte', coordinates: { lat: 8.2178, lng: 124.2298 } },
  { name: 'Buru-un', kind: 'barangay', city: ILIGAN_CITY, province: 'Lanao del Norte', coordinates: { lat: 8.1888, lng: 124.1781 } },
  { name: 'Maria Cristina', kind: 'barangay', city: ILIGAN_CITY, province: 'Lanao del Norte', coordinates: { lat: 8.1826, lng: 124.1951 } },
  { name: 'Suarez', kind: 'barangay', city: ILIGAN_CITY, province: 'Lanao del Norte', coordinates: { lat: 8.2101, lng: 124.2237 } },
  { name: 'MSU-IIT', kind: 'landmark', city: ILIGAN_CITY, province: 'Lanao del Norte', coordinates: { lat: 8.2412, lng: 124.2443 } },

]

export interface ScopeConfig {
  id: GeographicScope
  label: string
  shortLabel: string
  center: Coordinates
  zoom: number
  /** [[south, west], [north, east]] */
  bounds?: [[number, number], [number, number]]
  description: string
}

export const SCOPES: Record<GeographicScope, ScopeConfig> = {
  iligan: {
    id: 'iligan',
    label: 'Iligan City',
    shortLabel: 'Iligan',
    center: { lat: 8.2335, lng: 124.2455 },
    zoom: 13,
    description: 'Lanao del Norte · 44 barangays',
  },
}

export const ILIGAN_PROVINCE = 'Lanao del Norte'

/** KaDaan covers Iligan City only (SRS scope). */
export const isInScope = (city: string, _scope: GeographicScope = 'iligan') =>
  city.trim().toLowerCase() === ILIGAN_CITY.toLowerCase()

export function searchPlaces(query: string, limit = 6): Place[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const scored = PLACES.map((p) => {
    const hay = `${p.name} ${p.city} ${p.province}`.toLowerCase()
    const name = p.name.toLowerCase()
    let score = -1
    if (name.startsWith(q)) score = 3
    else if (name.includes(q)) score = 2
    else if (hay.includes(q)) score = 1
    return { p, score }
  }).filter((x) => x.score > 0)
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((x) => x.p)
}

/** Haversine distance in km. */
export function distanceKm(a: Coordinates, b: Coordinates) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

/** Best-effort nearest known place, used to pre-fill city/province after geolocation. */
export function nearestPlace(c: Coordinates, maxKm = 30): Place | undefined {
  let best: Place | undefined
  let bestD = Infinity
  for (const p of PLACES) {
    const d = distanceKm(c, p.coordinates)
    if (d < bestD) {
      bestD = d
      best = p
    }
  }
  return bestD <= maxKm ? best : undefined
}
