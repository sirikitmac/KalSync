import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/cn'
import { Button } from '../common/Button'
import { ArrowRight, Menu, X } from '../common/icons'
import { Logo } from '../common/Logo'
import { ThemeToggle } from '../common/ThemeToggle'

const LINKS = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#features', label: 'Features' },
  { href: '/#offices', label: 'Offices' },
  { href: '/#faq', label: 'FAQ' },
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

  return (
    <header className="sticky top-0 z-[800] px-3 pt-3 sm:px-4">
      <nav
        aria-label="Main"
        className={cn(
          'mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-full pr-2 pl-4 transition-all duration-300 ease-[var(--ease-ios)]',
          scrolled || open ? 'glass shadow-float' : 'bg-transparent',
        )}
      >
        <Link to="/" aria-label="KaDaan home" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Logo />
        </Link>
        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.label}>
              <Link to={l.href} className="rounded-full px-3.5 py-2 text-[15px] font-medium text-muted transition hover:text-ink">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login" className="rounded-full px-3 py-2 text-[15px] font-medium text-muted transition hover:text-ink">
              Staff sign in
            </Link>
            <ThemeToggle />
            <Button variant="secondary" className="h-10" onClick={() => openModal('report')}>
              Report
            </Button>
          </div>
          <Link to="/map">
            <Button variant="ink" className="h-10 px-4">
              Open map <ArrowRight className="size-4" weight="bold" />
            </Button>
          </Link>
          <button
            className="grid size-10 cursor-pointer place-items-center rounded-full text-ink hover:bg-ink/5 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="glass mx-auto mt-2 max-w-6xl animate-pop rounded-[24px] p-2 shadow-float lg:hidden">
          {LINKS.map((l) => (
            <Link key={l.label} to={l.href} className="flex h-12 items-center rounded-2xl px-4 text-[17px] font-semibold hover:bg-fill">
              {l.label}
            </Link>
          ))}
          <div className="mt-1 flex items-center justify-between gap-3 border-t border-line px-4 pt-3 pb-2">
            <span className="text-[15px] font-medium text-muted">Appearance</span>
            <ThemeToggle />
          </div>
          <div className="grid gap-2 px-2 pt-2 pb-1">
            <Button size="lg" variant="secondary" onClick={() => openModal('report')}>
              Report a road issue
            </Button>
            <Button size="lg" variant="secondary" onClick={() => openModal('alerts')}>
              Get barangay alerts
            </Button>
            <Link to="/login">
              <Button size="lg" variant="ghost" className="w-full">
                Staff sign in
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
