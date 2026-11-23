import type { Map as MapLibreMap } from 'maplibre-gl'
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { getCategory } from '../data/categories'
import { severityOf } from '../lib/reportUtils'
import { fetchRoute, locate, pointAt, type Route } from '../lib/route'
import type { Coordinates, Report } from '../types/report'

export type DrivePhase = 'idle' | 'pick' | 'preview' | 'driving'
export type DriveView = '3d' | '2d'
export interface Destination {
  coordinates: Coordinates
  label: string
}
export interface Hazard {
  report: Report
  /** Metres from the start of the route. */
  along: number
}

/** Reports farther than this from the route are hidden while driving. */
export const ROUTE_BUFFER_M = 120
const ARRIVED_M = 35
const OFF_ROUTE_M = 60
const DEMO_SPEED = 14 // m/s, about 50 km/h
/** Spoken warnings: once at about 300 m, once again when close. */
const SAY_FAR_M = 300
const SAY_NEAR_M = 60
const VOICE_KEY = 'kadaan:drive-voice'

const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window

function say(text: string) {
  if (!canSpeak()) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 1
  window.speechSynthesis.speak(u)
}

const roundTo50 = (m: number) => Math.max(50, Math.round(m / 50) * 50)
const hazardName = (r: Report) => (r.roadStatus?.kind === 'closed' ? 'Official closure' : getCategory(r.category).label.split(' / ')[0])

interface Options {
  mapRef: RefObject<MapLibreMap | null>
  reports: Report[]
  setUserLocation: (c: Coordinates | null) => void
  notify: (title: string, description?: string, tone?: 'info' | 'success' | 'alert') => void
  /** Space covered by the drive overlays, so the car stays in the open part of the map. */
  padding: () => { top: number; bottom: number; left: number; right: number }
}

/**
 * Drive mode: pick a destination, get a road route, then follow the driver with a
 * tilted 3D (or flat 2D) camera and only the reports along the route.
 */
export function useDrive({ mapRef, reports, setUserLocation, notify, padding }: Options) {
  const [phase, setPhase] = useState<DrivePhase>('idle')
  const [dest, setDest] = useState<Destination | null>(null)
  const [route, setRoute] = useState<Route | null>(null)
  const [originGuessed, setOriginGuessed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<DriveView>('3d')
  const [along, setAlong] = useState(0)
  const [hasFix, setHasFix] = useState(false)
  const [following, setFollowing] = useState(true)
  const [demo, setDemo] = useState(false)
  const [heading, setHeading] = useState(0)
  const [voice, setVoiceState] = useState(() => {
    try {
      return localStorage.getItem(VOICE_KEY) !== 'off'
    } catch {
      return true
    }
  })
  const voiceRef = useRef(voice)
  voiceRef.current = voice
  const spoken = useRef(new Map<string, Set<'far' | 'near'>>())
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null)
  const speak = useCallback((text: string) => {
    if (voiceRef.current) say(text)
  }, [])
  const setVoice = (on: boolean) => {
    setVoiceState(on)
    voiceRef.current = on
    try {
      localStorage.setItem(VOICE_KEY, on ? 'on' : 'off')
    } catch {
      /* private mode */
    }
    if (!on && canSpeak()) window.speechSynthesis.cancel()
    if (on && live.current.phase === 'driving') say('Voice alerts on')
  }

  const pos = useRef<Coordinates | null>(null)
  const watchId = useRef<number | null>(null)
  const demoTimer = useRef<number | null>(null)
  const abort = useRef<AbortController | null>(null)
  const offCount = useRef(0)
  const lastReroute = useRef(0)
  // Latest values for callbacks that outlive a render (GPS and timers).
  const live = useRef({ phase, route, view, following, demo, dest })
  live.current = { phase, route, view, following, demo, dest }

  const camera = useCallback(
    (c: Coordinates, heading: number, duration = 900) => {
      const m = mapRef.current
      if (!m) return
      const v = live.current.view
      m.easeTo({
        center: [c.lng, c.lat],
        bearing: v === '3d' ? heading : 0,
        pitch: v === '3d' ? 60 : 0,
        zoom: v === '3d' ? 17 : 16,
        padding: padding(),
        duration,
        essential: true,
      })
    },
    [mapRef, padding],
  )

  const stopDemo = () => {
    if (demoTimer.current !== null) window.clearInterval(demoTimer.current)
    demoTimer.current = null
    setDemo(false)
  }

  const stopWatch = () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
    watchId.current = null
  }

  const end = useCallback(
    (arrived = false) => {
      stopDemo()
      stopWatch()
      abort.current?.abort()
      if (canSpeak()) window.speechSynthesis.cancel()
      void wakeLock.current?.release().catch(() => {})
      wakeLock.current = null
      spoken.current.clear()
      if (arrived) speak('You have arrived')
      setPhase('idle')
      setRoute(null)
      setDest(null)
      setAlong(0)
      setHasFix(false)
      setFollowing(true)
      setUserLocation(null)
      pos.current = null
      mapRef.current?.easeTo({ pitch: 0, bearing: 0, duration: 700 })
      if (arrived) notify('You have arrived', live.current.dest?.label, 'success')
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapRef, notify, setUserLocation, speak],
  )

  const reroute = useCallback(
    async (from: Coordinates) => {
      const d = live.current.dest
      if (!d) return
      lastReroute.current = Date.now()
      abort.current?.abort()
      abort.current = new AbortController()
      try {
        const r = await fetchRoute(from, d.coordinates, abort.current.signal)
        setRoute(r)
        notify('New route', 'You left the planned route, so KaDaan found a new one.')
        speak('New route')
      } catch {
        /* aborted */
      }
    },
    [notify, speak],
  )

  /** Every GPS fix (or demo step) passes through here. */
  const onFix = useCallback(
    (c: Coordinates, fromDemo = false) => {
      pos.current = c
      setHasFix(true)
      setUserLocation(c)
      const { phase: ph, route: r, following: f } = live.current
      if (ph !== 'driving' || !r) return
      const at = locate(r, c)
      setAlong(at.along)
      setHeading(at.heading)
      if (r.distance - at.along < ARRIVED_M) {
        end(true)
        return
      }
      if (!fromDemo && at.offset > OFF_ROUTE_M) {
        offCount.current += 1
        if (offCount.current >= 2 && Date.now() - lastReroute.current > 15000) void reroute(c)
      } else offCount.current = 0
      if (f) camera(c, at.heading, fromDemo ? 280 : 900)
    },
    [camera, end, reroute, setUserLocation],
  )

  const startWatch = () => {
    if (watchId.current !== null || !('geolocation' in navigator)) return
    watchId.current = navigator.geolocation.watchPosition(
      (p) => !live.current.demo && onFix({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {
        /* no location: the route still works from the map centre */
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 20000 },
    )
  }

  const start = () => {
    setPhase('pick')
    setRoute(null)
    setDest(null)
    startWatch()
  }

  const choose = async (d: Destination) => {
    setDest(d)
    live.current.dest = d
    setLoading(true)
    const m = mapRef.current
    const from = pos.current ?? (m ? { lng: m.getCenter().lng, lat: m.getCenter().lat } : d.coordinates)
    setOriginGuessed(!pos.current)
    abort.current?.abort()
    abort.current = new AbortController()
    try {
      const r = await fetchRoute(from, d.coordinates, abort.current.signal)
      setRoute(r)
      setPhase('preview')
      if (r.approximate) notify('Showing a straight line', 'The route server could not be reached, so the line is only a guide.', 'info')
      if (m) {
        let w = 180, s = 90, e = -180, n = -90
        for (const [x, y] of r.coords) {
          w = Math.min(w, x); e = Math.max(e, x); s = Math.min(s, y); n = Math.max(n, y)
        }
        m.fitBounds(
          [
            [w, s],
            [e, n],
          ],
          { padding: { ...padding(), top: padding().top + 60, left: padding().left + 40, right: padding().right + 40, bottom: padding().bottom + 40 }, pitch: 0, bearing: 0, duration: 900, maxZoom: 16 },
        )
      }
    } catch {
      /* aborted by a newer choice */
    } finally {
      setLoading(false)
    }
  }

  const go = () => {
    if (!route) return
    setPhase('driving')
    live.current.phase = 'driving'
    setFollowing(true)
    live.current.following = true
    const c = pos.current ?? pointAt(route, 0)
    const at = locate(route, c)
    setAlong(at.along)
    setHeading(at.heading)
    camera(c, at.heading, 1200)
    spoken.current.clear()
    // Speaking inside the tap also unlocks audio on iPhone.
    const n = hazards.length
    speak(`Starting route to ${dest?.label ?? 'your destination'}. ${n ? `${n} report${n > 1 ? 's' : ''} on your route.` : 'No reports on your route.'}`)
    // Keep the screen on while driving (ignored where not supported).
    const wl = (navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock
    void wl
      ?.request('screen')
      .then((l) => (wakeLock.current = l))
      .catch(() => {})
  }

  /** Demo drive for presentations: moves along the route at about 50 km/h. */
  const simulate = () => {
    if (!route) return
    stopDemo()
    setDemo(true)
    live.current.demo = true
    go()
    let d = 0
    demoTimer.current = window.setInterval(() => {
      const r = live.current.route
      if (!r) return
      d += DEMO_SPEED * 0.3 * 2 // twice real speed so a demo does not take long
      onFix(pointAt(r, Math.min(d, r.distance)), true)
    }, 300)
  }

  const toggleView = () => {
    const next: DriveView = view === '3d' ? '2d' : '3d'
    setView(next)
    live.current.view = next
    const r = live.current.route
    const c = pos.current
    if (r && c && live.current.phase === 'driving') camera(c, locate(r, c).heading, 700)
  }

  const recenter = () => {
    setFollowing(true)
    live.current.following = true
    const r = live.current.route
    const c = pos.current ?? (r ? pointAt(r, 0) : null)
    if (r && c) camera(c, locate(r, c).heading, 700)
  }

  // Dragging the map while driving pauses the camera; "Recenter" brings it back.
  useEffect(() => {
    const m = mapRef.current
    if (!m || phase !== 'driving') return
    const onDrag = () => setFollowing(false)
    m.on('dragstart', onDrag)
    return () => {
      m.off('dragstart', onDrag)
    }
  }, [mapRef, phase])

  useEffect(
    () => () => {
      stopDemo()
      stopWatch()
    },
    [],
  )

  const hazards = useMemo<Hazard[]>(() => {
    if (!route) return []
    return reports
      .filter((r) => r.coordinates)
      .map((r) => ({ report: r, at: locate(route, r.coordinates!) }))
      .filter((h) => h.at.offset <= ROUTE_BUFFER_M)
      .map((h) => ({ report: h.report, along: h.at.along }))
      .sort((a, b) => a.along - b.along)
  }, [route, reports])

  const ahead = useMemo(() => hazards.filter((h) => h.along >= along - 15), [hazards, along])
  // Spoken warnings for reports ahead.
  useEffect(() => {
    if (phase !== 'driving') return
    for (const h of ahead) {
      const d = h.along - along
      if (d > SAY_FAR_M) break
      const done = spoken.current.get(h.report.id) ?? new Set<'far' | 'near'>()
      const sev = severityOf(h.report)
      if (d <= SAY_NEAR_M && !done.has('near')) {
        done.add('near').add('far')
        speak(`${hazardName(h.report)} ahead.`)
      } else if (!done.has('far') && d > SAY_NEAR_M) {
        done.add('far')
        speak(`${sev === 'high' ? 'High severity. ' : ''}${hazardName(h.report)} in ${roundTo50(d)} meters. ${h.report.title}.`)
      }
      spoken.current.set(h.report.id, done)
    }
  }, [phase, ahead, along, speak])

  const remaining = route ? Math.max(0, route.distance - along) : 0
  const remainingTime = route && route.distance ? route.duration * (remaining / route.distance) : 0

  return {
    phase,
    active: phase !== 'idle',
    dest,
    route,
    loading,
    originGuessed,
    view,
    along,
    hasFix,
    following,
    demo,
    heading,
    voice,
    setVoice,
    canSpeak: canSpeak(),
    hazards,
    ahead,
    remaining,
    remainingTime,
    start,
    choose,
    go,
    simulate,
    end,
    toggleView,
    recenter,
    back: () => {
      setPhase('pick')
      setRoute(null)
    },
  }
}

export type Drive = ReturnType<typeof useDrive>
