import { cn } from '../../lib/cn'

/** KalSync mark: a winding road leading to a location pin — "see what's ahead". */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-9', className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#14532D" />
      <path d="M9 25c2.5-5 4-8 7-11.5S21.5 8 23 7" stroke="#DCFCE7" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M12 25c2-3.6 3.6-6.4 6-9" stroke="#16A34A" strokeWidth="1.6" strokeDasharray="2 2.4" fill="none" strokeLinecap="round" />
      <circle cx="23" cy="7.5" r="3.2" fill="#22C55E" stroke="#DCFCE7" strokeWidth="1.4" />
    </svg>
  )
}

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className={cn('font-display text-[1.3rem] font-extrabold tracking-tight', light ? 'text-white' : 'text-ink')}>
        Kal<span className={light ? 'text-green-300' : 'text-brand'}>Sync</span>
      </span>
    </span>
  )
}
