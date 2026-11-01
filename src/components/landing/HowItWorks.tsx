import { BellRing, Camera, Eye } from 'lucide-react'

const STEPS = [
  {
    n: '01',
    title: 'Spot it',
    body: 'Encounter a road hazard or unusual road condition.',
    icon: Eye,
  },
  {
    n: '02',
    title: 'Report it',
    body: 'Take a photograph, select a category, and attach the location.',
    icon: Camera,
  },
  {
    n: '03',
    title: 'Alert others',
    body: 'Share your report so other road users can make informed decisions.',
    icon: BellRing,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="hiw-title" className="container-page pt-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">How it works</p>
        <h2 id="hiw-title" className="section-title mt-2">
          Making Every Journey More Informed.
        </h2>
      </div>
      <ol className="relative mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
        {/* connecting road */}
        <span aria-hidden className="absolute top-[58px] right-[16%] left-[16%] hidden border-t-2 border-dashed border-brand/30 md:block" />
        {STEPS.map(({ n, title, body, icon: Icon }) => (
          <li key={n} className="card relative p-6 transition hover:-translate-y-0.5 hover:shadow-lift sm:p-7">
            <div className="flex items-center justify-between">
              <span className="relative grid size-14 place-items-center rounded-2xl bg-forest text-white shadow-[0_10px_24px_-10px_rgb(20_83_45/0.7)]">
                <Icon className="size-6" />
              </span>
              <span className="font-display text-5xl font-extrabold text-mint">{n}</span>
            </div>
            <h3 className="mt-6 text-sm font-extrabold tracking-[0.14em] text-forest uppercase">
              {n} — {title}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
