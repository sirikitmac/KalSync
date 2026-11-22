import { useEffect, type ComponentType } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  Camera,
  CheckCircle2,
  Clock,
  Expand,
  FileBadge,
  Hand,
  ListFilter,
  LocateFixed,
  Lock,
  Map,
  Megaphone,
  Play,
} from '../components/common/icons'

type Icon = ComponentType<{ className?: string; weight?: 'fill' | 'regular' | 'bold' }>
type Topic = { icon: Icon; title: string; steps: string[]; note?: string }

const ROAD_USERS: Topic[] = [
  {
    icon: Map,
    title: 'Read the map',
    steps: [
      'Open the map. Each pin is an active report; its color shows the kind of problem.',
      'The tiles at the top of the panel count active reports, road closures, and high-risk hazards. Tap one to show only those.',
      'Drag the panel’s handle up or down to see more of the list or more of the map.',
    ],
    note: 'Resolved and rejected reports leave the map. You can still find them in Report history.',
  },
  {
    icon: ListFilter,
    title: 'Search and filter',
    steps: [
      'Type a road or barangay in the search bar to move the map there.',
      'Tap a category, such as Flooding, to show only that kind of report.',
      'Use the layout buttons to switch between gallery, grid, and list. The list is lightest on a slow connection.',
    ],
  },
  {
    icon: BadgeCheck,
    title: 'Open a report',
    steps: [
      'Tap a pin or a card.',
      'Check the badges: Pending, Verified, or Resolved, and whether the road is an Advisory or Officially Closed.',
      'Read the suggested detour and the offices the report was sent to. The map draws the closed segment in red and the detour in green.',
    ],
    note: 'Officially Closed means an office posted the closure with a resolution or permit number. An Advisory comes from road users.',
  },
  {
    icon: Hand,
    title: 'Confirm a report you also saw',
    steps: ['Open the report.', 'Tap “I’ve encountered this too”. The count goes up by one, so the offices know more people saw it.'],
  },
  {
    icon: Camera,
    title: 'Report a road problem',
    steps: [
      'Stop somewhere safe first.',
      'Tap Report on the map.',
      'Take or upload a photo, choose the category and how serious it is, and drop the pin where it is.',
      'Give it a short title and choose the offices to notify. The description is optional.',
      'For planned work or events, add when the closure starts and ends.',
      'Agree to the Data Privacy notice and tap Submit. Your report appears on the map as Pending.',
    ],
  },
  {
    icon: Bell,
    title: 'Get barangay alerts',
    steps: [
      'Tap “Get alerts for your barangay” on the map, or Barangay alerts in the ☰ menu.',
      'Choose the barangays you pass through. You can add a mobile number for SMS alerts.',
      'Agree to the Data Privacy notice and save. New closures and hazards there appear under the bell.',
    ],
    note: 'No account is needed. Your choices are saved on this phone. SMS sending is planned and not yet active.',
  },
  {
    icon: LocateFixed,
    title: 'Follow your location',
    steps: [
      'Tap the location button on the right of the map and allow location access.',
      'The map follows you while you move. Drag the map to stop following, and tap the button again to resume.',
    ],
    note: 'Your location stays on your phone and is not sent to KaDaan.',
  },
  {
    icon: Expand,
    title: 'See the map only',
    steps: ['Tap the expand button on the right of the map to hide the panel.', 'Tap a pin to bring the panel back with that report, or tap the button again.'],
  },
  {
    icon: Clock,
    title: 'Look up past reports',
    steps: ['Open Report history from the ☰ menu or the bottom of the list.', 'Use the tabs for Resolved, Official closures, and Rejected, or search by road or report ID.'],
  },
]

const PERSONNEL: Topic[] = [
  {
    icon: Lock,
    title: 'Sign in',
    steps: [
      'Open Staff sign in from the ☰ menu.',
      'Sign in with your email and password, or create an account.',
      'A new account waits as Pending until the administrator approves it and assigns your office.',
    ],
  },
  {
    icon: BadgeCheck,
    title: 'Verify or reject a report',
    steps: [
      'Open a Pending report. Staff actions appear under the report.',
      'Check the photo and the number of people who confirmed it.',
      'Tap Verify if it is real, or Reject if it is false or a duplicate. Rejected reports leave the map.',
    ],
  },
  {
    icon: FileBadge,
    title: 'Post an official closure',
    steps: [
      'Open a Verified report and tap Post official closure.',
      'Enter the resolution, ordinance, or permit reference number, and a detour if there is one.',
      'Tap Post. The road shows as Officially Closed. Use Lift closure to turn it back into an advisory.',
    ],
    note: 'A road cannot be marked Officially Closed without a reference number.',
  },
  {
    icon: CheckCircle2,
    title: 'Resolve or reopen',
    steps: [
      'When the road is clear, open the report and tap Resolve. It leaves the map and moves to Report history.',
      'To clear many at once, filter the list and tap Resolve all shown at the bottom.',
      'To bring a report back, open it from Report history and tap Reopen.',
    ],
  },
  {
    icon: Megaphone,
    title: 'Send a barangay alert',
    steps: [
      'Open the ☰ menu and tap Send barangay alert, or tap Alert followers on a report.',
      'Choose the barangays and the severity, and write a short message with the road, the status, and the detour.',
      'Tap Send. Everyone who follows those barangays sees it under the bell.',
    ],
  },
]

function Section({ id, title, intro, topics }: { id: string; title: string; intro: string; topics: Topic[] }) {
  return (
    <section id={id} className="mt-10 scroll-mt-6">
      <h2 className="text-[26px] font-bold">{title}</h2>
      <p className="mt-1 text-[16px] text-muted">{intro}</p>
      <div className="mt-4 flex flex-col gap-3">
        {topics.map((t) => (
          <article key={t.title} className="card p-5">
            <div className="flex items-center gap-3">
              <span className="squircle grid size-10 shrink-0 place-items-center rounded-[12px] bg-brand/12 text-forest dark:text-brand">
                <t.icon className="size-5" weight="fill" />
              </span>
              <h3 className="text-[18px] font-bold">{t.title}</h3>
            </div>
            <ol className="mt-3 flex flex-col gap-2">
              {t.steps.map((s, k) => (
                <li key={k} className="flex gap-3 text-[15px] leading-relaxed">
                  <span className="num mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-fill text-[13px] font-semibold text-muted">{k + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            {t.note && <p className="mt-3 rounded-xl bg-fill/70 px-3 py-2 text-[14px] leading-relaxed text-muted">{t.note}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}

/** In-app user guide: every function, for road users and for personnel (RTM-14). */
export function HelpPage() {
  const navigate = useNavigate()
  useEffect(() => {
    document.title = 'How to use KaDaan'
  }, [])

  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <Link to="/map" className="inline-flex items-center gap-1.5 text-[15px] font-medium text-forest dark:text-brand">
        <ArrowLeft className="size-4" weight="bold" /> Back to the map
      </Link>
      <h1 className="mt-4 text-[34px] leading-tight font-bold sm:text-[44px]">How to use KaDaan</h1>
      <p className="mt-2 text-[17px] text-muted">Short steps for everything in the app. Road users need no account; the personnel part is for barangay, ICTPMO, and ICDRRMO staff.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => navigate('/map?tour=1')}
          className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-forest px-5 text-[15px] font-semibold text-white transition active:scale-[0.98]"
        >
          <Play className="size-4" weight="fill" /> Replay the welcome tour
        </button>
        <a href="#road-users" className="inline-flex h-11 items-center rounded-full bg-surface px-5 text-[15px] font-semibold shadow-card">
          Road users
        </a>
        <a href="#personnel" className="inline-flex h-11 items-center rounded-full bg-surface px-5 text-[15px] font-semibold shadow-card">
          Personnel
        </a>
      </div>

      <Section id="road-users" title="For road users" intro="Drivers, commuters, and residents. No account needed." topics={ROAD_USERS} />
      <Section id="personnel" title="For personnel" intro="Staff of the barangays, ICTPMO, and ICDRRMO, after signing in." topics={PERSONNEL} />
    </div>
  )
}
