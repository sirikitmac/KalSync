import { useEffect, useState } from 'react'

const KEY = 'kadaan:intro-seen'
const DURATION = 1900

const shouldShow = () => {
  try {
    return sessionStorage.getItem(KEY) !== '1'
  } catch {
    return false
  }
}

/**
 * App-style launch screen, shown once per browser session: the app icon
 * springs in, light sweeps across it, the wordmark rises, then the whole
 * screen zooms away to reveal the page underneath.
 */
export function Splash() {
  const [phase, setPhase] = useState<'in' | 'out' | 'done'>(() => (shouldShow() ? 'in' : 'done'))

  useEffect(() => {
    if (phase === 'done') return
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* ignore */
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const out = window.setTimeout(() => setPhase('out'), reduced ? 300 : DURATION - 450)
    const done = window.setTimeout(() => setPhase('done'), reduced ? 500 : DURATION)
    return () => {
      window.clearTimeout(out)
      window.clearTimeout(done)
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (phase === 'done') return null

  return (
    <div
      aria-hidden
      onClick={() => setPhase('done')}
      className={`splash fixed inset-0 z-[3000] grid place-items-center bg-canvas ${phase === 'out' ? 'splash-out' : ''}`}
    >
      <div className="flex flex-col items-center">
        <div className="splash-icon relative size-24 overflow-hidden rounded-[26px] shadow-float squircle">
          <img src="/logo.png" alt="" width={96} height={96} className="size-full scale-[1.06] object-cover" draggable={false} />
          <span className="splash-shine pointer-events-none absolute inset-0" />
        </div>
        <p className="mt-5 flex font-display text-[28px] font-bold tracking-[-0.03em] text-ink">
          {'KaDaan'.split('').map((ch, i) => (
            <span key={i} className={`splash-letter ${i >= 2 ? 'text-brand' : ''}`} style={{ animationDelay: `${520 + i * 45}ms` }}>
              {ch}
            </span>
          ))}
        </p>
        <p className="splash-tag mt-1 text-[13px] font-medium text-muted">Road status for Iligan City</p>
      </div>
    </div>
  )
}
