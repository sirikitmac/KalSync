import type { Coordinates, GeographicScope } from '../types/report'

/**
 * Approximate demonstration coordinates. Good enough to place markers on a
 * city-level map; not survey-grade. Add entries here to expand coverage.
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

/** Cities with demonstration reports in the Philippines view. */
export const SUPPORTED_CITIES = [
  ILIGAN_CITY,
  'Cagayan de Oro',
  'Davao City',
  'Cebu City',
  'Metro Manila',
] as const

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

  // Other supported demo cities
  { name: 'Cagayan de Oro', kind: 'city', city: 'Cagayan de Oro', province: 'Misamis Oriental', coordinates: { lat: 8.4542, lng: 124.6319 } },
  { name: 'Davao City', kind: 'city', city: 'Davao City', province: 'Davao del Sur', coordinates: { lat: 7.0731, lng: 125.6128 } },
  { name: 'Cebu City', kind: 'city', city: 'Cebu City', province: 'Cebu', coordinates: { lat: 10.3157, lng: 123.8854 } },
  { name: 'Metro Manila', kind: 'city', city: 'Metro Manila', province: 'Metro Manila', coordinates: { lat: 14.5995, lng: 120.9842 } },

  // Searchable cities without demo coverage yet
  { name: 'Marawi City', kind: 'city', city: 'Marawi City', province: 'Lanao del Sur', coordinates: { lat: 7.9986, lng: 124.2928 } },
  { name: 'Ozamiz City', kind: 'city', city: 'Ozamiz City', province: 'Misamis Occidental', coordinates: { lat: 8.1462, lng: 123.8444 } },
  { name: 'Butuan City', kind: 'city', city: 'Butuan City', province: 'Agusan del Norte', coordinates: { lat: 8.9475, lng: 125.5406 } },
  { name: 'General Santos', kind: 'city', city: 'General Santos', province: 'South Cotabato', coordinates: { lat: 6.1164, lng: 125.1716 } },
  { name: 'Zamboanga City', kind: 'city', city: 'Zamboanga City', province: 'Zamboanga del Sur', coordinates: { lat: 6.9214, lng: 122.079 } },
  { name: 'Dipolog City', kind: 'city', city: 'Dipolog City', province: 'Zamboanga del Norte', coordinates: { lat: 8.5883, lng: 123.3409 } },
  { name: 'Malaybalay City', kind: 'city', city: 'Malaybalay City', province: 'Bukidnon', coordinates: { lat: 8.1575, lng: 125.1278 } },
  { name: 'Iloilo City', kind: 'city', city: 'Iloilo City', province: 'Iloilo', coordinates: { lat: 10.7202, lng: 122.5621 } },
  { name: 'Bacolod City', kind: 'city', city: 'Bacolod City', province: 'Negros Occidental', coordinates: { lat: 10.6765, lng: 122.9509 } },
  { name: 'Tacloban City', kind: 'city', city: 'Tacloban City', province: 'Leyte', coordinates: { lat: 11.2444, lng: 125.0039 } },
  { name: 'Baguio City', kind: 'city', city: 'Baguio City', province: 'Benguet', coordinates: { lat: 16.4023, lng: 120.596 } },
  { name: 'Legazpi City', kind: 'city', city: 'Legazpi City', province: 'Albay', coordinates: { lat: 13.1391, lng: 123.7438 } },
  { name: 'Puerto Princesa', kind: 'city', city: 'Puerto Princesa', province: 'Palawan', coordinates: { lat: 9.7392, lng: 118.7353 } },
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
    description: 'Lanao del Norte · our launch city',
  },
  philippines: {
    id: 'philippines',
    label: 'Philippines',
    shortLabel: 'PH',
    center: { lat: 11.2, lng: 122.6 },
    zoom: 6,
    bounds: [
      [5.6, 117.2],
      [18.8, 126.8],
    ],
    description: '5 demonstration cities · expanding soon',
  },
}

export const isInScope = (city: string, scope: GeographicScope) =>
  scope === 'philippines' ? true : city.trim().toLowerCase() === ILIGAN_CITY.toLowerCase()

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
