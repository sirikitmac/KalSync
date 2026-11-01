import { AtSign, Mail, MessageCircle, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useReports } from '../../context/ReportsContext'
import { Logo } from '../common/Logo'

const SOCIALS = [
  { label: 'Facebook (coming soon)', icon: Share2 },
  { label: 'Instagram (coming soon)', icon: AtSign },
  { label: 'Messenger community (coming soon)', icon: MessageCircle },
]

export function Footer() {
  const { pushToast } = useApp()
  const { resetLocalData } = useReports()

  const soon = (what: string) =>
    pushToast({ tone: 'info', title: `${what} is coming soon`, description: 'This page will be published before public launch.' })

  return (
    <footer className="mt-24 border-t border-line bg-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Community-powered road awareness for Filipino riders, commuters, and motorists. Launching in Iligan City, built
            for the whole Philippines.
          </p>
          <p className="mt-4 font-display text-sm font-bold text-forest">See What’s Ahead.</p>
          <div className="mt-5 flex gap-2">
            {SOCIALS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                aria-label={label}
                title={label}
                onClick={() => soon('Our social page')}
                className="grid size-11 cursor-pointer place-items-center rounded-xl border border-line text-muted transition hover:border-forest/30 hover:text-forest"
              >
                <Icon className="size-4.5" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Product</p>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            <li><Link className="inline-block py-1.5 hover:text-forest" to="/reports">Road Reports</Link></li>
            <li><Link className="inline-block py-1.5 hover:text-forest" to="/#map">Road Map</Link></li>
            <li><Link className="inline-block py-1.5 hover:text-forest" to="/#how-it-works">How It Works</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Company</p>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            <li><Link className="inline-block py-1.5 hover:text-forest" to="/#about">About</Link></li>
            <li>
              <a className="inline-flex items-center gap-1.5 py-1.5 hover:text-forest" href="mailto:hello@kalsync.example">
                <Mail className="size-3.5" /> Contact
              </a>
            </li>
            <li><button className="cursor-pointer py-1.5 hover:text-forest" onClick={() => soon('Privacy Policy')}>Privacy Policy</button></li>
            <li><button className="cursor-pointer py-1.5 hover:text-forest" onClick={() => soon('Terms of Service')}>Terms of Service</button></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-3 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} KalSync · Prototype. Reports shown are sample data unless marked as yours. Not affiliated with any government agency.</p>
          <button
            className="cursor-pointer self-start underline-offset-2 hover:text-ink hover:underline sm:self-auto"
            onClick={async () => {
              if (!window.confirm('Remove your submitted reports, confirmations, and demo status changes from this browser?')) return
              await resetLocalData()
              pushToast({ tone: 'info', title: 'Local prototype data cleared' })
            }}
          >
            Reset local prototype data
          </button>
        </div>
      </div>
    </footer>
  )
}
