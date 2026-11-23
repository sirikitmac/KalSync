import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { CATEGORIES, getCategory, isActiveStatus } from '../../data/categories'
import { cn } from '../../lib/cn'
import { formatRelative, severityColor, severityOf } from '../../lib/reportUtils'
import type { IncidentCategory, Report } from '../../types/report'
import { Bell, Car, ChevronRight, Plus } from '../common/icons'
import { Button } from '../common/Button'

export const shortLabel = (label: string) => label.split(' / ')[0]

/** Short status for list rows: what a driver needs to know first. */
export function rowStatus(r: Report): { label: string; className: string } {
  if (r.status === 'resolved') return { label: 'Cleared', className: 'text-muted' }
  if (r.status === 'rejected') return { label: 'Rejected', className: 'text-muted' }
  if (r.roadStatus?.kind === 'closed') return { label: 'Closed', className: 'text-red-600 dark:text-red-400' }
  if (r.status === 'verified') return { label: 'Verified', className: 'text-forest dark:text-brand' }
  return { label: 'Pending', className: 'text-amber-600' }
}

export function PanelHeader({ activeCount, onReport, onDrive }: { activeCount: number; onReport: () => void; onDrive?: () => void }) {
  return (
    <div className="px-5 pb-4">
      <p className="num text-[13px] font-medium text-muted">Iligan City · {activeCount} active</p>
      <div className="mt-0.5 flex items-center justify-between gap-3">
        <h1 className="text-[clamp(22px,6.6vw,28px)] leading-tight font-bold whitespace-nowrap">Road status</h1>
        <div className="flex shrink-0 items-center gap-2">
          {onDrive && (
            <Button variant="ghost" onClick={onDrive} className="btn-drive h-10 pr-4 pl-3.5 hover:brightness-110" aria-label="Drive to a destination">
              <Car className="size-4" weight="fill" /> Drive
            </Button>
          )}
          <Button variant="ink" onClick={onReport} className="h-10 pr-4 pl-3.5">
            <Plus className="size-4" weight="bold" /> Report
          </Button>
        </div>
      </div>
    </div>
  )
}

export function StatTiles({ reports, onPick }: { reports: Report[]; onPick: (k: 'active' | 'closed' | 'high') => void }) {
  const stats = useMemo(() => {
    const active = reports.filter((r) => isActiveStatus(r.status))
    return {
      active: active.length,
      closed: active.filter((r) => r.roadStatus?.kind === 'closed').length,
      high: active.filter((r) => severityOf(r) === 'high').length,
    }
  }, [reports])
  const tiles = [
    { k: 'active' as const, label: 'Active', value: stats.active, tone: 'text-ink' },
    { k: 'closed' as const, label: 'Road closures', value: stats.closed, tone: 'text-red-600 dark:text-red-400' },
    { k: 'high' as const, label: 'High risk', value: stats.high, tone: 'text-amber-600' },
  ]
  return (
    <div className="grid grid-cols-3 gap-2.5 px-4">
      {tiles.map((t) => (
        <button
          key={t.k}
          onClick={() => onPick(t.k)}
          className="squircle cursor-pointer rounded-[18px] bg-fill px-3 py-3 text-left transition active:scale-[0.97]"
        >
          <p className={cn('num text-[26px] leading-none font-bold', t.tone)}>{t.value}</p>
          <p className="mt-1.5 text-[12px] leading-tight font-medium text-muted">{t.label}</p>
        </button>
      ))}
    </div>
  )
}

export function FollowCard({ followed, alertCount }: { followed: string[]; alertCount: number }) {
  const { openModal } = useApp()
  return (
    <button
      onClick={() => openModal('alerts')}
      className="squircle mx-4 flex w-[calc(100%-2rem)] cursor-pointer items-center gap-3 rounded-[18px] bg-mint/70 p-3.5 text-left transition active:scale-[0.99] dark:bg-mint"
    >
      <span className="squircle grid size-10 shrink-0 place-items-center rounded-[12px] bg-forest text-white">
        <Bell className="size-5" weight="fill" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink">
          {followed.length ? `Following ${followed.length} barangay${followed.length > 1 ? 's' : ''}` : 'Get alerts for your barangay'}
        </span>
        <span className="block truncate text-[13px] text-muted">
          {followed.length
            ? `${alertCount} active alert${alertCount === 1 ? '' : 's'} · ${followed.slice(0, 3).join(', ')}${followed.length > 3 ? '…' : ''}`
            : 'In-app and SMS, before you head out'}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted" weight="bold" />
    </button>
  )
}

export function CategoryChips({ value, onChange }: { value: IncidentCategory[]; onChange: (v: IncidentCategory[]) => void }) {
  const toggle = (id: IncidentCategory) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filter by category" data-no-drag>
      <button
        onClick={() => onChange([])}
        aria-pressed={value.length === 0}
        className={cn(
          'h-9 shrink-0 cursor-pointer rounded-full px-3.5 text-[14px] font-semibold transition',
          value.length === 0 ? 'bg-ink text-canvas' : 'bg-fill text-ink',
        )}
      >
        All
      </button>
      {CATEGORIES.map((c) => {
        const on = value.includes(c.id)
        const Icon = c.icon
        return (
          <button
            key={c.id}
            onClick={() => toggle(c.id)}
            aria-pressed={on}
            className={cn(
              'inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full pr-3.5 pl-2.5 text-[14px] font-medium transition',
              on ? 'bg-forest text-white dark:bg-brand dark:text-[#06210f]' : 'bg-fill text-ink',
            )}
          >
            <Icon className={cn('size-4', !on && 'text-muted')} weight="fill" />
            {shortLabel(c.label)}
          </button>
        )
      })}
    </div>
  )
}

export function ReportRow({ report, onOpen, last }: { report: Report; onOpen: () => void; last?: boolean }) {
  const cat = getCategory(report.category)
  const Icon = cat.icon
  const st = rowStatus(report)
  return (
    <li>
      <button onClick={onOpen} className="flex w-full cursor-pointer items-center gap-3 pl-4 text-left transition-colors active:bg-fill">
        <span
          className="squircle grid size-10 shrink-0 place-items-center rounded-[12px]"
          style={{ background: severityColor(report).bg, color: severityColor(report).fg }}
        >
          <Icon className="size-5" weight="fill" />
        </span>
        <span className={cn('flex min-w-0 flex-1 items-center gap-2 py-3 pr-4', !last && 'border-b border-line')}>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold text-ink">{report.title}</span>
            <span className="block truncate text-[13px] text-muted">
              {report.barangay ?? report.location} · {formatRelative(report.createdAt)}
              {report.source === 'demo' ? ' · Sample' : report.source === 'user' ? ' · Yours' : ''}
            </span>
          </span>
          <span className={cn('shrink-0 text-[13px] font-semibold', st.className)}>{st.label}</span>
          <ChevronRight className="size-3.5 shrink-0 text-muted/70" weight="bold" />
        </span>
      </button>
    </li>
  )
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between px-5 pt-6 pb-2">
      <h2 className="text-[20px] font-bold">{children}</h2>
      {action}
    </div>
  )
}
