import { ArrowLeft, FlaskConical, Map as MapIcon, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { ScopeToggle } from '../components/common/ScopeToggle'
import { ReportFilters } from '../components/reports/ReportFilters'
import { ReportList } from '../components/reports/ReportList'
import { useApp } from '../context/AppContext'
import { CATEGORY_MAP } from '../data/categories'
import { useGeographicScope } from '../hooks/useGeographicScope'
import { useFilteredReports } from '../hooks/useReports'
import { DEFAULT_FILTERS } from '../lib/reportUtils'
import type { IncidentCategory, ReportFilters as Filters } from '../types/report'

const PAGE = 12

export function ReportsPage() {
  const [params, setParams] = useSearchParams()
  const initialCategory = params.get('category') as IncidentCategory | null
  const [filters, setFilters] = useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    categories: initialCategory && CATEGORY_MAP[initialCategory] ? [initialCategory] : [],
  }))
  const [visible, setVisible] = useState(PAGE)
  const { filtered, loading } = useFilteredReports(filters)
  const { config, stats } = useGeographicScope()
  const { openModal } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  // Keep ?category in sync for shareable URLs
  useEffect(() => {
    const next = new URLSearchParams(params)
    if (filters.categories.length === 1) next.set('category', filters.categories[0])
    else next.delete('category')
    if (next.toString() !== params.toString()) setParams(next, { replace: true })
  }, [filters.categories, params, setParams])

  useEffect(() => setVisible(PAGE), [filters, config.id])
  const shown = useMemo(() => filtered.slice(0, visible), [filtered, visible])

  return (
    <div className="container-page pt-8 sm:pt-12">
      <Link to="/" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted hover:text-forest">
        <ArrowLeft className="size-4" /> Back to home
      </Link>
      <div className="mt-2 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Road reports</p>
          <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">All reports</h1>
          <p className="mt-3 max-w-xl text-muted">
            {stats.total} reports · {stats.active} active in <span className="font-semibold text-ink">{config.label}</span>.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <ScopeToggle />
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button variant="secondary" onClick={() => navigate('/#map')}>
              <MapIcon className="size-4" /> Map
            </Button>
            <Button onClick={() => openModal('report')}>
              <Plus className="size-4" /> Report
            </Button>
          </div>
        </div>
      </div>

      <p className="mt-6 flex items-start gap-2 rounded-xl border border-line bg-white p-3 text-xs text-muted sm:text-sm">
        <FlaskConical className="mt-0.5 size-4 shrink-0" />
        DEMO reports are illustrative sample data and do not describe real or current incidents. Your own submissions are
        labeled “Yours” and saved in this browser.
      </p>

      <div className="mt-6">
        <ReportFilters value={filters} onChange={setFilters} resultCount={filtered.length} scopeLabel={config.label} />
      </div>
      <div className="mt-6">
        <ReportList reports={shown} loading={loading} onReset={() => setFilters(DEFAULT_FILTERS)} />
      </div>
      {filtered.length > visible && (
        <div className="mt-8 flex justify-center">
          <Button variant="secondary" size="lg" onClick={() => setVisible((v) => v + PAGE)}>
            Load more ({filtered.length - visible} remaining)
          </Button>
        </div>
      )}
    </div>
  )
}
