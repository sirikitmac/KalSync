import { useCallback, useEffect, useRef, useState } from 'react'
import type { Coordinates } from '../types/report'

type GeoState = 'idle' | 'locating' | 'granted' | 'denied' | 'unavailable'

/** Opt-in browser geolocation. Never called automatically. */
export function useGeolocation() {
  const [state, setState] = useState<GeoState>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const locate = useCallback((): Promise<Coordinates | null> => {
    if (!('geolocation' in navigator)) {
      setState('unavailable')
      setMessage('Location isn’t available in this browser. You can search or pin the location instead.')
      return Promise.resolve(null)
    }
    setState('locating')
    setMessage(null)
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setState('granted')
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        (err) => {
          setState(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable')
          setMessage(
            err.code === err.PERMISSION_DENIED
              ? 'Location permission was declined. That’s okay. Search or pin the location instead.'
              : 'We couldn’t get your location. Try searching or pinning it on the map.',
          )
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      )
    })
  }, [])

  return { state, message, locate }
}

/**
 * Live location for follow mode. Calls onFix on every position update until stop() is called.
 * Only starts when the person presses the location button.
 */
export function useLiveLocation(onFix: (c: Coordinates, first: boolean) => void) {
  const [state, setState] = useState<GeoState>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const watchId = useRef<number | null>(null)
  const first = useRef(true)
  const cb = useRef(onFix)
  useEffect(() => {
    cb.current = onFix
  }, [onFix])

  const stop = useCallback(() => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
    watchId.current = null
    setState('idle')
  }, [])

  const start = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState('unavailable')
      setMessage('Location isn’t available in this browser.')
      return
    }
    if (watchId.current !== null) return
    first.current = true
    setState('locating')
    setMessage(null)
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState('granted')
        cb.current({ lat: pos.coords.latitude, lng: pos.coords.longitude }, first.current)
        first.current = false
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setState('denied')
          setMessage('Location permission was declined. Allow it in your browser settings to follow your position.')
          if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
          watchId.current = null
        } else if (first.current) {
          setState('unavailable')
          setMessage('We couldn’t get your location yet. Make sure GPS is on.')
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    )
  }, [])

  useEffect(() => () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
  }, [])

  return { state, message, start, stop, watching: state === 'locating' || state === 'granted' }
}
