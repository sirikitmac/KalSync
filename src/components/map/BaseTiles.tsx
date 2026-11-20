import { TileLayer } from 'react-leaflet'

/**
 * OpenStreetMap tiles (no API key). Colors are softened with CSS, and the
 * dark theme inverts them (see .kd-tiles in index.css).
 */
export function BaseTiles() {
  return (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      maxZoom={19}
      className="kd-tiles"
    />
  )
}
