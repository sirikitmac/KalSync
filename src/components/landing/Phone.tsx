import type { CSSProperties, ReactNode } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { getCategory } from '../../data/categories'
import { ILIGAN_PHOTOS } from '../../data/iliganPhotos'
import { hideBroken } from '../../lib/hideBroken'
import { cn } from '../../lib/cn'
import type { IncidentCategory } from '../../types/report'
import { ChevronRight, Plus, Search } from '../common/icons'

/** iPhone-style frame. Content is real UI, scaled down. */
export function Phone({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={cn(
        'relative aspect-[9/19.2] w-[250px] rounded-[46px] bg-[#0b0d0c] p-[9px] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.45),0_0_0_1px_rgb(255_255_255/0.08)_inset]',
        className,
      )}
      style={style}
      aria-hidden
    >
      <div className="relative size-full overflow-hidden rounded-[38px] bg-canvas">
        {children}
        <span className="absolute top-2.5 left-1/2 z-20 h-[22px] w-[78px] -translate-x-1/2 rounded-full bg-[#0b0d0c]" />
      </div>
    </div>
  )
}

function StatusBar({ light }: { light?: boolean }) {
  return (
    <div className={cn('relative z-10 flex items-center justify-between px-6 pt-3 text-[11px] font-semibold', light ? 'text-white' : 'text-ink')}>
      <span className="num">9:41</span>
      <span className="flex items-center gap-1">
        <span className="flex items-end gap-[1.5px]">
          {[3, 5, 7, 9].map((h) => (
            <span key={h} className="w-[2.5px] rounded-full bg-current" style={{ height: h }} />
          ))}
        </span>
        <span className="ml-1 h-[9px] w-[18px] rounded-[3px] border border-current p-[1px]">
          <span className="block h-full w-3/4 rounded-[1px] bg-current" />
        </span>
      </span>
    </div>
  )
}

const PINS: { c: IncidentCategory; x: number; y: number }[] = [
  { c: 'flooding', x: 38, y: 30 },
  { c: 'obstruction', x: 62, y: 22 },
  { c: 'construction', x: 50, y: 42 },
  { c: 'accident', x: 24, y: 48 },
  { c: 'event', x: 74, y: 38 },
]

/** The /map screen in miniature. */
export function MapScreen({ bare }: { bare?: boolean } = {}) {
  const { resolved } = useTheme()
  const style = resolved === 'dark' ? 'dark_all' : 'rastertiles/voyager'
  const tiles = []
  for (let y = 7815; y <= 7817; y++) for (let x = 13845; x <= 13847; x++) tiles.push({ x, y })
  return (
    <div className="absolute inset-0">
      <div
        className="absolute grid grid-cols-3"
        style={{
          width: 768,
          left: -150,
          top: -40,
          transform: 'scale(0.62)',
          transformOrigin: '0 0',
        }}
      >
        {tiles.map((t) => (
          <img
            onError={hideBroken}
            key={`${t.x}-${t.y}`}
            src={`https://a.basemaps.cartocdn.com/${style}/14/${t.x}/${t.y}@2x.png`}
            alt=""
            width={256}
            height={256}
            loading="lazy"
            className="size-64"
          />
        ))}
      </div>
      {PINS.map((p) => {
        const cat = getCategory(p.c)
        const Icon = cat.icon
        return (
          <span
            key={p.c}
            className="absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-white shadow-[0_0_0_2px_#fff,0_4px_10px_rgb(0_0_0/0.25)]"
            style={{ left: `${p.x}%`, top: `${p.y}%`, background: cat.color }}
          >
            <Icon className="size-3.5" weight="fill" />
          </span>
        )
      })}
      {!bare && <StatusBar />}
      {!bare && (
        <div className="glass absolute top-11 right-3 left-3 flex h-9 items-center gap-2 rounded-full px-3 text-[11px] text-muted shadow-float">
          <Search className="size-3.5" /> Search a road or barangay
        </div>
      )}
      {!bare && (
        <div className="absolute inset-x-0 bottom-0 h-[50%] rounded-t-[22px] bg-surface px-3.5 pt-2 shadow-[0_-8px_24px_-10px_rgb(0_0_0/0.25)]">
          <span className="mx-auto block h-1 w-7 rounded-full bg-ink/20" />
          <p className="mt-2 text-[9px] font-medium text-muted">Iligan City · 11 active</p>
          <div className="flex items-center justify-between">
            <p className="text-[17px] font-bold tracking-tight">Road status</p>
            <span className="inline-flex h-6 items-center gap-1 rounded-full bg-ink px-2.5 text-[10px] font-semibold text-canvas">
              <Plus className="size-2.5" weight="bold" /> Report
            </span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {[
              ['11', 'Active', 'text-ink'],
              ['2', 'Closures', 'text-red-600 dark:text-red-400'],
              ['3', 'High risk', 'text-amber-600'],
            ].map(([n, l, c]) => (
              <div key={l} className="rounded-[10px] bg-fill px-2 py-1.5">
                <p className={cn('num text-[15px] leading-none font-bold', c)}>{n}</p>
                <p className="mt-0.5 text-[8px] text-muted">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-2 overflow-hidden rounded-[10px] bg-fill/70">
            {[
              ['event', 'Fiesta procession, main road', 'Tibanga', 'Closed', 'text-red-600 dark:text-red-400'],
              ['flooding', 'Ankle-deep flooding', 'Pala-o', 'Verified', 'text-forest dark:text-brand'],
            ].map(([c, t, b, s, sc], i) => {
              const cat = getCategory(c as IncidentCategory)
              const Icon = cat.icon
              return (
                <div key={t} className="flex items-center gap-2 pl-2">
                  <span className="grid size-6 shrink-0 place-items-center rounded-[7px] text-white" style={{ background: cat.color }}>
                    <Icon className="size-3" weight="fill" />
                  </span>
                  <div className={cn('flex min-w-0 flex-1 items-center gap-1 py-1.5 pr-2', i === 0 && 'border-b border-line')}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-semibold">{t}</p>
                      <p className="text-[8px] text-muted">{b} · 2h ago</p>
                    </div>
                    <span className={cn('text-[8px] font-semibold', sc)}>{s}</span>
                    <ChevronRight className="size-2 text-muted" weight="bold" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/** Lock screen with a barangay alert and the matching SMS. */
export function AlertScreen() {
  return (
    <div className="absolute inset-0">
      <img onError={hideBroken} src={ILIGAN_PHOTOS.bonifacio.src} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/50" />
      <StatusBar light />
      <div className="relative mt-6 text-center text-white">
        <p className="text-[12px] font-semibold opacity-90">Saturday, November 15</p>
        <p className="num text-[58px] leading-none font-bold tracking-tight">9:41</p>
      </div>
      <div className="absolute inset-x-2.5 bottom-6 space-y-2">
        <Notification app="KaDaan" time="now" icon={<img onError={hideBroken} src="/logo-192.webp" alt="" className="size-full" />}>
          <p className="text-[11px] font-semibold">Tibanga · Road closed</p>
          <p className="text-[10.5px] leading-snug opacity-80">Main road closed for the fiesta procession, 6 AM to 1 PM. Use the side street by the chapel.</p>
        </Notification>
        <Notification
          app="Messages"
          time="1m ago"
          icon={<span className="grid size-full place-items-center bg-[#34c759] text-[9px] font-bold text-white">SMS</span>}
        >
          <p className="text-[11px] font-semibold">KaDaan</p>
          <p className="text-[10.5px] leading-snug opacity-80">Pala-o: ankle-deep flood near the public market. Slow down. Detour via Aguinaldo St.</p>
        </Notification>
      </div>
    </div>
  )
}

function Notification({ app, time, icon, children }: { app: string; time: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex gap-2 rounded-[16px] bg-white/72 p-2.5 text-[#111] shadow-[0_8px_24px_-12px_rgb(0_0_0/0.4)] backdrop-blur-xl">
      <span className="size-7 shrink-0 overflow-hidden rounded-[7px]">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between text-[9px] opacity-60">
          <span className="font-semibold tracking-wide uppercase">{app}</span>
          <span>{time}</span>
        </div>
        {children}
      </div>
    </div>
  )
}
