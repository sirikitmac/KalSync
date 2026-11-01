import { MapPinned, Route, Users } from 'lucide-react'

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="container-page pt-28">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <p className="eyebrow">About KalSync</p>
          <h2 id="about-title" className="section-title mt-2">
            Built for the <span className="text-brand">kalsada</span>, by the people on it.
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            KalSync is a community-powered road reporting platform for motorcycle riders, commuters, motorists, cyclists, and
            everyone else who shares Philippine roads. We’re starting in Iligan City and designing for nationwide expansion,
            one city at a time.
          </p>
          <p className="mt-3 text-sm text-muted">
            KalSync is an independent project and is not affiliated with, or endorsed by, any government agency.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="card p-6">
            <p className="font-display text-3xl font-extrabold text-forest">Kal</p>
            <p className="mt-1 text-sm text-muted">
              From <em>kalsada</em> — the Filipino word for road. Every report starts with a place on the road.
            </p>
          </div>
          <div className="card p-6">
            <p className="font-display text-3xl font-extrabold text-brand">Sync</p>
            <p className="mt-1 text-sm text-muted">Connecting road users through shared, timely information.</p>
          </div>
          <div className="card flex gap-4 p-6 sm:col-span-2">
            {[
              [MapPinned, 'Local first', 'Iligan City as our launch city'],
              [Users, 'Community-driven', 'Reports and confirmations from riders'],
              [Route, 'Built to scale', 'Ready for more cities nationwide'],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof Route
              return (
                <div key={t as string} className="flex-1">
                  <I className="size-5 text-brand" />
                  <p className="mt-2 text-sm font-bold">{t as string}</p>
                  <p className="text-xs text-muted">{d as string}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
