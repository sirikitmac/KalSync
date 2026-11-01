import { useCallback, useState } from 'react'
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
              ? 'Location permission was declined. That’s okay — search or pin the location instead.'
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
