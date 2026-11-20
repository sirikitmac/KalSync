import { useTheme, type ThemePref } from '../../context/ThemeContext'
import { cn } from '../../lib/cn'
import { Monitor, Moon, Sun } from './icons'

const OPTIONS: { id: ThemePref; label: string; Icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'dark', label: 'Dark', Icon: Moon },
  { id: 'system', label: 'System', Icon: Monitor },
]

/** iOS-style segmented control for Light / Dark / System. */
export function ThemeToggle({ className }: { className?: string }) {
  const { pref, setPref } = useTheme()
  const index = OPTIONS.findIndex((o) => o.id === pref)
  return (
    <div role="radiogroup" aria-label="Appearance" className={cn('relative grid grid-cols-3 rounded-full bg-fill p-0.5', className)}>
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-full bg-elevated shadow-card transition-transform duration-300 ease-[var(--ease-ios)]"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {OPTIONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          role="radio"
          aria-checked={pref === id}
          aria-label={label}
          title={label}
          onClick={() => setPref(id)}
          className={cn(
            'relative z-10 grid h-8 cursor-pointer place-items-center rounded-full px-3 transition-colors',
            pref === id ? 'text-ink' : 'text-muted hover:text-ink',
          )}
        >
          <Icon className="size-4" weight={pref === id ? 'fill' : 'regular'} />
        </button>
      ))}
    </div>
  )
}
