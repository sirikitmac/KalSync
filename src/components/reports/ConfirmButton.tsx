import { Check, Hand } from 'lucide-react'
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
        'group inline-flex cursor-pointer items-center gap-2 rounded-xl font-semibold transition disabled:cursor-default',
        size === 'lg' ? 'h-12 px-4 text-[15px]' : 'h-11 px-3 text-sm',
        confirmed
          ? 'bg-mint text-forest'
          : disabled
            ? 'bg-slate-100 text-slate-400'
            : 'border border-line bg-white text-ink hover:border-brand/50 hover:bg-mint/40 hover:text-forest',
        className,
      )}
    >
      <span className={cn('grid place-items-center transition', justConfirmed && 'scale-125')}>
        {confirmed ? <Check className="size-4" /> : <Hand className="size-4" />}
      </span>
      <span className={size === 'sm' ? 'hidden min-[400px]:inline' : ''}>
        {confirmed ? 'You encountered this' : size === 'lg' ? "I've encountered this too" : 'Me too'}
      </span>
      <span
        className={cn(
          'rounded-md px-1.5 py-0.5 text-xs tabular-nums',
          confirmed ? 'bg-white/70 text-forest' : 'bg-canvas text-muted',
        )}
        aria-label={`${count} confirmations`}
      >
        {count}
      </span>
    </button>
  )
}
