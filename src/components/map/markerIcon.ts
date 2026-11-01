import L from 'leaflet'
import { createElement } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { CATEGORIES, getCategory } from '../../data/categories'
import type { IncidentCategory, ReportStatus } from '../../types/report'

const cache = new Map<string, L.DivIcon>()
/**
 * Lucide icons rendered to SVG strings once, at module load (outside any React
 * render), so Leaflet divIcons can embed them without react-dom/server.
 */
function renderSvg(category: IncidentCategory) {
  const el = document.createElement('div')
  const root = createRoot(el)
  flushSync(() => root.render(createElement(getCategory(category).icon, { size: 16, color: '#fff', strokeWidth: 2.4 })))
  const html = el.innerHTML
  root.unmount()
  return html
}
const SVGS = Object.fromEntries(CATEGORIES.map((c) => [c.id, renderSvg(c.id)])) as Record<IncidentCategory, string>
const iconSvg = (category: IncidentCategory) => SVGS[category] ?? ''

/** Category-coloured teardrop marker with the category icon. 44px touch target. */
export function categoryIcon(category: IncidentCategory, opts: { status?: ReportStatus; selected?: boolean; mine?: boolean } = {}) {
  const key = `${category}|${opts.status}|${opts.selected}|${opts.mine}`
  const hit = cache.get(key)
  if (hit) return hit
  const c = getCategory(category)
  const muted = opts.status === 'resolved' || opts.status === 'rejected'
  const color = muted ? '#94A3B8' : c.color
  const icon = iconSvg(category)
  const scale = opts.selected ? 1.18 : 1
  const pulse =
    !muted && c.severity === 'high'
      ? `<span style="position:absolute;left:50%;top:17px;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:999px;background:${color};animation:ks-pulse 2s ease-out infinite"></span>`
      : ''
  const ring = opts.mine ? 'box-shadow:0 0 0 3px #fff,0 0 0 5px #14532D,0 6px 14px rgba(0,0,0,.25)' : 'box-shadow:0 0 0 2.5px #fff,0 6px 14px rgba(0,0,0,.25)'
  const html = `
    <div style="position:relative;width:44px;height:48px;transform:scale(${scale});transform-origin:50% 100%;transition:transform .15s">
      ${pulse}
      <span style="position:absolute;left:7px;top:2px;width:30px;height:30px;border-radius:999px 999px 999px 4px;transform:rotate(-45deg);background:${color};${ring}"></span>
      <span style="position:absolute;left:7px;top:2px;width:30px;height:30px;display:grid;place-items:center">${icon}</span>
    </div>`
  const divIcon = L.divIcon({ html, className: 'ks-marker', iconSize: [44, 48], iconAnchor: [22, 44] })
  cache.set(key, divIcon)
  return divIcon
}

export const pinIcon = L.divIcon({
  className: 'ks-marker',
  iconSize: [44, 48],
  iconAnchor: [22, 44],
  html: `<div style="position:relative;width:44px;height:48px">
    <span style="position:absolute;left:7px;top:2px;width:30px;height:30px;border-radius:999px 999px 999px 4px;transform:rotate(-45deg);background:#14532D;box-shadow:0 0 0 3px #fff,0 6px 14px rgba(0,0,0,.25)"></span>
    <span style="position:absolute;left:18px;top:13px;width:8px;height:8px;border-radius:99px;background:#DCFCE7"></span>
  </div>`,
})

export const meIcon = L.divIcon({
  className: 'ks-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  html: `<div style="position:relative;width:24px;height:24px">
    <span style="position:absolute;inset:0;border-radius:99px;background:#2563EB;opacity:.35;animation:ks-pulse 2s ease-out infinite"></span>
    <span style="position:absolute;inset:5px;border-radius:99px;background:#2563EB;box-shadow:0 0 0 3px #fff"></span>
  </div>`,
})
