import { useState } from 'react'
import { useReports } from '../../context/ReportsContext'
import { cn } from '../../lib/cn'
import { effectiveConfirmations } from '../../lib/reportUtils'
import type { Report } from '../../types/report'

/**
 * "I've encountered this too" — one confirmation per report per browser.
 * Prototype interaction only; not an authenticated community vote.
 */
export function ConfirmButton({ report, size = 'sm', className }: { report: Report; size?: 'sm' | 'lg'; className?: string }) {
  const { confirmedIds, confirmReport } = useReports()
  const [justConfirmed, setJustConfirmed] = useState(false)
  const confirmed = confirmedIds.has(report.id)
  const count = effectiveConfirmations(report, confirmedIds)
  const disabled = confirmed || report.status === 'resolved' || report.status === 'rejected'

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        void confirmReport(report.id)
        setJustConfirmed(true)
        window.setTimeout(() => setJustConfirmed(false), 900)
      }}
      aria-pressed={confirmed}
      title={
        confirmed
          ? 'You confirmed this report from this browser'
          : disabled
            ? 'This report is no longer active'
            : "I've encountered this too"
      }
      className={cn(
        'group inline-flex cursor-pointer items-center gap-2 rounded-full font-semibold whitespace-nowrap transition active:scale-[0.97] disabled:cursor-default disabled:active:scale-100',
        size === 'lg' ? 'h-12 px-5 text-[15px]' : 'h-11 px-3.5 text-sm',
        confirmed
          ? 'bg-mint text-forest'
          : disabled
            ? 'bg-slate-100 text-slate-400'
            : 'bg-fill text-ink hover:bg-mint/60 hover:text-forest',
        className,
      )}
    >
      <span aria-hidden className={cn('text-[18px] leading-none transition-transform duration-300 ease-[var(--ease-spring)]', justConfirmed && 'scale-125')}>
        {confirmed ? '✅' : '✋'}
      </span>
      <span className={size === 'sm' ? 'hidden min-[400px]:inline' : ''}>
        {confirmed ? 'You encountered this' : size === 'lg' ? "I've encountered this too" : 'Me too'}
      </span>
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-xs tabular-nums',
          confirmed ? 'bg-surface/70 text-forest' : 'bg-surface text-muted',
        )}
        aria-label={`${count} confirmations`}
      >
        {count}
      </span>
    </button>
  )
}
