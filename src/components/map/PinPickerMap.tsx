import { useEffect } from 'react'
import type { Marker as LeafletMarker } from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { Coordinates } from '../../types/report'
import { pinIcon } from './markerIcon'

interface Props {
  value?: Coordinates
  center: Coordinates
  zoom?: number
  onChange: (c: Coordinates) => void
}

function ClickHandler({ onChange }: { onChange: (c: Coordinates) => void }) {
  useMapEvents({ click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}

function Recenter({ center, zoom }: { center: Coordinates; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([center.lat, center.lng], zoom, { duration: 0.6 })
  }, [center.lat, center.lng, zoom, map])
  return null
}

/** Small map for manually placing a report pin. Tap anywhere or drag the pin. `center` changes trigger a fly-to. */
export function PinPickerMap({ value, center, zoom = 15, onChange }: Props) {
  const c = value ?? center
  return (
    <MapContainer center={[c.lat, c.lng]} zoom={zoom} className="h-56 w-full rounded-xl" scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onChange={onChange} />
      <Recenter center={center} zoom={zoom} />
      {value && (
        <Marker
          position={[value.lat, value.lng]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const ll = (e.target as LeafletMarker).getLatLng()
              onChange({ lat: ll.lat, lng: ll.lng })
            },
          }}
        />
      )}
    </MapContainer>
  )
}
