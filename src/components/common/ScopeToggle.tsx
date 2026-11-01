import { Building2, Globe2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { SCOPES } from '../../data/locations'
import { cn } from '../../lib/cn'
import type { GeographicScope } from '../../types/report'

const items: { id: GeographicScope; icon: typeof Globe2 }[] = [
  { id: 'iligan', icon: Building2 },
  { id: 'philippines', icon: Globe2 },
]

/** Iligan City / Philippines segmented control. Drives every scoped view in the app. */
export function ScopeToggle({ size = 'md', className }: { size?: 'sm' | 'md'; className?: string }) {
  const { scope, setScope } = useApp()
  const idx = items.findIndex((i) => i.id === scope)
  return (
    <div
      role="radiogroup"
      aria-label="Geographic area"
      className={cn('relative inline-grid grid-cols-2 rounded-2xl border border-line bg-white p-1 shadow-card', className)}
    >
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-xl bg-forest shadow transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${idx * 100}%)` }}
      />
      {items.map(({ id, icon: Icon }) => {
        const on = scope === id
        return (
          <button
            key={id}
            role="radio"
            aria-checked={on}
            onClick={() => setScope(id)}
            className={cn(
              'relative z-10 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-colors',
              size === 'sm' ? 'h-10 px-3 text-[13px]' : 'h-12 px-4 text-sm sm:px-6 sm:text-[15px]',
              on ? 'text-white' : 'text-muted hover:text-ink',
            )}
          >
            <Icon className="size-4" />
            {SCOPES[id].label}
          </button>
        )
      })}
    </div>
  )
}
