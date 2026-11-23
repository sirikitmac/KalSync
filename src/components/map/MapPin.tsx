import { SEVERITY_COLOR, getCategory } from '../../data/categories'
import { cn } from '../../lib/cn'
import type { IncidentCategory, ReportStatus, Severity } from '../../types/report'

/** Teardrop pin colored by severity (red, orange, yellow) with the category icon. 44px touch target. */
export function MapPin({ category, severity, status, selected, mine }: { category: IncidentCategory; severity?: Severity; status?: ReportStatus; selected?: boolean; mine?: boolean }) {
  const c = getCategory(category)
  const Icon = c.icon
  const muted = status === 'resolved' || status === 'rejected'
  const sev = SEVERITY_COLOR[severity ?? c.severity]
  const color = muted ? '#94A3B8' : sev.bg
  const fg = muted ? '#FFFFFF' : sev.fg
  return (
    <span
      className={cn('relative block h-12 w-11 cursor-pointer transition-transform duration-200 ease-[var(--ease-spring)]', selected ? 'scale-[1.2]' : 'hover:scale-110')}
      style={{ transformOrigin: '50% 100%' }}
    >
      {!muted && (severity ?? c.severity) === 'high' && (
        <span className="absolute top-[17px] left-1/2 -mt-[15px] -ml-[15px] size-[30px] rounded-full" style={{ background: color, animation: 'ks-pulse 2s ease-out infinite' }} />
      )}
      <span
        className="absolute top-0.5 left-[7px] size-[30px] rotate-[-45deg] rounded-[999px_999px_999px_4px]"
        style={{
          background: color,
          boxShadow: mine ? '0 0 0 3px #fff, 0 0 0 5px #14532D, 0 6px 14px rgba(0,0,0,.25)' : '0 0 0 2.5px #fff, 0 6px 14px rgba(0,0,0,.25)',
        }}
      />
      <span className="absolute top-0.5 left-[7px] grid size-[30px] place-items-center" style={{ color: fg }}>
        <Icon className="size-[17px]" weight="bold" />
      </span>
    </span>
  )
}

export function MePin() {
  return (
    <span className="relative block size-6">
      <span className="absolute inset-0 rounded-full bg-[#2563EB] opacity-35" style={{ animation: 'ks-pulse 2s ease-out infinite' }} />
      <span className="absolute inset-[5px] rounded-full bg-[#2563EB] shadow-[0_0_0_3px_#fff]" />
    </span>
  )
}

export function DropPin() {
  return (
    <span className="relative block h-12 w-11">
      <span className="absolute top-0.5 left-[7px] size-[30px] rotate-[-45deg] rounded-[999px_999px_999px_4px] bg-[#14532D] shadow-[0_0_0_3px_#fff,0_6px_14px_rgba(0,0,0,.25)]" />
      <span className="absolute top-[13px] left-[18px] size-2 rounded-full bg-[#DCFCE7]" />
    </span>
  )
}

/** Destination flag for drive mode. */
export function FlagPin() {
  return (
    <span className="relative block h-12 w-11">
      <span className="absolute top-0.5 left-[7px] grid size-[30px] rotate-[-45deg] place-items-center rounded-[999px_999px_999px_4px] bg-[#1E3A8A] shadow-[0_0_0_3px_#fff,0_6px_14px_rgba(0,0,0,.25)]" />
      <span className="absolute top-[9px] left-[15px] text-[14px] leading-none" aria-hidden>🏁</span>
    </span>
  )
}

/** The driver in drive mode: an arrow pointing the way the car is going. */
export function CarArrow() {
  return (
    <span className="relative block size-16">
      <span className="absolute inset-2 rounded-full bg-[#2563EB]/20" />
      <svg viewBox="0 0 44 44" className="absolute inset-0 drop-shadow-[0_3px_6px_rgba(0,0,0,.3)]" aria-hidden>
        <path d="M22 6 L34 36 L22 29 L10 36 Z" fill="#2563EB" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
