import { Map, Marker, type MapRef } from '@vis.gl/react-maplibre'
import { useEffect, useRef } from 'react'
import type { Coordinates } from '../../types/report'
import { DropPin } from './MapPin'
import { ILIGAN_BOUNDS, useMapStyle } from './mapSetup'

interface Props {
  value?: Coordinates
  center: Coordinates
  zoom?: number
  onChange: (c: Coordinates) => void
}

/** Small map for placing a report pin. Tap anywhere or drag the pin. `center` changes trigger a fly-to. */
export function PinPickerMap({ value, center, zoom = 15, onChange }: Props) {
  const style = useMapStyle()
  const ref = useRef<MapRef>(null)
  const c = value ?? center

  useEffect(() => {
    ref.current?.flyTo({ center: [center.lng, center.lat], zoom, duration: 600 })
  }, [center.lat, center.lng, zoom])

  return (
    <div className="relative h-56 w-full overflow-hidden rounded-xl">
      <Map
        ref={ref}
        mapStyle={style}
        initialViewState={{ longitude: c.lng, latitude: c.lat, zoom }}
        maxBounds={ILIGAN_BOUNDS}
        style={{ position: 'absolute', inset: 0 }}
        scrollZoom={false}
        dragRotate={false}
        touchPitch={false}
        attributionControl={{ compact: true }}
        onClick={(e) => onChange({ lat: e.lngLat.lat, lng: e.lngLat.lng })}
      >
        {value && (
          <Marker
            longitude={value.lng}
            latitude={value.lat}
            anchor="bottom"
            offset={[0, 4]}
            draggable
            onDragEnd={(e) => onChange({ lat: e.lngLat.lat, lng: e.lngLat.lng })}
          >
            <DropPin />
          </Marker>
        )}
      </Map>
    </div>
  )
}
