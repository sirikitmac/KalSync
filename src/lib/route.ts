import type { Coordinates } from '../types/report'

/** A driving route as [lng, lat] points, with the running distance (m) at each point. */
export interface Route {
  coords: [number, number][]
  cum: number[]
  /** Total length in metres. */
  distance: number
  /** Expected driving time in seconds. */
  duration: number
  /** True when no road route could be fetched and a straight line is used instead. */
  approximate: boolean
}

const R = 6371000
const rad = (d: number) => (d * Math.PI) / 180

/** Great-circle distance in metres. */
export function metres(a: Coordinates, b: Coordinates) {
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Compass bearing from a to b, in degrees (0 = north). */
export function bearing(a: Coordinates, b: Coordinates) {
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat))
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng))
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

const pt = (c: [number, number]): Coordinates => ({ lng: c[0], lat: c[1] })

export function buildRoute(coords: [number, number][], duration: number | null, approximate: boolean): Route {
  const cum = [0]
  for (let i = 1; i < coords.length; i++) cum.push(cum[i - 1] + metres(pt(coords[i - 1]), pt(coords[i])))
  const distance = cum[cum.length - 1] ?? 0
  // Without a router, assume 25 km/h of city traffic.
  return { coords, cum, distance, duration: duration ?? distance / (25 / 3.6), approximate }
}

/**
 * Where a point falls on the route: how far along it is (m), how far off it is (m),
 * and the direction of travel at that spot.
 */
export function locate(route: Route, p: Coordinates) {
  let best = { along: 0, offset: Infinity, heading: 0, index: 0 }
  // Local flat projection in metres around p is accurate enough at city scale.
  const kx = R * Math.cos(rad(p.lat)) * (Math.PI / 180)
  const ky = R * (Math.PI / 180)
  for (let i = 0; i < route.coords.length - 1; i++) {
    const [ax, ay] = route.coords[i]
    const [bx, by] = route.coords[i + 1]
    const x1 = (ax - p.lng) * kx, y1 = (ay - p.lat) * ky
    const x2 = (bx - p.lng) * kx, y2 = (by - p.lat) * ky
    const dx = x2 - x1, dy = y2 - y1
    const len2 = dx * dx + dy * dy
    const t = len2 ? Math.max(0, Math.min(1, -(x1 * dx + y1 * dy) / len2)) : 0
    const cx = x1 + t * dx, cy = y1 + t * dy
    const d = Math.hypot(cx, cy)
    if (d < best.offset) {
      best = { along: route.cum[i] + t * Math.sqrt(len2), offset: d, heading: bearing(pt(route.coords[i]), pt(route.coords[i + 1])), index: i }
    }
  }
  return best
}

/** The point at a given distance along the route (used by the demo drive). */
export function pointAt(route: Route, along: number): Coordinates {
  const { coords, cum } = route
  if (along <= 0) return pt(coords[0])
  for (let i = 1; i < coords.length; i++) {
    if (cum[i] >= along) {
      const seg = cum[i] - cum[i - 1] || 1
      const t = (along - cum[i - 1]) / seg
      return { lng: coords[i - 1][0] + (coords[i][0] - coords[i - 1][0]) * t, lat: coords[i - 1][1] + (coords[i][1] - coords[i - 1][1]) * t }
    }
  }
  return pt(coords[coords.length - 1])
}

/**
 * Road route from the public OSRM server (OpenStreetMap data, no key).
 * Falls back to a straight line so the feature still works offline or if the server is down.
 */
export async function fetchRoute(from: Coordinates, to: Coordinates, signal?: AbortSignal): Promise<Route> {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&alternatives=false&steps=false`
  try {
    const res = await fetch(url, { signal })
    if (!res.ok) throw new Error(String(res.status))
    const json = (await res.json()) as { routes?: { geometry: { coordinates: [number, number][] }; duration: number }[] }
    const r = json.routes?.[0]
    if (!r || r.geometry.coordinates.length < 2) throw new Error('no route')
    // OSRM starts and ends on the nearest road; join the real start and end so the line meets the pins.
    const coords: [number, number][] = [[from.lng, from.lat], ...r.geometry.coordinates, [to.lng, to.lat]]
    return buildRoute(coords, r.duration, false)
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e
    return buildRoute(
      [
        [from.lng, from.lat],
        [to.lng, to.lat],
      ],
      null,
      true,
    )
  }
}

export const formatDistance = (m: number) => (m < 950 ? `${Math.max(10, Math.round(m / 10) * 10)} m` : `${(m / 1000).toFixed(m < 9500 ? 1 : 0)} km`)
export const formatDuration = (s: number) => {
  const min = Math.max(1, Math.round(s / 60))
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`
}
