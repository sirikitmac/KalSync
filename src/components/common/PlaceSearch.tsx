import { MapPin, Search, X } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { searchPlaces, type Place } from '../../data/locations'
import { cn } from '../../lib/cn'

interface PlaceSearchProps {
  onSelect: (place: Place) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  /** Called when the user submits text that matches no known place. */
  onNoMatch?: (query: string) => void
}

/** Accessible autocomplete over Iligan City barangays, roads, and landmarks. */
export function PlaceSearch({ onSelect, placeholder = 'Search a barangay, road, or landmark', className, inputClassName, onNoMatch }: PlaceSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const results = useMemo(() => searchPlaces(query), [query])
  const listId = useId()

  const choose = (p: Place) => {
    onSelect(p)
    setQuery(p.name === p.city ? p.name : `${p.name}, ${p.city}`)
    setOpen(false)
  }

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label={placeholder}
        className={cn('input pr-10 pl-10 [&::-webkit-search-cancel-button]:hidden', inputClassName)}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          setActive(0)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActive((a) => Math.min(a + 1, results.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((a) => Math.max(a - 1, 0))
          } else if (e.key === 'Enter') {
            e.preventDefault()
            if (results[active]) choose(results[active])
            else if (query.trim()) onNoMatch?.(query.trim())
          } else if (e.key === 'Escape') setOpen(false)
        }}
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-muted hover:bg-ink/5"
          onClick={() => {
            setQuery('')
            setOpen(false)
          }}
        >
          <X className="size-4" />
        </button>
      )}
      {open && query.trim() && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-[600] mt-1.5 max-h-72 animate-fade-in overflow-y-auto rounded-xl border border-line bg-white p-1.5 shadow-lift"
        >
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted">
              No matching place in Iligan City. Try a barangay name, e.g. Tibanga or Pala-o.
            </li>
          ) : (
            results.map((p, i) => {
              return (
                <li
                  key={`${p.name}-${p.city}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    choose(p)
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm',
                    i === active && 'bg-mint/60',
                  )}
                >
                  <MapPin className="size-4 shrink-0 text-brand" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">{p.name}</span>
                    <span className="block truncate text-xs text-muted">
                      {p.kind === 'city' ? p.province : `${p.city}, ${p.province}`}
                    </span>
                  </span>
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}
