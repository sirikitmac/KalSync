import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { ORGANIZATIONS } from '../../data/organizations'
import { ILIGAN_PHOTOS, type CityPhoto } from '../../data/iliganPhotos'
import { useReveal } from '../../hooks/useReveal'
import { cn } from '../../lib/cn'
import { hideBroken } from '../../lib/hideBroken'
import { Button } from '../common/Button'
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Camera,
  ChevronDown,
  FileBadge,
  Lock,
  Map as MapIcon,
  Route,
  ShieldCheck,
  Smartphone,
  Users,
} from '../common/icons'
import { AlertScreen, MapScreen, Phone } from './Phone'

/* ---------------------------------------------------------------- Hero */

export function Hero() {
  return (
    <section className="relative isolate -mt-[68px] overflow-hidden pt-[68px]">
      <img onError={hideBroken}
        src={ILIGAN_PHOTOS.skyline.src}
        alt=""
        className="absolute inset-0 -z-20 size-full object-cover object-[50%_35%]"
        fetchPriority="high"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-canvas/40 via-canvas/75 to-canvas" />
      <div className="container-page flex flex-col items-center pt-16 text-center sm:pt-24">
        <p className="hero-in glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-ink shadow-card">
          <span className="size-1.5 rounded-full bg-brand" /> For drivers and commuters in Iligan City
        </p>
        <h1 className="hero-in mt-6 max-w-3xl text-[44px] leading-[1.02] font-bold tracking-[-0.035em] text-ink sm:text-[64px] lg:text-[76px]" style={{ '--d': '80ms' } as React.CSSProperties}>
          Know the road
          <br />
          before you leave.
        </h1>
        <p className="hero-in mt-5 max-w-xl text-[17px] leading-relaxed text-muted sm:text-[19px]" style={{ '--d': '160ms' } as React.CSSProperties}>
          Closures, floods and blocked lanes across Iligan on one map. Report what you see, and it goes straight to the barangay or city office that can fix it.
        </p>
        <div className="hero-in mt-8 flex flex-col gap-3 sm:flex-row" style={{ '--d': '240ms' } as React.CSSProperties}>
          <Link to="/map">
            <Button variant="ink" size="lg" className="w-full sm:w-auto">
              Open the map <ArrowRight className="size-4" weight="bold" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              How it works
            </Button>
          </a>
        </div>
        <p className="hero-in mt-4 text-[13px] text-muted" style={{ '--d': '300ms' } as React.CSSProperties}>
          Free. No account needed to report.
        </p>

        <div className="relative mt-14 flex h-[500px] w-full max-w-3xl justify-center [mask-image:linear-gradient(to_bottom,#000_78%,transparent)] sm:mt-16 sm:h-[560px]">
          <div className="phone-in absolute top-10 left-1/2 hidden -translate-x-[105%] sm:block" style={{ '--d': '420ms', '--r': '-6deg' } as React.CSSProperties}>
            <Phone>
              <AlertScreen />
            </Phone>
          </div>
          <div className="phone-in absolute top-0 left-1/2 -translate-x-1/2 sm:-translate-x-[5%]" style={{ '--d': '300ms' } as React.CSSProperties}>
            <Phone className="w-[240px] sm:w-[262px]">
              <MapScreen />
            </Phone>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- Section shell */

function Section({ id, label, title, intro, children, className }: { id?: string; label: string; title: ReactNode; intro?: ReactNode; children: ReactNode; className?: string }) {
  const ref = useReveal<HTMLElement>()
  return (
    <section id={id} ref={ref} className={cn('container-page py-20 sm:py-28', className)}>
      <div className="reveal mx-auto max-w-2xl text-center">
        <p className="text-[15px] font-semibold text-forest dark:text-brand">{label}</p>
        <h2 className="mt-2 text-[34px] leading-[1.08] font-bold tracking-[-0.03em] sm:text-[48px]">{title}</h2>
        {intro && <p className="mt-4 text-[17px] leading-relaxed text-muted">{intro}</p>}
      </div>
      {children}
    </section>
  )
}

/* ---------------------------------------------------------------- How it works */

const STEPS = [
  {
    icon: Camera,
    title: 'Spot it, snap it',
    body: 'Take a photo, drop a pin and pick the type. Choose which offices get it. Takes under a minute.',
    visual: <StepReport />,
  },
  {
    icon: ShieldCheck,
    title: 'An office checks it',
    body: 'Barangay, ICTPMO or ICDRRMO personnel verify the report and post official closures with a reference number.',
    visual: <StepVerify />,
  },
  {
    icon: Bell,
    title: 'Drivers get warned',
    body: 'Everyone following that barangay gets an alert in the app or by SMS, with the road, status and detour.',
    visual: <StepAlert />,
  },
]

export function HowItWorks() {
  return (
    <Section id="how-it-works" label="How it works" title="From one photo to the whole barangay." intro="Three steps. No hotline, no waiting to hear about a closure after you are already stuck in it.">
      <div className="mt-14 grid gap-4 lg:grid-cols-3">
        {STEPS.map((s, i) => (
          <article key={s.title} className="reveal card flex flex-col overflow-hidden" style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>
            <div className="relative h-56 overflow-hidden bg-fill">{s.visual}</div>
            <div className="p-6">
              <p className="num text-[13px] font-semibold text-muted">Step {i + 1}</p>
              <h3 className="mt-1 text-[22px] font-bold">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.body}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}

function StepReport() {
  return (
    <div className="absolute inset-x-6 top-6 rounded-[18px] bg-surface p-4 shadow-lift">
      <p className="text-[13px] font-semibold">New report</p>
      <div className="mt-3 flex gap-3">
        <img onError={hideBroken} src={ILIGAN_PHOTOS.route9.src} alt="" className="size-16 rounded-[12px] object-cover" loading="lazy" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-8 rounded-[10px] bg-fill px-3 text-[12px] leading-8 text-muted">Road obstruction</div>
          <div className="h-8 rounded-[10px] bg-fill px-3 text-[12px] leading-8 text-muted">Brgy. Tubod</div>
        </div>
      </div>
      <div className="mt-3 flex gap-1.5">
        {['Barangay', 'ICTPMO'].map((o) => (
          <span key={o} className="rounded-full bg-brand/12 px-2.5 py-1 text-[11px] font-semibold text-forest dark:text-brand">
            {o}
          </span>
        ))}
      </div>
    </div>
  )
}

function StepVerify() {
  return (
    <div className="absolute inset-x-6 top-8 space-y-2.5">
      <div className="rounded-[18px] bg-surface p-4 shadow-lift">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold">Stalled truck, one lane</p>
          <span className="rounded-full bg-mint px-2 py-0.5 text-[11px] font-semibold text-forest dark:text-brand">Verified</span>
        </div>
        <p className="mt-1 text-[12px] text-muted">Verified by ICTPMO · 4 min ago</p>
      </div>
      <div className="ml-6 rounded-[18px] bg-surface p-4 shadow-lift">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-red-600 dark:text-red-400">
          <FileBadge className="size-4" weight="fill" /> Officially closed
        </div>
        <p className="num mt-1 font-mono text-[11px] text-muted">Ref. SP Res. No. 2026-118</p>
      </div>
    </div>
  )
}

function StepAlert() {
  return (
    <div className="absolute inset-x-6 top-10 space-y-2">
      <div className="float-y rounded-[18px] bg-surface/95 p-3 shadow-lift backdrop-blur">
        <div className="flex items-center gap-2">
          <img onError={hideBroken} src="/logo-192.webp" alt="" className="size-6 rounded-[6px]" />
          <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">KaDaan</p>
          <p className="ml-auto text-[11px] text-muted">now</p>
        </div>
        <p className="mt-1.5 text-[13px] font-semibold">Tubod · Lane blocked</p>
        <p className="text-[12px] leading-snug text-muted">Stalled truck on the national highway. Expect delays near the bridge.</p>
      </div>
      <div className="mr-10 rounded-[18px] rounded-bl-[6px] bg-[#34c759] px-3.5 py-2.5 text-[12px] leading-snug text-white shadow-lift">
        KaDaan: Tubod natl hwy, 1 lane blocked. Slow down near bridge.
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Offices marquee */

export function Offices() {
  const ref = useReveal<HTMLElement>()
  const items = [...ORGANIZATIONS.map((o) => ({ name: o.name, short: o.short, Icon: o.icon, color: o.color })), { name: 'Land Transportation Office', short: 'LTO', Icon: Users, color: '#0F766E' }]
  return (
    <section id="offices" ref={ref} className="reveal overflow-hidden border-y border-line bg-surface py-10">
      <p className="container-page text-center text-[15px] font-medium text-muted">Reports go to the offices that can act on them</p>
      <div className="relative mt-6 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="marquee gap-3">
          {[...items, ...items].map((o, i) => (
            <span key={i} className="inline-flex h-12 shrink-0 items-center gap-2.5 rounded-full bg-fill pr-5 pl-2 text-[15px] font-semibold whitespace-nowrap">
              <span className="grid size-8 place-items-center rounded-full text-white" style={{ background: o.color }}>
                <o.Icon className="size-4" weight="fill" />
              </span>
              {o.short}
              <span className="hidden font-normal text-muted sm:inline">{o.name}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- Features bento */

export function Features() {
  return (
    <Section id="features" label="Features" title="Built around how Iligan actually moves." intro="Designed with ICTPMO, ICDRRMO, LTO and three barangays, and checked against a survey of 30 local drivers.">
      <div className="mt-14 grid gap-4 md:grid-cols-6">
        <Bento className="md:col-span-4 md:row-span-2" title="One map for every closure" body="Floods, road works, accidents and fiesta closures in one place. Red lines mark closed segments, dashed green lines show the detour." icon={MapIcon}>
          <div className="relative mt-6 h-64 overflow-hidden rounded-[18px] bg-fill sm:h-80">
            <div className="absolute inset-0 origin-center scale-[1.6]">
              <MapScreen bare />
            </div>
            <svg className="absolute inset-0 size-full" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden>
              <path d="M60 230 C 140 200, 170 150, 230 120" stroke="#DC2626" strokeWidth="7" strokeLinecap="round" fill="none" />
              <path d="M60 230 C 110 260, 220 230, 300 160 L 230 120" stroke="#16A34A" strokeWidth="5" strokeDasharray="10 9" strokeLinecap="round" fill="none" />
            </svg>
            <div className="glass absolute bottom-3 left-3 rounded-[14px] px-3 py-2 text-[12px] shadow-float">
              <p className="font-semibold text-red-600 dark:text-red-400">Closed · Quezon Ave</p>
              <p className="text-muted">Detour via Aguinaldo St</p>
            </div>
          </div>
        </Bento>
        <Bento className="md:col-span-2" title="Alerts that work on any phone" body="SMS alerts carry the road, status and detour in the message itself, so a keypad phone is enough." icon={Smartphone} />
        <Bento className="md:col-span-2" title="Official closures, clearly marked" body="Only an office can post an official closure, and it needs a resolution or permit number." icon={FileBadge} />
        <Bento className="md:col-span-2" title="See it coming" body="Planned closures show their start and end time, and followers get warned before they begin." icon={Route} />
        <Bento className="md:col-span-2" title="Private by default" body="No account to report. Your mobile number is only used for alerts, and reporter names are never shown." icon={Lock} />
        <Bento className="md:col-span-2" title="Light on data" body="A text list loads even when the map cannot, for drivers on weak signal." icon={ShieldCheck} />
      </div>
    </Section>
  )
}

function Bento({ title, body, icon: Icon, className, children }: { title: string; body: string; icon: typeof MapIcon; className?: string; children?: ReactNode }) {
  const ref = useReveal<HTMLElement>()
  return (
    <article ref={ref} className={cn('reveal card flex flex-col p-6 sm:p-7', className)}>
      <span className="squircle grid size-11 place-items-center rounded-[13px] bg-brand/12 text-forest dark:text-brand">
        <Icon className="size-6" weight="fill" />
      </span>
      <h3 className="mt-4 text-[20px] font-bold">{title}</h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{body}</p>
      {children}
    </article>
  )
}

/* ---------------------------------------------------------------- Numbers */

const NUMBERS = [
  { value: '83%', label: 'of drivers surveyed only learn about an obstruction when they reach it' },
  { value: '43%', label: 'do not always have mobile data while working' },
  { value: '6', label: 'interviews with barangays and city offices' },
  { value: '44', label: 'barangays covered across Iligan City' },
]

export function Numbers() {
  const ref = useReveal<HTMLElement>()
  return (
    <section ref={ref} className="container-page pb-20 sm:pb-28">
      <div className="reveal card grid overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
        {NUMBERS.map((n, i) => (
          <div key={n.value + i} className={cn('p-7', i > 0 && 'border-t border-line sm:border-t-0', i % 2 === 1 && 'sm:border-l', i >= 2 && 'sm:border-t lg:border-t-0', i > 0 && 'lg:border-l')}>
            <p className="num text-[44px] leading-none font-bold tracking-[-0.03em] text-forest dark:text-brand">{n.value}</p>
            <p className="mt-3 text-[15px] leading-snug text-muted">{n.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[12px] text-muted">From the project’s survey of 30 drivers in Iligan City, October to November 2026.</p>
    </section>
  )
}

/* ---------------------------------------------------------------- Photo band */

export function PhotoBand() {
  const ref = useReveal<HTMLElement>()
  const photos: CityPhoto[] = [ILIGAN_PHOTOS.bonifacio, ILIGAN_PHOTOS.quezon, ILIGAN_PHOTOS.route9]
  return (
    <section ref={ref} className="container-page pb-20 sm:pb-28">
      <div className="grid gap-4 md:grid-cols-3">
        {photos.map((p, i) => (
          <figure key={p.src} className="reveal group relative overflow-hidden rounded-[var(--radius-squircle)] squircle" style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>
            <img onError={hideBroken} src={p.src} alt={p.alt} loading="lazy" className="aspect-[4/5] w-full object-cover transition duration-700 ease-[var(--ease-ios)] group-hover:scale-[1.03] md:aspect-[3/4]" />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12 text-[14px] font-semibold text-white">
              {p.caption}
              <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="text-[11px] font-medium text-white/75 hover:text-white">
                Photo: Wikimedia Commons
              </a>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- FAQ */

const FAQS = [
  { q: 'Do I need an account?', a: 'No. Anyone can view the map, report a road issue and follow barangays. Accounts are only for barangay and city personnel and partner agencies.' },
  { q: 'Who checks the reports?', a: 'Personnel from the barangay, ICTPMO and ICDRRMO. New reports show as Pending Verification until one of them verifies or rejects it. Only they can post an official closure or mark a report resolved.' },
  { q: 'What happens to my mobile number?', a: 'It is optional and only used to send road alerts for the barangays you follow. It is never shown on the map or shared with other users. You agree to a Data Privacy notice before saving it.' },
  { q: 'Does it work on a slow connection?', a: 'Yes. The report list loads even when the map cannot, and SMS alerts carry the full message so you do not need to open a link.' },
  { q: 'Is KaDaan an official city service?', a: 'Not yet. KaDaan is a prototype built for an ISY108 Requirements Engineering project at MSU-IIT, based on interviews with Iligan offices and barangays. Reports marked Sample are demonstration data.' },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <Section id="faq" label="FAQ" title="Questions, answered.">
      <div className="mx-auto mt-12 max-w-2xl">
        <div className="card overflow-hidden">
          {FAQS.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q} className={cn(i > 0 && 'border-t border-line')}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-[17px] font-semibold"
                >
                  {f.q}
                  <ChevronDown className={cn('size-4 shrink-0 text-muted transition-transform duration-300 ease-[var(--ease-ios)]', isOpen && 'rotate-180')} weight="bold" />
                </button>
                <div className={cn('grid transition-[grid-template-rows] duration-400 ease-[var(--ease-ios)]', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                  <p className="overflow-hidden px-6 text-[15px] leading-relaxed text-muted">
                    <span className="block pb-5">{f.a}</span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

/* ---------------------------------------------------------------- Closing CTA */

export function ClosingCta() {
  const { openModal } = useApp()
  const ref = useReveal<HTMLElement>()
  return (
    <section ref={ref} className="container-page pb-20 sm:pb-28">
      <div className="reveal relative isolate overflow-hidden rounded-[32px] px-6 py-20 text-center squircle sm:py-28">
        <img onError={hideBroken} src={ILIGAN_PHOTOS.skyline.src} alt="" loading="lazy" className="absolute inset-0 -z-20 size-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-[#0b2414]/70" />
        <h2 className="mx-auto max-w-2xl text-[36px] leading-[1.05] font-bold tracking-[-0.03em] text-white sm:text-[56px]">See what’s ahead on your route.</h2>
        <p className="mx-auto mt-4 max-w-md text-[17px] text-white/80">Open the map before your next trip, or report something you just passed.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/map">
            <Button size="lg" className="w-full bg-white text-[#0b0d0c] hover:bg-white/90 sm:w-auto">
              Open the map <ArrowUpRight className="size-4" weight="bold" />
            </Button>
          </Link>
          <Button size="lg" variant="ghost" className="text-white ring-1 ring-white/30 hover:bg-white/10" onClick={() => openModal('report')}>
            Report a road issue
          </Button>
        </div>
      </div>
    </section>
  )
}
