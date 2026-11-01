import { ListFilter } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { CATEGORIES } from '../../data/categories'
import { cn } from '../../lib/cn'
import type { IncidentCategory } from '../../types/report'

/** Compact category filter popover for the map; doubles as the marker legend. */
export function MapFilters({ value, onChange }: { value: IncidentCategory[]; onChange: (v: IncidentCategory[]) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-ink shadow-card transition hover:border-forest/30"
      >
        <ListFilter className="size-4 text-brand" />
        <span>Categories</span>
        {value.length > 0 && <span className="grid size-5 place-items-center rounded-full bg-forest text-[11px] text-white">{value.length}</span>}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-[min(300px,calc(100vw-5.5rem))] animate-fade-in rounded-2xl border border-line bg-white p-2 shadow-lift">
          <div className="flex items-center justify-between px-2 pt-1 pb-2">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Show on map</p>
            {value.length > 0 && (
              <button className="cursor-pointer text-xs font-semibold text-forest hover:underline" onClick={() => onChange([])}>
                Show all
              </button>
            )}
          </div>
          <ul className="max-h-[300px] overflow-y-auto">
            {CATEGORIES.map((c) => {
              const Icon = c.icon
              const on = value.length === 0 || value.includes(c.id)
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-pressed={value.includes(c.id)}
                    onClick={() => onChange(value.includes(c.id) ? value.filter((v) => v !== c.id) : [...value, c.id])}
                    className={cn('flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-2 text-left text-sm hover:bg-canvas', !on && 'opacity-45')}
                  >
                    <span className="grid size-7 place-items-center rounded-full text-white" style={{ background: c.color }}>
                      <Icon className="size-3.5" />
                    </span>
                    <span className="flex-1 font-medium">{c.label}</span>
                    {value.includes(c.id) && <span className="size-2 rounded-full bg-forest" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
