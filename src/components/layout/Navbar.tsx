import { Menu, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/cn'
import { NotificationCenter } from '../alerts/NotificationCenter'
import { Button } from '../common/Button'
import { Logo } from '../common/Logo'

const LINKS = [
  { to: '/', label: 'Home', hash: '' },
  { to: '/#how-it-works', label: 'How It Works', hash: '#how-it-works' },
  { to: '/reports', label: 'Road Reports', hash: '' },
  { to: '/#about', label: 'About', hash: '#about' },
]

export function Navbar() {
  const { openModal } = useApp()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname, location.hash])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  const isActive = (l: (typeof LINKS)[number]) =>
    l.hash ? location.pathname === '/' && location.hash === l.hash : location.pathname === l.to && (l.to !== '/' || !location.hash)

  return (
    <header
      className={cn(
        'sticky top-0 z-[800] border-b transition-colors duration-200',
        scrolled || open ? 'border-line bg-white/90 backdrop-blur-md' : 'border-transparent bg-canvas/70 backdrop-blur-sm',
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-3 lg:h-[72px]" aria-label="Main">
        <Link to="/" className="rounded-lg" aria-label="KalSync home" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Logo />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.label}>
              <NavLink
                to={l.to}
                onClick={() => !l.hash && l.to === '/' && window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={cn(
                  'rounded-lg px-3.5 py-2 text-[15px] font-medium transition',
                  isActive(l) ? 'text-forest' : 'text-muted hover:text-ink',
                )}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 sm:gap-2">
          <NotificationCenter />
          <Button variant="ghost" className="max-lg:hidden" onClick={() => openModal('join')}>
            Sign In
          </Button>
          <Button onClick={() => openModal('report')} className="h-11 px-3.5 sm:px-4.5" aria-label="Report an Issue">
            <Plus className="size-4.5" />
            <span className="hidden min-[400px]:inline">
              Report<span className="hidden sm:inline"> an Issue</span>
            </span>
          </Button>
          <button
            className="grid size-11 cursor-pointer place-items-center rounded-xl text-ink hover:bg-ink/5 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="size-5.5" /> : <Menu className="size-5.5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-16 bottom-0 z-[800] animate-fade-in overflow-y-auto bg-white lg:hidden">
          <ul className="container-page flex flex-col py-4">
            {LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  onClick={() => {
                    setOpen(false)
                    if (!l.hash && l.to === '/') window.scrollTo({ top: 0 })
                  }}
                  className={cn(
                    'flex min-h-14 items-center border-b border-line text-lg font-semibold',
                    isActive(l) ? 'text-forest' : 'text-ink',
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="container-page pb-safe grid gap-2 pt-2">
            <Button size="lg" onClick={() => { setOpen(false); openModal('report') }}>
              <Plus className="size-5" /> Report an Issue
            </Button>
            <Button size="lg" variant="secondary" onClick={() => { setOpen(false); openModal('join') }}>
              Sign In
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
