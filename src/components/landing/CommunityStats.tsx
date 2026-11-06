import { Activity, FileText, MapPinned, Users } from 'lucide-react'
import { BARANGAYS } from '../../data/barangays'
import { useCountUp } from '../../hooks/useCountUp'
import { useGeographicScope } from '../../hooks/useGeographicScope'

export function CommunityStats() {
  const { stats, config } = useGeographicScope()
  const items = [
    { label: 'Total Reports', value: stats.total, icon: FileText },
    { label: 'Active Alerts', value: stats.active, icon: Activity },
    { label: 'Barangays Covered', value: BARANGAYS.length, icon: MapPinned },
    { label: 'Community Contributors', value: stats.contributors, icon: Users },
  ]
  return (
    <section aria-labelledby="stats-title" className="container-page pt-28">
      <div className="relative overflow-hidden rounded-[28px] bg-forest px-5 py-10 text-white sm:px-10 sm:py-14">
        <svg className="pointer-events-none absolute -right-20 -bottom-24 w-[520px] opacity-[0.12]" viewBox="0 0 400 400" aria-hidden>
          <path d="M20 380C80 260 140 200 220 150S360 60 390 20" stroke="#DCFCE7" strokeWidth="28" fill="none" strokeLinecap="round" />
          <path d="M20 380C80 260 140 200 220 150S360 60 390 20" stroke="#14532D" strokeWidth="3" strokeDasharray="14 14" fill="none" />
        </svg>
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-green-300 uppercase">Community at a glance</p>
            <h2 id="stats-title" className="mt-2 text-3xl font-extrabold sm:text-4xl">
              {config.label}, in numbers.
            </h2>
            <p className="mt-2 text-sm text-white/70">Illustrative sample metrics from this prototype’s demo data — not live figures.</p>
          </div>
        </div>
        <dl className="relative mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {items.map((i) => (
            <Stat key={i.label} {...i} />
          ))}
        </dl>
      </div>
    </section>
  )
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  const v = useCountUp(value)
  return (
    <div className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10 sm:p-5">
      <Icon className="size-5 text-green-300" />
      <dd className="mt-4 font-display text-3xl font-extrabold tabular-nums sm:text-4xl">{v.toLocaleString()}</dd>
      <dt className="mt-1 text-xs font-medium text-white/70 sm:text-sm">{label}</dt>
    </div>
  )
}
