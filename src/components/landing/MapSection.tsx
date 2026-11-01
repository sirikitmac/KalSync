import { lazy, Suspense } from 'react'
import { CATEGORIES } from '../../data/categories'
import { useGeographicScope } from '../../hooks/useGeographicScope'
import { usePlaceNavigation } from '../../hooks/usePlaceNavigation'
import { PlaceSearch } from '../common/PlaceSearch'
import { ScopeToggle } from '../common/ScopeToggle'

const RoadMap = lazy(() => import('../map/RoadMap').then((m) => ({ default: m.RoadMap })))

export function MapSection() {
  const { config } = useGeographicScope()
  const goToPlace = usePlaceNavigation()
  return (
    <section id="map" aria-labelledby="map-title" className="container-page pt-24">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Interactive road map</p>
          <h2 id="map-title" className="section-title mt-2">
            The road, at a glance.
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            Tap a marker for details. Pulsing markers are potentially dangerous hazards. Viewing{' '}
            <span className="font-semibold text-ink">{config.label}</span>.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <PlaceSearch onSelect={(p) => goToPlace(p, { scroll: false })} placeholder="Search a place" className="sm:w-64" />
          <ScopeToggle size="sm" />
        </div>
      </div>

      <div className="mt-8">
        <Suspense fallback={<div className="grid h-[min(72dvh,620px)] min-h-[440px] animate-pulse place-items-center rounded-3xl border border-line bg-slate-100 text-sm text-muted">Loading map…</div>}>
          <RoadMap />
        </Suspense>
      </div>

      <ul className="no-scrollbar -mx-4 mt-4 flex gap-4 overflow-x-auto px-4 text-xs text-muted sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Map legend">
        {CATEGORIES.map((c) => (
          <li key={c.id} className="flex shrink-0 items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: c.color }} />
            {c.label}
          </li>
        ))}
        <li className="flex shrink-0 items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-slate-400" /> Resolved / rejected
        </li>
      </ul>
      <p className="mt-2 text-xs text-muted">Map data © OpenStreetMap contributors. Marker positions are approximate demonstration coordinates.</p>
    </section>
  )
}
