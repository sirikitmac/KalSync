import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type Detent = 'peek' | 'half' | 'full'

const ORDER: Detent[] = ['peek', 'half', 'full']

function heights(vh: number, peek: number): Record<Detent, number> {
  return { peek, half: Math.round(vh * 0.52), full: vh - 64 }
}

interface BottomSheetProps {
  detent: Detent
  onDetentChange: (d: Detent) => void
  /** Height of the collapsed sheet (title + main action). */
  peekHeight?: number
  /** Draggable area: handle plus the sheet title. */
  header: ReactNode
  children: ReactNode
  /** Reports the visible sheet height so the map can keep markers above it. */
  onVisibleHeight?: (px: number) => void
  className?: string
  /** Changing this scrolls the content back to the top. */
  resetKey?: string
  /** Map-only mode: the sheet slides fully out of view. */
  hidden?: boolean
}

/**
 * iOS-style sheet with three detents. Drag the header to move it; it settles
 * on the nearest detent, biased by flick velocity. Map stays usable above it.
 */
export function BottomSheet({ detent, onDetentChange, peekHeight = 156, header, children, onVisibleHeight, className, resetKey, hidden = false }: BottomSheetProps) {
  const [vh, setVh] = useState(() => window.innerHeight)
  const [drag, setDrag] = useState<number | null>(null)
  const start = useRef<{ y: number; h: number; t: number; lastY: number; lastT: number } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const on = () => setVh(window.innerHeight)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  const h = heights(vh, peekHeight)
  const visible = hidden ? 0 : (drag ?? h[detent])

  useLayoutEffect(() => {
    if (drag === null) onVisibleHeight?.(hidden ? 0 : h[detent])
  }, [detent, drag, h, onVisibleHeight, hidden])

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input, [data-no-drag]')) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const now = performance.now()
    start.current = { y: e.clientY, h: h[detent], t: now, lastY: e.clientY, lastT: now }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const s = start.current
    if (!s) return
    const dy = s.y - e.clientY
    if (drag === null && Math.abs(dy) < 4) return
    const raw = s.h + dy
    // Rubber-band past the ends
    const min = h.peek
    const max = h.full
    const next = raw < min ? min - (min - raw) * 0.3 : raw > max ? max + (raw - max) * 0.3 : raw
    s.lastY = e.clientY
    s.lastT = performance.now()
    setDrag(next)
  }

  const settle = useCallback(
    (current: number, velocity: number) => {
      // velocity in px/ms, positive = moving up
      const projected = current + velocity * 180
      let best: Detent = 'peek'
      let dist = Infinity
      for (const d of ORDER) {
        const dd = Math.abs(h[d] - projected)
        if (dd < dist) {
          dist = dd
          best = d
        }
      }
      onDetentChange(best)
    },
    [h, onDetentChange],
  )

  const onPointerUp = (e: React.PointerEvent) => {
    const s = start.current
    start.current = null
    if (!s || drag === null) {
      setDrag(null)
      return
    }
    const dt = Math.max(1, performance.now() - s.lastT)
    const velocity = dt > 80 ? 0 : (s.lastY - e.clientY) / dt + (s.y - e.clientY) / Math.max(1, performance.now() - s.t) * 0.5
    settle(drag, velocity)
    setDrag(null)
  }

  // Tapping the handle cycles peek -> half -> full -> half
  const cycle = () => onDetentChange(detent === 'peek' ? 'half' : detent === 'half' ? 'full' : 'half')

  useEffect(() => {
    if (detent !== 'full') scrollRef.current?.scrollTo({ top: 0 })
  }, [detent])
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [resetKey])

  return (
    <section
      aria-label="Road status panel"
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
      className={cn(
        'fixed inset-x-0 bottom-0 z-[700] flex flex-col overflow-hidden rounded-t-[28px] bg-surface shadow-[0_-1px_0_var(--color-line),0_-12px_40px_-12px_rgb(0_0_0/0.25)]',
        drag === null && 'transition-[height] duration-500 ease-[var(--ease-ios)]',
        className,
      )}
      style={{ height: visible }}
    >
      <div
        className="shrink-0 cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <button
          type="button"
          onClick={cycle}
          aria-label={detent === 'full' ? 'Collapse panel' : 'Expand panel'}
          className="mx-auto block cursor-pointer px-6 pt-2 pb-1.5"
        >
          <span className="block h-[5px] w-9 rounded-full bg-ink/20" />
        </button>
        {header}
      </div>
      <div ref={scrollRef} className={cn('min-h-0 flex-1 overscroll-contain', detent === 'peek' ? 'overflow-hidden' : 'overflow-y-auto')}>
        {children}
      </div>
    </section>
  )
}
