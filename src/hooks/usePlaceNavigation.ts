import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useReports } from '../context/ReportsContext'
import { ILIGAN_CITY, type Place } from '../data/locations'

/** Jump the map to a searched place, switching scope when it's outside Iligan. */
export function usePlaceNavigation() {
  const { setScope, setFocus, pushToast, scope } = useApp()
  const { reports } = useReports()
  const navigate = useNavigate()

  return useCallback(
    (place: Place, { scroll = true }: { scroll?: boolean } = {}) => {
      const outside = place.city !== ILIGAN_CITY
      if (outside && scope === 'iligan') setScope('philippines')
      window.setTimeout(
        () => setFocus({ coordinates: place.coordinates, label: place.name, zoom: place.kind === 'city' ? 12 : 15 }),
        0,
      )
      const count = reports.filter((r) => r.city === place.city).length
      if (count === 0) {
        pushToast({
          tone: 'info',
          title: `No reports in ${place.city} yet`,
          description: 'KalSync is launching in Iligan City first. Be the first to report a road issue here.',
        })
      }
      if (scroll) {
        navigate('/#map')
        window.setTimeout(() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
      }
    },
    [setScope, setFocus, pushToast, scope, reports, navigate],
  )
}
