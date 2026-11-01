import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../../data/categories'
import { cn } from '../../lib/cn'

export function IncidentCategories() {
  return (
    <section id="categories" aria-labelledby="cat-title" className="container-page pt-28">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">What you can report</p>
          <h2 id="cat-title" className="section-title mt-2">
            Every kind of road hazard.
          </h2>
        </div>
        <p className="max-w-sm text-sm text-muted">
          Hazards that can put riders at risk are flagged{' '}
          <span className="font-semibold text-danger">high severity</span> and surfaced first in alerts.
        </p>
      </div>
      <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => {
          const Icon = c.icon
          const high = c.severity === 'high'
          return (
            <li key={c.id}>
              <Link
                to={`/reports?category=${c.id}`}
                className="group card flex h-full items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:border-forest/20 hover:shadow-lift"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl" style={{ background: `${c.color}14`, color: c.color }}>
                  <Icon className="size-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-display text-base font-bold text-ink">{c.title}</span>
                    {high && <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-red-700 uppercase">High</span>}
                    {c.severity === 'medium' && <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-amber-800 uppercase">Moderate</span>}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{c.description}</span>
                </span>
                <ArrowUpRight className={cn('size-4 shrink-0 text-muted opacity-0 transition group-hover:opacity-100')} />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
