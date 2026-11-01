import { cn } from '../../lib/cn'

/** KalSync mark: the "K" with a road sweeping through it. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src="/logo-192.webp"
      alt=""
      aria-hidden
      width={36}
      height={36}
      decoding="async"
      className={cn('size-9 shrink-0 select-none', className)}
      draggable={false}
    />
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
