import { BellRing, CheckCircle2, Info, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/cn'

export function Toaster() {
  const { toasts, dismissToast } = useApp()
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[1100] flex flex-col items-center gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-end sm:p-6"
    >
      {toasts.map((t) => {
        const Icon = t.tone === 'alert' ? BellRing : t.tone === 'info' ? Info : CheckCircle2
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm animate-sheet-up items-start gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-lift"
          >
            <span
              className={cn(
                'grid size-9 shrink-0 place-items-center rounded-xl',
                t.tone === 'alert' ? 'bg-red-50 text-danger' : t.tone === 'info' ? 'bg-slate-100 text-slate-600' : 'bg-mint text-forest',
              )}
            >
              <Icon className="size-4.5" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold text-ink">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs leading-relaxed text-muted">{t.description}</p>}
            </div>
            <button onClick={() => dismissToast(t.id)} className="-m-1 grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-muted hover:bg-ink/5" aria-label="Dismiss">
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
