import { useState } from 'react'
import { getCategory } from '../../data/categories'
import { cn } from '../../lib/cn'
import { formatRelative } from '../../lib/reportUtils'
import { local } from '../../services/storageService'
import type { Report } from '../../types/report'
import { Bento, GridFour, ListRows } from '../common/icons'
import { ReportImage } from '../reports/ReportImage'
import { ReportRow, rowStatus } from './PanelParts'

export type ReportView = 'bento' | 'grid' | 'list'
const KEY = 'kadaan:report-view'

export function useReportView() {
  const [view, setView] = useState<ReportView>(() => {
    const v = local.read<string>(KEY, 'bento')
    return v === 'grid' || v === 'list' ? v : 'bento'
  })
  const set = (v: ReportView) => {
    setView(v)
    local.write(KEY, v)
  }
  return [view, set] as const
}

const VIEWS: { id: ReportView; label: string; Icon: typeof Bento }[] = [
  { id: 'bento', label: 'Gallery', Icon: Bento },
  { id: 'grid', label: 'Grid', Icon: GridFour },
  { id: 'list', label: 'List', Icon: ListRows },
]

/** Segmented control for gallery / grid / list. */
export function ViewToggle({ value, onChange }: { value: ReportView; onChange: (v: ReportView) => void }) {
  const index = VIEWS.findIndex((v) => v.id === value)
  return (
    <div role="radiogroup" aria-label="Report layout" className="relative grid grid-cols-3 rounded-full bg-fill p-0.5" data-no-drag>
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-full bg-elevated shadow-card transition-transform duration-300 ease-[var(--ease-ios)]"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {VIEWS.map(({ id, label, Icon }) => (
        <button
          key={id}
          role="radio"
          aria-checked={value === id}
          aria-label={label}
          title={label}
          onClick={() => onChange(id)}
          className={cn('relative z-10 grid h-8 w-10 cursor-pointer place-items-center rounded-full transition-colors', value === id ? 'text-ink' : 'text-muted')}
        >
          <Icon className="size-4" weight={value === id ? 'fill' : 'regular'} />
        </button>
      ))}
    </div>
  )
}

/* Bento pattern, repeating every 4 cards in a 2-column grid of short rows:
   [ wide      ]
   [tall][ sm ]
   [tall][ sm ]  */
const BENTO = ['col-span-2 row-span-2', 'row-span-4', 'row-span-2', 'row-span-2']

export function ReportGallery({ reports, view, onOpen }: { reports: Report[]; view: ReportView; onOpen: (id: string) => void }) {
  if (view === 'list') {
    return (
      <ul className="squircle overflow-hidden rounded-[18px] bg-fill/60">
        {reports.map((r, i) => (
          <ReportRow key={r.id} report={r} onOpen={() => onOpen(r.id)} last={i === reports.length - 1} />
        ))}
      </ul>
    )
  }
  if (view === 'grid') {
    return (
      <ul className="grid grid-cols-2 gap-2.5 @[620px]:grid-cols-3">
        {reports.map((r) => (
          <li key={r.id}>
            <GridCard report={r} onOpen={() => onOpen(r.id)} />
          </li>
        ))}
      </ul>
    )
  }
  return (
    <ul className="grid auto-rows-[92px] grid-flow-dense grid-cols-2 gap-2.5 @[620px]:grid-cols-3">
      {reports.map((r, i) => (
        <li key={r.id} className={BENTO[i % BENTO.length]}>
          <BentoCard report={r} wide={i % BENTO.length === 0} onOpen={() => onOpen(r.id)} />
        </li>
      ))}
    </ul>
  )
}

function StatusPill({ report }: { report: Report }) {
  const st = rowStatus(report)
  return (
    <span className="glass inline-flex h-6 items-center rounded-full px-2 text-[11px] font-semibold">
      <span className={st.className}>{st.label}</span>
    </span>
  )
}

function CategoryDot({ report, small }: { report: Report; small?: boolean }) {
  const cat = getCategory(report.category)
  const Icon = cat.icon
  const muted = report.status === 'resolved' || report.status === 'rejected'
  return (
    <span
      className={cn('grid shrink-0 place-items-center rounded-full text-white shadow-[0_0_0_2px_rgb(255_255_255/0.9)]', small ? 'size-6' : 'size-7')}
      style={{ background: muted ? '#94A3B8' : cat.color }}
      title={cat.label}
    >
      <Icon className={small ? 'size-3.5' : 'size-4'} weight="fill" />
    </span>
  )
}

function BentoCard({ report, wide, onOpen }: { report: Report; wide: boolean; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="squircle group relative block size-full cursor-pointer overflow-hidden rounded-[20px] bg-fill text-left transition duration-300 ease-[var(--ease-ios)] active:scale-[0.98]"
    >
      <ReportImage report={report} hideLabel className="absolute inset-0 size-full transition duration-700 ease-[var(--ease-ios)] group-hover:scale-[1.04]" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
      <span className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
        <CategoryDot report={report} />
        <StatusPill report={report} />
      </span>
      <span className="absolute inset-x-3 bottom-3 text-white">
        <span className={cn('line-clamp-2 leading-snug font-semibold', wide ? 'text-[17px]' : 'text-[14px]')}>{report.title}</span>
        <span className="mt-0.5 block truncate text-[12px] text-white/75">
          {report.barangay ?? report.location} · {formatRelative(report.createdAt)}
          {report.source === 'demo' ? ' · Sample' : report.source === 'user' ? ' · Yours' : ''}
        </span>
      </span>
    </button>
  )
}

function GridCard({ report, onOpen }: { report: Report; onOpen: () => void }) {
  const st = rowStatus(report)
  return (
    <button onClick={onOpen} className="squircle block w-full cursor-pointer overflow-hidden rounded-[18px] bg-fill/60 text-left transition active:scale-[0.98]">
      <span className="relative block">
        <ReportImage report={report} hideLabel className="aspect-[4/3] w-full" />
        <span className="absolute top-2 left-2">
          <CategoryDot report={report} small />
        </span>
      </span>
      <span className="block p-2.5">
        <span className="line-clamp-2 text-[14px] leading-snug font-semibold text-ink">{report.title}</span>
        <span className="mt-1 flex items-center justify-between gap-1 text-[12px]">
          <span className="truncate text-muted">{report.barangay ?? report.location}</span>
          <span className={cn('shrink-0 font-semibold', st.className)}>{st.label}</span>
        </span>
      </span>
    </button>
  )
}
