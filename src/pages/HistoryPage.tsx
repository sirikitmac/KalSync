import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ReportGallery, ViewToggle, useReportView } from '../components/app/ReportGallery'
import { ArrowLeft, Search } from '../components/common/icons'
import { useApp } from '../context/AppContext'
import { useReports } from '../context/ReportsContext'
import { cn } from '../lib/cn'
import type { Report } from '../types/report'

type Tab = 'resolved' | 'closures' | 'rejected' | 'all'

const TABS: { id: Tab; label: string; test: (r: Report) => boolean }[] = [
  { id: 'resolved', label: 'Resolved', test: (r) => r.status === 'resolved' },
  { id: 'closures', label: 'Official closures', test: (r) => Boolean(r.roadStatus?.reference) || r.roadStatus?.kind === 'closed' },
  { id: 'rejected', label: 'Rejected', test: (r) => r.status === 'rejected' },
  { id: 'all', label: 'All', test: () => true },
]

/** Past and closed reports: resolved, official closures (current and lifted) and rejected. */
export function HistoryPage() {
  const { reports, loading } = useReports()
  const { openReport } = useApp()
  const [tab, setTab] = useState<Tab>('resolved')
  const [q, setQ] = useState('')
  const [view, setView] = useReportView()

  useEffect(() => {
    document.title = 'Report history · KaDaan'
  }, [])

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.id, reports.filter(t.test).length])) as Record<Tab, number>, [reports])

  const list = useMemo(() => {
    const t = TABS.find((x) => x.id === tab)!
    const query = q.trim().toLowerCase()
    return reports
      .filter(t.test)
      .filter((r) => !query || [r.title, r.location, r.barangay ?? '', r.id].some((s) => s.toLowerCase().includes(query)))
      .sort((a, b) => (b.statusUpdatedAt ?? b.createdAt).localeCompare(a.statusUpdatedAt ?? a.createdAt))
  }, [reports, tab, q])

  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <Link to="/map" className="inline-flex items-center gap-1.5 text-[15px] font-medium text-forest dark:text-brand">
        <ArrowLeft className="size-4" weight="bold" /> Back to the map
      </Link>
      <h1 className="mt-4 text-[34px] leading-tight font-bold sm:text-[44px]">Report history</h1>
      <p className="mt-2 text-[17px] text-muted">Resolved and rejected reports leave the map and stay here. Open one to see its details. Staff can reopen it to put it back on the map.</p>

      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-[15px] font-semibold transition',
              tab === t.id ? 'bg-ink text-canvas' : 'bg-surface text-ink shadow-card',
            )}
          >
            {t.label}
            <span className={cn('num rounded-full px-1.5 text-[12px]', tab === t.id ? 'bg-canvas/20' : 'bg-fill text-muted')}>{counts[t.id]}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
          <input className="input h-12 rounded-full pl-10" placeholder="Search reports" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <ViewToggle value={view} onChange={setView} />
      </div>

      <div className="@container mt-4">
        {loading && <p className="card px-4 py-8 text-center text-muted">Loading reports…</p>}
        {!loading && list.length === 0 && <p className="card px-4 py-8 text-center text-muted">Nothing here yet.</p>}
        {!loading && list.length > 0 && <ReportGallery reports={list} view={view} onOpen={(id) => openReport(id)} />}
      </div>
    </div>
  )
}
