import { BellRing, Plus } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Button } from '../common/Button'
import { LogoMark } from '../common/Logo'

export function CommunityCTA() {
  const { openModal } = useApp()
  return (
    <section aria-labelledby="cta-title" className="container-page pt-28">
      <div className="card relative overflow-hidden px-6 py-12 text-center sm:px-12 sm:py-16">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-24 mx-auto h-48 max-w-3xl rounded-full bg-mint blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <LogoMark className="mx-auto mb-6 size-16 drop-shadow-[0_10px_20px_rgb(20_83_45/0.35)]" />
          <h2 id="cta-title" className="section-title">
            Every Report Makes a Difference.
          </h2>
          <p className="mt-4 text-lg text-muted">Report what you see and it goes straight to the office that can fix it. Follow your barangay to hear about closures before you leave.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 min-[480px]:flex-row">
            <Button size="lg" onClick={() => openModal('alerts')}>
              <BellRing className="size-5" /> Get Alerts for My Barangay
            </Button>
            <Button size="lg" variant="secondary" onClick={() => openModal('report')}>
              <Plus className="size-5" /> Report a Road Issue
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
