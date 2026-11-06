import { ArrowRight, Plus, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useReports } from '../../context/ReportsContext'
import { computeStats } from '../../lib/reportUtils'
import { Button } from '../common/Button'
import { LogoMark } from '../common/Logo'
import { HeroVisual } from './HeroVisual'

export function Hero() {
  const { openModal } = useApp()
  const navigate = useNavigate()
  const { reports } = useReports()
  const active = computeStats(reports, 'iligan').active
  return (
    <section className="relative overflow-hidden">
      {/* subtle road-network backdrop */}
      <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.5]" aria-hidden preserveAspectRatio="none" viewBox="0 0 1200 700">
        <path d="M-50 560C200 500 360 620 620 520S1000 300 1260 340" stroke="#DCFCE7" strokeWidth="40" fill="none" />
        <path d="M-50 560C200 500 360 620 620 520S1000 300 1260 340" stroke="#fff" strokeWidth="3" strokeDasharray="18 18" fill="none" />
      </svg>
      <div className="container-page grid items-center gap-14 pt-10 pb-20 sm:pt-14 lg:grid-cols-[1.02fr_1fr] lg:gap-10 lg:pt-20 lg:pb-28">
        <div className="max-w-xl animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-forest/10 bg-white py-1 pr-3 pl-1 text-xs font-semibold text-forest shadow-card">
            <LogoMark className="size-6" />
            <span className="rounded-full bg-mint px-2 py-0.5">Prototype</span>
            Iligan City · 44 barangays
          </span>
          <h1 className="mt-6 text-[2.75rem] leading-[1.02] font-extrabold text-ink min-[400px]:text-5xl sm:text-6xl lg:text-[4.25rem]">
            See What’s <span className="text-brand">Ahead.</span>
          </h1>
          <p className="mt-4 font-display text-xl font-bold text-ink/85 sm:text-2xl">Know the road before you take it.</p>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            Check road conditions and official closures, report hazards with a photo, and send them straight to the barangay or
            city office that can fix them.
          </p>
          <div className="mt-8 flex flex-col gap-3 min-[480px]:flex-row">
            <Button size="lg" onClick={() => openModal('report')}>
              <Plus className="size-5" /> Report a Road Issue
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/reports')}>
              Explore Road Reports <ArrowRight className="size-4.5" />
            </Button>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-muted">
            <ShieldCheck className="size-4 text-brand" />
            Free for riders, commuters, motorists &amp; cyclists. No account needed to report.
          </p>
        </div>
        <div className="animate-fade-up pb-6 [animation-delay:120ms] lg:pb-0">
          <HeroVisual activeCount={active} />
        </div>
      </div>
    </section>
  )
}
