import { AlertTriangle, ChevronRight, Clock, MapPin } from 'lucide-react'
import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { useReports } from '../../context/ReportsContext'
import { getCategory } from '../../data/categories'
import { useCountUp } from '../../hooks/useCountUp'
import { useGeographicScope } from '../../hooks/useGeographicScope'
import { usePlaceNavigation } from '../../hooks/usePlaceNavigation'
import { alertFeed, formatRelative, severityOf } from '../../lib/reportUtils'
import { PlaceSearch } from '../common/PlaceSearch'

/** Geographic scope selector + live summary of the selected area. */
export function ScopeSection() {
  const { config, stats, scopedReports, scope } = useGeographicScope()
  const { reports } = useReports()
  const { openReport } = useApp()
  const goToPlace = usePlaceNavigation()
  const alerts = useMemo(() => alertFeed(reports, scope).filter((r) => severityOf(r) === 'high').slice(0, 3), [reports, scope])
  const latest = useMemo(
    () => [...scopedReports].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0],
    [scopedReports],
  )

  return (
    <section id="area" aria-labelledby="scope-title" className="container-page">
      <div className="card overflow-hidden">
        <div className="p-5 sm:p-8">
          <div>
            <p className="eyebrow">Your road view</p>
            <h2 id="scope-title" className="mt-2 text-2xl font-extrabold sm:text-3xl">
              Showing reports for{' '}
              <span key={scope} className="inline-block animate-fade-up text-forest">
                {config.label}
              </span>
            </h2>
            <p className="mt-1.5 text-sm text-muted">{config.description}</p>
          </div>
        </div>
        <div className="border-t border-line bg-canvas/60 px-5 py-4 sm:px-8">
          <PlaceSearch
            onSelect={(p) => goToPlace(p)}
            placeholder="Search a barangay, road, or landmark in Iligan"
            className="max-w-xl"
          />
        </div>

        <div className="grid grid-cols-1 border-t border-line lg:grid-cols-[1.1fr_1fr]">
          <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4 lg:grid-cols-2">
            <MiniStat label="Reports in view" value={stats.total} />
            <MiniStat label="Active alerts" value={stats.active} accent />
            <MiniStat label="High severity" value={stats.highSeverityActive} danger />
            <div className="bg-white p-5">
              <dt className="text-xs font-medium text-muted">Latest report</dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Clock className="size-3.5 text-muted" />
                {latest ? formatRelative(latest.createdAt) : '—'}
              </dd>
            </div>
          </dl>
          <div className="border-t border-line p-5 sm:p-6 lg:border-t-0 lg:border-l">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-bold text-ink">
                <AlertTriangle className="size-4 text-danger" /> Heads up in {config.label}
              </p>
              <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">Sample data</span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {alerts.length === 0 && <li className="py-3 text-sm text-muted">No high-severity reports are active right now.</li>}
              {alerts.map((r) => {
                const c = getCategory(r.category)
                const Icon = c.icon
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => openReport(r.id)}
                      className="group flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-canvas"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg text-white" style={{ background: c.color }}>
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{r.title}</span>
                        <span className="flex items-center gap-1 truncate text-xs text-muted">
                          <MapPin className="size-3 shrink-0" /> {r.location}{r.barangay ? ` · Brgy. ${r.barangay}` : ''}
                        </span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function MiniStat({ label, value, accent, danger }: { label: string; value: number; accent?: boolean; danger?: boolean }) {
  const v = useCountUp(value)
  return (
    <div className="bg-white p-5">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className={`mt-1 font-display text-3xl font-extrabold tabular-nums ${danger ? 'text-danger' : accent ? 'text-forest' : 'text-ink'}`}>{v}</dd>
    </div>
  )
}
