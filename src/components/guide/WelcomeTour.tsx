import { useEffect, useRef, useState, type ComponentType } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'
import { Bell, Camera, Hand, Map } from '../common/icons'

const KEY = 'kadaan:tour-done'

type Step = { icon: ComponentType<{ className?: string; weight?: 'fill' | 'regular' | 'bold' | 'duotone' }>; tint: string; title: string; body: string; tl: string }

const STEPS: Step[] = [
  {
    icon: Map,
    tint: 'bg-forest text-white',
    title: 'See what’s on the road',
    body: 'Each pin is a report from a road user or an office. Tap a pin or a card below the map to see the photo, the road status, and the detour.',
    tl: 'Bawat pin ay ulat mula sa motorista o sa opisina. Pindutin ang pin o ang card sa ilalim ng mapa para makita ang litrato, ang lagay ng daan, at ang detour.',
  },
  {
    icon: Camera,
    tint: 'bg-[#f08c2b] text-white',
    title: 'Report in under a minute',
    body: 'Tap Report, take a photo, choose what it is, and drop the pin. Please stop somewhere safe before using your phone.',
    tl: 'Pindutin ang Report, kumuha ng litrato, piliin kung ano ito, at ilagay ang pin. Huminto muna sa ligtas na lugar bago gamitin ang cellphone.',
  },
  {
    icon: Bell,
    tint: 'bg-[#2f6fde] text-white',
    title: 'Get alerts for your barangay',
    body: 'Follow the barangays you pass through. New closures and hazards there show up under the bell.',
    tl: 'I-follow ang mga barangay na dinadaanan mo. Lalabas sa kampana (bell) ang mga bagong saradong daan at panganib doon.',
  },
  {
    icon: Hand,
    tint: 'bg-[#d64545] text-white',
    title: 'Saw it too? Say so',
    body: 'Tap “I’ve encountered this too” on a report so the offices know it is real. You can open this guide again from the ☰ menu.',
    tl: 'Pindutin ang “I’ve encountered this too” kung nakita mo rin ito, para malaman ng mga opisina na totoo ang ulat. Mabubuksan ulit ang gabay na ito sa ☰ menu.',
  },
]

export function tourDone() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return true
  }
}

/** Four-card welcome tour shown the first time someone opens the map. */
export function WelcomeTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [i, setI] = useState(0)
  const nextRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      setI(0)
      requestAnimationFrame(() => nextRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
      if (e.key === 'ArrowRight') setI((v) => Math.min(v + 1, STEPS.length - 1))
      if (e.key === 'ArrowLeft') setI((v) => Math.max(v - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const finish = () => {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* private mode: show again next time */
    }
    onClose()
  }

  if (!open) return null
  const s = STEPS[i]
  const last = i === STEPS.length - 1
  const Icon = s.icon

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-end justify-center p-3 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <div className="absolute inset-0 animate-fade-in bg-ink/45 backdrop-blur-[2px]" onClick={finish} aria-hidden />
      <div className="squircle relative w-full max-w-sm animate-sheet-up overflow-hidden rounded-[28px] bg-surface shadow-lift">
        <div className="flex items-center justify-between px-5 pt-4">
          <span className="text-[13px] font-semibold text-muted">
            {i + 1} of {STEPS.length}
          </span>
          <button onClick={finish} className="cursor-pointer rounded-full px-3 py-1.5 text-[15px] font-medium text-muted hover:bg-fill">
            Skip
          </button>
        </div>

        <div key={i} className="animate-fade-up px-6 pt-4 pb-2 text-center">
          <div className={cn('squircle mx-auto grid size-20 place-items-center rounded-[24px] shadow-card', s.tint)}>
            <Icon className="size-10" weight="fill" />
          </div>
          <h2 id="tour-title" className="mt-5 text-[24px] leading-tight font-bold">
            {s.title}
          </h2>
          <p className="mt-2 text-[16px] leading-relaxed text-muted">{s.body}</p>
          <p lang="fil" className="mt-3 rounded-2xl bg-fill/70 px-4 py-3 text-[15px] leading-relaxed text-ink/80">
            <span className="mb-0.5 block text-[11px] font-semibold tracking-wide text-muted uppercase">Sa Tagalog</span>
            {s.tl}
          </p>
        </div>

        <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
          {STEPS.map((_, k) => (
            <span key={k} className={cn('h-1.5 rounded-full transition-all', k === i ? 'w-5 bg-forest dark:bg-brand' : 'w-1.5 bg-ink/15')} />
          ))}
        </div>

        <div className="flex gap-2 p-5">
          {i > 0 && (
            <button
              onClick={() => setI(i - 1)}
              className="h-12 flex-1 cursor-pointer rounded-full bg-fill text-[16px] font-semibold transition active:scale-[0.98]"
            >
              Back
            </button>
          )}
          <button
            ref={nextRef}
            onClick={() => (last ? finish() : setI(i + 1))}
            className="h-12 flex-[2] cursor-pointer rounded-full bg-forest text-[16px] font-semibold text-white transition active:scale-[0.98]"
          >
            {last ? 'Start using KaDaan' : 'Next'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
