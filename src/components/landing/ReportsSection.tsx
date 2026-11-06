import { ArrowRight, FlaskConical } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGeographicScope } from '../../hooks/useGeographicScope'
import { useFilteredReports } from '../../hooks/useReports'
import { DEFAULT_FILTERS } from '../../lib/reportUtils'
import type { ReportFilters as Filters } from '../../types/report'
import { Button } from '../common/Button'
import { ReportFilters } from '../reports/ReportFilters'
import { ReportList } from '../reports/ReportList'

const PREVIEW_COUNT = 6

export function ReportsSection() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const { filtered, loading } = useFilteredReports(filters)
  const { config } = useGeographicScope()
  const navigate = useNavigate()

  return (
    <section id="reports" aria-labelledby="reports-title" className="container-page pt-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Community reports</p>
          <h2 id="reports-title" className="section-title mt-2">
            What’s Happening on the Road?
          </h2>
          <p className="mt-3 flex max-w-xl items-start gap-2 text-sm text-muted">
            <FlaskConical className="mt-0.5 size-4 shrink-0" />
            Reports marked DEMO are illustrative sample data — not real or current incidents. New reports stay Pending
            until barangay or city personnel verify them.
          </p>
        </div>
        <Button variant="outline" className="self-start sm:self-auto" onClick={() => navigate('/reports')}>
          View All Reports <ArrowRight className="size-4" />
        </Button>
      </div>

      <div className="mt-8">
        <ReportFilters value={filters} onChange={setFilters} resultCount={filtered.length} scopeLabel={config.label} />
      </div>
      <div className="mt-6">
        <ReportList reports={filtered.slice(0, PREVIEW_COUNT)} loading={loading} onReset={() => setFilters(DEFAULT_FILTERS)} />
      </div>
      {filtered.length > PREVIEW_COUNT && (
        <div className="mt-8 flex justify-center">
          <Button variant="secondary" size="lg" onClick={() => navigate('/reports')}>
            View all {filtered.length} reports <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </section>
  )
}
