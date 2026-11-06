import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useReports } from '../context/ReportsContext'
import type { Place } from '../data/locations'

/** Jump the map to a searched Iligan place. */
export function usePlaceNavigation() {
  const { setFocus, pushToast } = useApp()
  const { reports } = useReports()
  const navigate = useNavigate()

  return useCallback(
    (place: Place, { scroll = true }: { scroll?: boolean } = {}) => {
      setFocus({ coordinates: place.coordinates, label: place.name, zoom: place.kind === 'city' ? 13 : 15 })
      if (place.kind !== 'city') {
        const key = place.name.toLowerCase()
        const count = reports.filter((r) => `${r.location} ${r.barangay ?? ''}`.toLowerCase().includes(key)).length
        if (count === 0) pushToast({ tone: 'info', title: `No reports near ${place.name} yet`, description: 'Be the first to report a road issue here.' })
      }
      if (scroll) {
        navigate('/#map')
        window.setTimeout(() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
      }
    },
    [setFocus, pushToast, reports, navigate],
  )
}
