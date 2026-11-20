import { setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'

// MapLibre 6 runs its tile worker from a separate file; point Vite at it once.
setWorkerUrl(workerUrl)

/** Free OpenFreeMap vector styles (no API key, no account). */
export const MAP_STYLES = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
} as const

// The Dark style is checked once; if it cannot be fetched, dark mode uses the light style.
let darkOk: Promise<boolean> | null = null
const checkDark = () =>
  (darkOk ??= fetch(MAP_STYLES.dark)
    .then((r) => r.ok)
    .catch(() => false))

export function useMapStyle() {
  const { resolved } = useTheme()
  const [darkAvailable, setDarkAvailable] = useState(true)
  useEffect(() => {
    if (resolved !== 'dark') return
    let live = true
    void checkDark().then((ok) => live && setDarkAvailable(ok))
    return () => {
      live = false
    }
  }, [resolved])
  return resolved === 'dark' && darkAvailable ? MAP_STYLES.dark : MAP_STYLES.light
}

/** Iligan City and its surroundings: the map cannot be panned far outside this. */
export const ILIGAN_BOUNDS: [number, number, number, number] = [123.9, 7.9, 124.6, 8.55]
