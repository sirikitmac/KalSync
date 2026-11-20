import L from 'leaflet'
import { Fragment, useEffect } from 'react'
import { Circle, MapContainer, Marker, Polyline, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import { useApp } from '../../context/AppContext'
import { getCategory, isActiveStatus } from '../../data/categories'
import { SCOPES } from '../../data/locations'
import { NEARBY_KM } from '../../lib/reportUtils'
import type { Coordinates, Report } from '../../types/report'
import { BaseTiles } from '../map/BaseTiles'
import { categoryIcon, meIcon } from '../map/markerIcon'

interface AppMapProps {
  reports: Report[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  /** Space covered by the sheet/panel, so focused markers stay visible. */
  insets: { bottom: number; left: number }
  onReady?: (map: L.Map) => void
}

/** Pans so a point lands in the middle of the area not covered by the sheet or side panel. */
export function flyIntoView(map: L.Map, c: Coordinates, zoom: number, insets: { bottom: number; left: number }) {
  const z = Math.max(map.getZoom(), zoom)
  const p = map.project([c.lat, c.lng], z).add([-insets.left / 2, insets.bottom / 2])
  map.flyTo(map.unproject(p, z), z, { duration: 0.8, easeLinearity: 0.2 })
}

function Controller({ selected, insets, onReady, onSelect }: { selected: Report | null; insets: AppMapProps['insets']; onReady?: AppMapProps['onReady']; onSelect: AppMapProps['onSelect'] }) {
  const map = useMap()
  const { focus } = useApp()

  useEffect(() => {
    onReady?.(map)
  }, [map, onReady])

  useEffect(() => {
    if (focus) flyIntoView(map, focus.coordinates, focus.zoom, insets)
    // insets intentionally not a dependency: only re-fly when the focus changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, map])

  useEffect(() => {
    if (selected?.coordinates) flyIntoView(map, selected.coordinates, 15, insets)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, map])

  useMapEvents({ click: () => onSelect(null) })
  return null
}

export function AppMap({ reports, selectedId, onSelect, insets, onReady }: AppMapProps) {
  const { userLocation } = useApp()
  const cfg = SCOPES.iligan
  const pinned = reports.filter((r) => r.coordinates)
  const lines = reports.filter((r) => isActiveStatus(r.status) && (r.segment || r.detour?.path))
  const selected = reports.find((r) => r.id === selectedId) ?? null

  return (
    <MapContainer
      center={[cfg.center.lat, cfg.center.lng]}
      zoom={cfg.zoom}
      minZoom={11}
      maxBounds={[
        [7.9, 123.9],
        [8.55, 124.6],
      ]}
      zoomControl={false}
      attributionControl
      className="absolute inset-0 z-0 size-full"
      aria-label={`Road map of ${cfg.label}`}
    >
      <BaseTiles />
      <Controller selected={selected} insets={insets} onReady={onReady} onSelect={onSelect} />
      {lines.map((r) => (
        <Fragment key={`lines-${r.id}`}>
          {r.segment && (
            <Polyline
              positions={r.segment.map((c) => [c.lat, c.lng] as [number, number])}
              pathOptions={{ color: r.roadStatus?.kind === 'closed' ? '#DC2626' : '#F97316', weight: 7, opacity: 0.9, lineCap: 'round' }}
              eventHandlers={{ click: (e) => (L.DomEvent.stopPropagation(e), onSelect(r.id)) }}
            >
              <Tooltip sticky>
                {r.roadStatus?.kind === 'closed' ? 'Closed' : 'Affected'}: {r.title}
              </Tooltip>
            </Polyline>
          )}
          {r.detour?.path && (
            <Polyline
              positions={r.detour.path.map((c) => [c.lat, c.lng] as [number, number])}
              pathOptions={{ color: '#16A34A', weight: 5, opacity: 0.95, dashArray: '10 10', lineCap: 'round' }}
            >
              <Tooltip sticky>Detour: {r.detour.description}</Tooltip>
            </Polyline>
          )}
        </Fragment>
      ))}
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
          eventHandlers={{ click: () => onSelect(r.id) }}
        />
      ))}
      {userLocation && (
        <>
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={NEARBY_KM * 1000}
            pathOptions={{ color: '#2563EB', weight: 1, fillOpacity: 0.05, dashArray: '4 6' }}
          />
          <Marker position={[userLocation.lat, userLocation.lng]} icon={meIcon} title="Your location" />
        </>
      )}
    </MapContainer>
  )
}
