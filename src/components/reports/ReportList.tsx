import { Inbox, RotateCcw } from 'lucide-react'
import type { Report } from '../../types/report'
import { Button } from '../common/Button'
import { ReportCard } from './ReportCard'

export function ReportList({ reports, loading, onReset }: { reports: Report[]; loading?: boolean; onReset?: () => void }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading reports">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="aspect-[16/9] animate-pulse bg-slate-100" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  if (!reports.length) {
    return (
      <div className="card flex flex-col items-center px-6 py-14 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-mint text-forest">
          <Inbox className="size-7" />
        </span>
        <h3 className="mt-4 text-lg font-bold">No reports match these filters</h3>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Try another category or status, or search a different barangay or road.
        </p>
        {onReset && (
          <Button variant="secondary" className="mt-5" onClick={onReset}>
            <RotateCcw className="size-4" /> Reset filters
          </Button>
        )}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {reports.map((r, i) => (
        <ReportCard key={r.id} report={r} index={i} />
      ))}
    </div>
  )
}
