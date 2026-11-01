import { ArrowUpDown, RotateCcw, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { CATEGORIES, STATUSES, STATUS_META } from '../../data/categories'
import { cn } from '../../lib/cn'
import { DEFAULT_FILTERS, hasActiveFilters } from '../../lib/reportUtils'
import type { IncidentCategory, ReportFilters as Filters, ReportStatus, SortOrder } from '../../types/report'

interface Props {
  value: Filters
  onChange: (f: Filters) => void
  resultCount: number
  scopeLabel: string
}

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

export function ReportFilters({ value, onChange, resultCount, scopeLabel }: Props) {
  const active = hasActiveFilters(value)
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            className="input pl-10"
            placeholder="Search by title or location"
            aria-label="Search reports by title or location"
            value={value.query}
            onChange={(e) => onChange({ ...value, query: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <label className="relative flex-1 sm:flex-none">
            <span className="sr-only">Sort reports</span>
            <ArrowUpDown className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
            <select
              className="input cursor-pointer appearance-none pr-8 pl-10 sm:w-48"
              value={value.sort}
              onChange={(e) => onChange({ ...value, sort: e.target.value as SortOrder })}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="most-confirmed">Most confirmed</option>
            </select>
          </label>
          <label className="relative flex-1 sm:flex-none">
            <span className="sr-only">Filter by status</span>
            <select
              className="input cursor-pointer appearance-none sm:w-48"
              value={value.statuses.length === 1 ? value.statuses[0] : value.statuses.length ? 'multi' : ''}
              onChange={(e) =>
                onChange({ ...value, statuses: e.target.value ? [e.target.value as ReportStatus] : [] })
              }
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
              {value.statuses.length > 1 && <option value="multi" disabled>Multiple</option>}
            </select>
          </label>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by category">
        <Chip active={value.categories.length === 0} onClick={() => onChange({ ...value, categories: [] })}>
          All categories
        </Chip>
        {CATEGORIES.map((c) => {
          const Icon = c.icon
          const on = value.categories.includes(c.id)
          return (
            <Chip key={c.id} active={on} onClick={() => onChange({ ...value, categories: toggle<IncidentCategory>(value.categories, c.id) })}>
              <Icon className="size-3.5" style={{ color: on ? undefined : c.color }} />
              {c.title.replace(' & Damaged Roads', '').replace('Other Road Hazards', 'Other')}
            </Chip>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="text-muted" aria-live="polite">
          <span className="font-semibold text-ink">{resultCount}</span> {resultCount === 1 ? 'report' : 'reports'} in{' '}
          <span className="font-semibold text-ink">{scopeLabel}</span>
        </p>
        {active && (
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_FILTERS, sort: value.sort })}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg px-2 font-semibold text-forest hover:bg-mint/60"
          >
            <RotateCcw className="size-3.5" /> Reset filters
          </button>
        )}
      </div>
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold whitespace-nowrap transition',
        active ? 'border-forest bg-forest text-white' : 'border-line bg-white text-ink hover:border-forest/30',
      )}
    >
      {children}
    </button>
  )
}
