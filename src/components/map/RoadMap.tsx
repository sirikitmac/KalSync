import { LoaderCircle, LocateFixed, MapPinOff, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useApp } from '../../context/AppContext'
import { useReports } from '../../context/ReportsContext'
import { getCategory, isActiveStatus } from '../../data/categories'
import { SCOPES, distanceKm } from '../../data/locations'
import { useGeolocation } from '../../hooks/useGeolocation'
import { cn } from '../../lib/cn'
import { NEARBY_KM, filterReports, formatRelative } from '../../lib/reportUtils'
import type { IncidentCategory, Report } from '../../types/report'
import { SourceBadge, StatusBadge } from '../common/Badge'
import { Button } from '../common/Button'
import { ConfirmButton } from '../reports/ConfirmButton'
import { ReportImage } from '../reports/ReportImage'
import { MapFilters } from './MapFilters'
import { categoryIcon, meIcon } from './markerIcon'

/** Keeps the Leaflet view in sync with scope, place focus and the user's location. */
function ViewController() {
  const map = useMap()
  const { scope, focus } = useApp()
  useEffect(() => {
    const cfg = SCOPES[scope]
    if (cfg.bounds) map.flyToBounds(cfg.bounds, { duration: 0.9, padding: [12, 12] })
    else map.flyTo([cfg.center.lat, cfg.center.lng], cfg.zoom, { duration: 0.9 })
  }, [scope, map])
  useEffect(() => {
    if (focus) map.flyTo([focus.coordinates.lat, focus.coordinates.lng], focus.zoom, { duration: 0.9 })
  }, [focus, map])
  return null
}

function DeselectOnMapClick({ onClick }: { onClick: () => void }) {
  useMapEvents({ click: onClick })
  return null
}

function FlyTo({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 14, { duration: 0.8 })
  }, [target, map])
  return null
}

export function RoadMap({ className }: { className?: string }) {
  const { scope, userLocation, setUserLocation, openReport, pushToast } = useApp()
  const { reports, confirmedIds } = useReports()
  const [categories, setCategories] = useState<IncidentCategory[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null)
  const geo = useGeolocation()

  const scoped = useMemo(
    () => filterReports(reports, scope, { categories, statuses: [], query: '', sort: 'newest' }, confirmedIds),
    [reports, scope, categories, confirmedIds],
  )
  const pinned = scoped.filter((r) => r.coordinates)
  const unpinned = scoped.length - pinned.length
  const selected = scoped.find((r) => r.id === selectedId) ?? null

  useEffect(() => setSelectedId(null), [scope])

  const cfg = SCOPES[scope]

  const nearMe = async () => {
    const c = await geo.locate()
    if (!c) {
      pushToast({ tone: 'info', title: 'Location not available', description: 'You can still browse and search the map.' })
      return
    }
    setUserLocation(c)
    setFlyTarget({ ...c })
    const near = reports.filter((r) => r.coordinates && isActiveStatus(r.status) && distanceKm(c, r.coordinates) <= NEARBY_KM)
    pushToast({
      tone: near.length ? 'alert' : 'info',
      title: near.length ? `${near.length} report${near.length > 1 ? 's' : ''} within ${NEARBY_KM} km of you` : `No reports within ${NEARBY_KM} km of you`,
      description: 'Nearby reports are highlighted in amber. Your location stays in this browser.',
    })
  }

  return (
    <div className={cn('relative isolate overflow-hidden rounded-3xl border border-line bg-white shadow-card', className)}>
      <MapContainer
        center={[cfg.center.lat, cfg.center.lng]}
        zoom={cfg.zoom}
        minZoom={5}
        maxBounds={[
          [2, 112],
          [23, 131],
        ]}
        className="h-[min(72dvh,620px)] min-h-[440px] w-full"
        scrollWheelZoom={false}
        aria-label={`Road map of ${cfg.label}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ViewController />
        <FlyTo target={flyTarget} />
        <DeselectOnMapClick onClick={() => setSelectedId(null)} />
        {pinned.map((r) => (
          <Marker
            key={r.id}
            position={[r.coordinates!.lat, r.coordinates!.lng]}
            icon={categoryIcon(r.category, { status: r.status, selected: r.id === selectedId, mine: r.source === 'user' })}
            title={r.title}
            alt={`${getCategory(r.category).label}: ${r.title}`}
            keyboard
            riseOnHover
            zIndexOffset={r.id === selectedId ? 1000 : r.source === 'user' ? 500 : 0}
            eventHandlers={{ click: () => setSelectedId(r.id) }}
          />
        ))}
        {userLocation && (
          <>
            <Circle center={[userLocation.lat, userLocation.lng]} radius={NEARBY_KM * 1000} pathOptions={{ color: '#F59E0B', weight: 1.5, fillOpacity: 0.06, dashArray: '6 6' }} />
            <Marker position={[userLocation.lat, userLocation.lng]} icon={meIcon} title="Your location" />
          </>
        )}
      </MapContainer>

      {/* Top overlay: filters + near me */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex flex-col gap-2 p-3 sm:p-4">
        <div className="pointer-events-auto flex items-start justify-between gap-2 pl-12 sm:pl-14">
          <MapFilters value={categories} onChange={setCategories} />
          <Button size="sm" variant="secondary" className="h-10 shrink-0" onClick={() => void nearMe()} disabled={geo.state === 'locating'} aria-label="Show reports near me">
            {geo.state === 'locating' ? <LoaderCircle className="size-4 animate-spin" /> : <LocateFixed className="size-4 text-brand" />}
            <span className="hidden sm:inline">Near me</span>
          </Button>
        </div>
      </div>

      {/* Bottom-left status chip */}
      {!selected && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2 sm:bottom-4 sm:left-4">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink shadow-card backdrop-blur">
            {pinned.length} on map · {cfg.label}
          </span>
          {unpinned > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-muted shadow-card backdrop-blur">
              <MapPinOff className="size-3" /> {unpinned} without a pin (list only)
            </span>
          )}
          <span className="rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">Sample data · not live</span>
        </div>
      )}

      {/* Selected incident preview — bottom sheet on mobile, floating card on desktop */}
      {selected && <MarkerPreview report={selected} onClose={() => setSelectedId(null)} onOpen={() => openReport(selected.id)} />}
    </div>
  )
}

function MarkerPreview({ report, onClose, onOpen }: { report: Report; onClose: () => void; onOpen: () => void }) {
  const cat = getCategory(report.category)
  return (
    <div className="absolute inset-x-0 bottom-0 z-[600] animate-sheet-up p-2 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[380px] sm:p-0">
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
        <div className="flex gap-3 p-3">
          <ReportImage report={report} className="size-22 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold" style={{ color: cat.color }}>
                {cat.label}
              </p>
              <button onClick={onClose} className="-mt-1.5 -mr-1.5 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-muted hover:bg-ink/5" aria-label="Close preview">
                <X className="size-4" />
              </button>
            </div>
            <h4 className="-mt-1 line-clamp-2 font-sans text-[15px] leading-snug font-bold">{report.title}</h4>
            <p className="mt-0.5 truncate text-xs text-muted">
              {report.location} · {formatRelative(report.createdAt)}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <StatusBadge status={report.status} />
              <SourceBadge source={report.source} compact />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-line p-2.5">
          <ConfirmButton report={report} />
          <Button size="sm" className="ml-auto h-11" onClick={onOpen}>
            View details
          </Button>
        </div>
      </div>
    </div>
  )
}

