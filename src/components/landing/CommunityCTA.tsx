import { Plus, Users } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Button } from '../common/Button'

export function CommunityCTA() {
  const { openModal } = useApp()
  return (
    <section aria-labelledby="cta-title" className="container-page pt-28">
      <div className="card relative overflow-hidden px-6 py-12 text-center sm:px-12 sm:py-16">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-24 mx-auto h-48 max-w-3xl rounded-full bg-mint blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <h2 id="cta-title" className="section-title">
            Every Report Makes a Difference.
          </h2>
          <p className="mt-4 text-lg text-muted">Help fellow road users stay informed. Share what you see and make every journey safer.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 min-[480px]:flex-row">
            <Button size="lg" onClick={() => openModal('join')}>
              <Users className="size-5" /> Join the KalSync Community
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
