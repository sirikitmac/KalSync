import { BadgeCheck, Plus } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { CATEGORIES } from '../../data/categories'
import { ORGANIZATIONS, suggestOrgs } from '../../data/organizations'
import { Button } from '../common/Button'

/** Which office handles which kind of road issue — the routing used by the report form. */
export function OrganizationsSection() {
  const { openModal } = useApp()
  return (
    <section id="offices" aria-labelledby="offices-title" className="container-page pt-28">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">Who handles what</p>
          <h2 id="offices-title" className="section-title mt-2">
            Your report goes to the right office.
          </h2>
          <p className="mt-3 text-muted">
            When you report, KaDaan suggests the office based on the type of issue. You can change it or add more. Offices
            marked <span className="font-semibold text-forest">Verifies</span> can confirm reports and post official closures.
          </p>
        </div>
        <Button variant="outline" className="self-start sm:self-auto" onClick={() => openModal('report')}>
          <Plus className="size-4" /> Report an issue
        </Button>
      </div>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ORGANIZATIONS.map((o) => {
          const Icon = o.icon
          const cats = CATEGORIES.filter((c) => suggestOrgs(c.id).includes(o.id))
          return (
            <li key={o.id} className="card flex flex-col p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl" style={{ background: `${o.color}14`, color: o.color }}>
                  <Icon className="size-5.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-base font-bold text-ink">{o.short}</p>
                    {o.personnel && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-mint px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-forest uppercase">
                        <BadgeCheck className="size-3" /> Verifies
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted">{o.name}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink/80">{o.handles}</p>
              {cats.length > 0 && (
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-4" aria-label={`Issues routed to ${o.short}`}>
                  {cats.map((c) => {
                    const CIcon = c.icon
                    return (
                      <li key={c.id} className="inline-flex items-center gap-1 rounded-full bg-canvas px-2 py-1 text-[11px] font-medium text-ink">
                        <CIcon className="size-3" style={{ color: c.color }} /> {c.label}
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
