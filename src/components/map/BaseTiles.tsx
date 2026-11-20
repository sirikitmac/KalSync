import { TileLayer } from 'react-leaflet'
import { useTheme } from '../../context/ThemeContext'

/** Clean basemap (CARTO Voyager / Dark Matter on OpenStreetMap data) that follows the app theme. */
export function BaseTiles() {
  const { resolved } = useTheme()
  const style = resolved === 'dark' ? 'dark_all' : 'rastertiles/voyager'
  return (
    <TileLayer
      key={style}
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      url={`https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png`}
      subdomains="abcd"
      maxZoom={20}
    />
  )
}
