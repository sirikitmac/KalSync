import { Building2, Hand, MapPin, Navigation } from 'lucide-react'
import { CATEGORY_MAP } from '../../data/categories'
import type { IncidentCategory } from '../../types/report'

/**
 * Product-style hero composition: a stylised map view of Iligan with incident
 * markers and preview cards. Uses demo content and is labelled as such.
 */
const MARKERS: { x: number; y: number; c: IncidentCategory; pulse?: boolean }[] = [
  { x: 214, y: 150, c: 'flooding', pulse: true },
  { x: 318, y: 92, c: 'pothole' },
  { x: 120, y: 258, c: 'obstruction', pulse: true },
  { x: 392, y: 236, c: 'construction' },
  { x: 268, y: 318, c: 'traffic' },
  { x: 452, y: 128, c: 'debris' },
]

function Pin({ x, y, c, pulse }: (typeof MARKERS)[number]) {
  const cat = CATEGORY_MAP[c]
  const Icon = cat.icon
  return (
    <g transform={`translate(${x} ${y})`}>
      {pulse && (
        <circle r="14" fill={cat.color} opacity="0.35">
          <animate attributeName="r" from="10" to="30" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      <g transform="translate(-15 -34)">
        <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 19 15 19s15-8.5 15-19C30 6.7 23.3 0 15 0Z" fill={cat.color} stroke="#fff" strokeWidth="2.5" />
        <foreignObject x="7" y="7" width="16" height="16">
          <Icon color="#fff" size={16} strokeWidth={2.4} />
        </foreignObject>
      </g>
    </g>
  )
}

export function HeroVisual({ activeCount }: { activeCount: number }) {
  return (
    <div className="relative mx-auto w-full max-w-[600px]">
      {/* Map window */}
      <div className="relative overflow-hidden rounded-[28px] border border-line bg-white p-2 shadow-lift">
        <div className="flex items-center justify-between gap-2 px-2 pt-1 pb-2.5">
          <div className="inline-flex rounded-xl bg-canvas p-1 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1 rounded-lg bg-forest px-2.5 py-1.5 text-white">
              <Building2 className="size-3" /> Iligan City
            </span>
          </div>
          <span className="rounded-full bg-slate-900/85 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white">SAMPLE DATA</span>
        </div>
        <div className="relative overflow-hidden rounded-[20px] bg-[#EEF3EE]">
          <svg viewBox="0 0 560 380" className="block h-auto w-full" aria-hidden>
            <defs>
              <pattern id="hv-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M28 0H0V28" fill="none" stroke="#E1E9E2" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="560" height="380" fill="url(#hv-grid)" />
            {/* sea */}
            <path d="M0 0H170C150 60 120 90 92 140C70 180 40 200 0 214Z" fill="#D6E9F5" />
            <text x="26" y="60" fontSize="11" fill="#7BA3BE" fontWeight="600" letterSpacing="2">ILIGAN BAY</text>
            {/* parks */}
            <path d="M430 280c40-14 90 0 130 30v70H400c-10-40 0-84 30-100Z" fill="#D9EEDC" />
            <ellipse cx="300" cy="40" rx="60" ry="24" fill="#DDEFE0" />
            {/* river */}
            <path d="M560 180C480 190 420 210 360 260S260 340 220 380" stroke="#C9E0EF" strokeWidth="14" fill="none" strokeLinecap="round" />
            {/* minor roads */}
            <g stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round">
              <path d="M180 0L250 380" />
              <path d="M90 190L560 110" />
              <path d="M140 320L520 250" />
              <path d="M330 0L380 380" />
              <path d="M460 0L470 380" />
            </g>
            {/* main highway */}
            <path d="M120 0C170 80 210 140 230 200S260 320 300 380" stroke="#FFFFFF" strokeWidth="16" fill="none" strokeLinecap="round" />
            <path d="M120 0C170 80 210 140 230 200S260 320 300 380" stroke="#FCD34D" strokeWidth="5" fill="none" strokeLinecap="round" />
            {/* highlighted route */}
            <path d="M140 300C190 250 220 210 232 168S300 100 318 92" stroke="#16A34A" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="1 10" />
            <circle cx="140" cy="300" r="7" fill="#2563EB" stroke="#fff" strokeWidth="3" />
            {MARKERS.map((m, i) => (
              <Pin key={i} {...m} />
            ))}
          </svg>

          {/* Floating card: flooding */}
          <div className="absolute top-[34%] left-[46%] hidden w-56 animate-fade-up rounded-2xl border border-line bg-white/95 p-3 shadow-lift backdrop-blur [animation-delay:250ms] min-[460px]:block">
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-blue-600 text-white">
                <CATEGORY_MAP.flooding.icon className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] leading-tight font-bold">Ankle-deep flooding</p>
                <p className="flex items-center gap-1 text-[11px] text-muted">
                  <MapPin className="size-3" /> Pala-o · Demo
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold text-forest">Verified</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted">
                <Hand className="size-3" /> 41 riders
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating alert card */}
      <div className="absolute -bottom-6 -left-2 w-[min(17rem,78%)] animate-fade-up rounded-2xl border border-line bg-white p-3.5 shadow-lift [animation-delay:450ms] sm:-left-8">
        <div className="flex items-start gap-3">
          <span className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-red-50 text-danger">
            <Navigation className="size-4" />
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-danger ring-2 ring-white" />
          </span>
          <div>
            <p className="text-[13px] leading-tight font-bold">Heads up · 1.2 km ahead</p>
            <p className="mt-0.5 text-xs text-muted">Stalled truck blocking one lane in Tubod</p>
          </div>
        </div>
      </div>

      {/* Floating stat */}
      <div className="absolute -top-4 -right-1 hidden animate-fade-up rounded-2xl border border-line bg-white px-4 py-3 shadow-lift [animation-delay:600ms] sm:block lg:-right-6">
        <p className="text-[11px] font-semibold text-muted">Active in Iligan · sample</p>
        <p className="font-display text-2xl font-extrabold text-forest">
          {activeCount} <span className="text-sm font-semibold text-muted">alerts</span>
        </p>
      </div>
    </div>
  )
}
