import { Layer, Map, Marker, Source, type MapLayerMouseEvent, type MapRef } from '@vis.gl/react-maplibre'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { useEffect, useMemo, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { getCategory, isActiveStatus } from '../../data/categories'
import { SCOPES } from '../../data/locations'
import { NEARBY_KM, severityOf } from '../../lib/reportUtils'
import type { Coordinates, Report } from '../../types/report'
import { CarArrow, FlagPin, MapPin, MePin } from '../map/MapPin'
import { ILIGAN_BOUNDS, useMapStyle } from '../map/mapSetup'

interface AppMapProps {
  reports: Report[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  /** Space covered by the sheet/panel, so focused places stay visible. */
  insets: { bottom: number; left: number }
  onReady?: (map: MapLibreMap) => void
  /** Drive mode: the route line and destination flag. */
  route?: [number, number][] | null
  destination?: Coordinates | null
  /** Drive mode: a tap on empty map (used to drop a destination). */
  onMapClick?: (c: Coordinates) => void
  /** Drive mode: raise buildings in 3D. */
  buildings3d?: boolean
  /** Drive mode: direction of travel; shows the user as an arrow instead of a dot. */
  heading?: number | null
}

/** Flies to a point, keeping it in the part of the map not covered by the sheet or side panel. */
export function flyIntoView(map: MapLibreMap, c: Coordinates, zoom: number, insets: { bottom: number; left: number }) {
  map.flyTo({
    center: [c.lng, c.lat],
    zoom: Math.max(map.getZoom(), zoom),
    padding: { top: 0, bottom: insets.bottom, left: insets.left, right: 0 },
    duration: 900,
    essential: true,
  })
}

/** 64-point polygon approximating a circle, for the "near me" radius. */
function circle(c: Coordinates, km: number) {
  const pts: [number, number][] = []
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2
    const dLat = (km / 111.32) * Math.sin(a)
    const dLng = (km / (111.32 * Math.cos((c.lat * Math.PI) / 180))) * Math.cos(a)
    pts.push([c.lng + dLng, c.lat + dLat])
  }
  return { type: 'Feature' as const, properties: {}, geometry: { type: 'Polygon' as const, coordinates: [pts] } }
}

export function AppMap({ reports, selectedId, onSelect, insets, onReady, route, destination, onMapClick, buildings3d, heading }: AppMapProps) {
  const { userLocation, focus } = useApp()
  const style = useMapStyle()
  const ref = useRef<MapRef>(null)
  const cfg = SCOPES.iligan
  const pinned = reports.filter((r) => r.coordinates)
  const selected = reports.find((r) => r.id === selectedId) ?? null

  const lines = useMemo(() => {
    const active = reports.filter((r) => isActiveStatus(r.status))
    return {
      segments: {
        type: 'FeatureCollection' as const,
        features: active
          .filter((r) => r.segment)
          .map((r) => ({
            type: 'Feature' as const,
            properties: { id: r.id, closed: r.roadStatus?.kind === 'closed' },
            geometry: { type: 'LineString' as const, coordinates: r.segment!.map((p) => [p.lng, p.lat]) },
          })),
      },
      detours: {
        type: 'FeatureCollection' as const,
        features: active
          .filter((r) => r.detour?.path)
          .map((r) => ({
            type: 'Feature' as const,
            properties: { id: r.id },
            geometry: { type: 'LineString' as const, coordinates: r.detour!.path!.map((p) => [p.lng, p.lat]) },
          })),
      },
    }
  }, [reports])

  // Keep the map's visual center in the area the sheet or side panel leaves open.
  useEffect(() => {
    ref.current?.getMap().easeTo({ padding: { top: 0, right: 0, bottom: insets.bottom, left: insets.left }, duration: 450 })
  }, [insets.bottom, insets.left])

  // Re-fly when a place is searched or a report is selected.
  useEffect(() => {
    const map = ref.current?.getMap()
    if (map && focus) flyIntoView(map, focus.coordinates, focus.zoom, insets)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus])
  useEffect(() => {
    const map = ref.current?.getMap()
    if (map && selected?.coordinates) flyIntoView(map, selected.coordinates, 15, insets)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id])

  const onClick = (e: MapLayerMouseEvent) => {
    const id = e.features?.[0]?.properties?.id as string | undefined
    if (!id && onMapClick) {
      onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat })
      return
    }
    onSelect(id ?? null)
  }

  // 3D buildings from the OpenFreeMap tiles while driving. Re-added if the style reloads (theme change).
  useEffect(() => {
    const map = ref.current?.getMap()
    if (!map) return
    const apply = () => {
      const has = map.getLayer('kd-buildings-3d')
      if (!buildings3d) {
        if (has) map.removeLayer('kd-buildings-3d')
        return
      }
      if (has || !map.getSource('openmaptiles')) return
      try {
        map.addLayer({
          id: 'kd-buildings-3d',
          type: 'fill-extrusion',
          source: 'openmaptiles',
          'source-layer': 'building',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': style.includes('dark') ? '#2b3138' : '#dfe2e6',
            'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 8],
            'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
            'fill-extrusion-opacity': 0.8,
          },
        })
      } catch {
        /* the style has no building layer: stay flat */
      }
    }
    if (map.isStyleLoaded()) apply()
    map.on('styledata', apply)
    return () => {
      map.off('styledata', apply)
    }
  }, [buildings3d, style])

  const routeData = useMemo(
    () =>
      route && route.length > 1
        ? { type: 'Feature' as const, properties: {}, geometry: { type: 'LineString' as const, coordinates: route } }
        : null,
    [route],
  )

  return (
    <Map
      ref={ref}
      mapStyle={style}
      initialViewState={{ longitude: cfg.center.lng, latitude: cfg.center.lat, zoom: cfg.zoom }}
      minZoom={10.5}
      maxZoom={19}
      maxBounds={ILIGAN_BOUNDS}
      style={{ position: 'absolute', inset: 0 }}
      interactiveLayerIds={['segments-hit']}
      onClick={onClick}
      onLoad={(e) => {
        e.target.setPadding({ top: 0, right: 0, bottom: insets.bottom, left: insets.left })
        onReady?.(e.target)
      }}
      attributionControl={{ compact: true }}
      dragRotate
      touchPitch={false}
    >
      <Source id="segments" type="geojson" data={lines.segments}>
        <Layer
          id="segments-line"
          type="line"
          layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          paint={{ 'line-color': ['case', ['get', 'closed'], '#DC2626', '#F97316'], 'line-width': 7, 'line-opacity': 0.9 }}
        />
        <Layer id="segments-hit" type="line" paint={{ 'line-color': '#000', 'line-width': 22, 'line-opacity': 0 }} />
      </Source>
      <Source id="detours" type="geojson" data={lines.detours}>
        <Layer
          id="detours-line"
          type="line"
          layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          paint={{ 'line-color': '#16A34A', 'line-width': 5, 'line-dasharray': [1.6, 1.4] }}
        />
      </Source>
      {routeData && (
        <Source id="route" type="geojson" data={routeData}>
          <Layer id="route-casing" type="line" layout={{ 'line-cap': 'round', 'line-join': 'round' }} paint={{ 'line-color': '#1E3A8A', 'line-width': 11, 'line-opacity': 0.35 }} />
          <Layer id="route-line" type="line" layout={{ 'line-cap': 'round', 'line-join': 'round' }} paint={{ 'line-color': '#3B6BF5', 'line-width': 7 }} />
        </Source>
      )}
      {userLocation && !routeData && (
        <Source id="near-me" type="geojson" data={circle(userLocation, NEARBY_KM)}>
          <Layer id="near-me-fill" type="fill" paint={{ 'fill-color': '#2563EB', 'fill-opacity': 0.05 }} />
          <Layer id="near-me-line" type="line" paint={{ 'line-color': '#2563EB', 'line-width': 1, 'line-dasharray': [2, 3] }} />
        </Source>
      )}

      {pinned.map((r) => (
        <Marker
          key={r.id}
          longitude={r.coordinates!.lng}
          latitude={r.coordinates!.lat}
          anchor="bottom"
          offset={[0, 4]}
          style={{ zIndex: r.id === selectedId ? 3 : r.source === 'user' ? 2 : 1 }}
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            onSelect(r.id)
          }}
        >
          <button type="button" aria-label={`${getCategory(r.category).label}: ${r.title}`} className="block cursor-pointer">
            <MapPin category={r.category} severity={severityOf(r)} status={r.status} selected={r.id === selectedId} mine={r.source === 'user'} />
          </button>
        </Marker>
      ))}
      {destination && (
        <Marker longitude={destination.lng} latitude={destination.lat} anchor="bottom">
          <FlagPin />
        </Marker>
      )}
      {userLocation && (
        <Marker
          longitude={userLocation.lng}
          latitude={userLocation.lat}
          anchor="center"
          pitchAlignment={heading != null ? 'map' : 'auto'}
          rotationAlignment={heading != null ? 'map' : 'auto'}
          rotation={heading ?? 0}
          style={{ zIndex: 4 }}
        >
          {heading != null ? <CarArrow /> : <MePin />}
        </Marker>
      )}
    </Map>
  )
}
