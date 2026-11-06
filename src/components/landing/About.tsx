import { Landmark, MapPinned, Users } from 'lucide-react'

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="container-page pt-28">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <p className="eyebrow">About KaDaan</p>
          <h2 id="about-title" className="section-title mt-2">
            Your <span className="text-brand">kasama</span> on the <span className="text-brand">daan</span>.
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            KaDaan is a road reporting platform for Iligan City. Riders, commuters, motorists, and cyclists report what they
            see, and each report goes to the office that can act on it — the barangay, ICTPMO, ICDRRMO, the City Engineer’s
            Office, DPWH, or the PNP.
          </p>
          <p className="mt-3 text-sm text-muted">
            Anyone can report without an account. Personnel from the barangay and city offices verify reports, post official
            closures, and mark issues resolved.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="card p-6">
            <p className="font-display text-3xl font-extrabold text-forest">Ka</p>
            <p className="mt-1 text-sm text-muted">
              From <em>kasama</em> — a fellow, a companion. Every rider who reports is looking out for the next one.
            </p>
          </div>
          <div className="card p-6">
            <p className="font-display text-3xl font-extrabold text-brand">Daan</p>
            <p className="mt-1 text-sm text-muted">
              Filipino for <em>road</em> — and for <em>way</em>. Clear information so everyone finds their way through.
            </p>
          </div>
          <div className="card flex gap-4 p-6 sm:col-span-2">
            {[
              [MapPinned, 'Iligan City', 'All 44 barangays'],
              [Users, 'Community reports', 'Photos, pins and “me too” confirmations'],
              [Landmark, 'Routed to offices', 'Verified and resolved by personnel'],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof Users
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
