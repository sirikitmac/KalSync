import { BellRing, ShieldCheck, UserRound, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { Button } from '../common/Button'
import { LogoMark } from '../common/Logo'
import { Modal } from '../common/Modal'

/** Sign In / Join — honest about what the prototype can do today. */
export function JoinModal() {
  const { modal, closeModal, openModal } = useApp()
  const navigate = useNavigate()
  return (
    <Modal open={modal === 'join'} onClose={closeModal} title="Join the KalSync Community">
      <div className="px-5 py-6 sm:px-6">
        <div className="flex items-center gap-3">
          <LogoMark className="size-12" />
          <div>
            <p className="font-display text-lg font-bold">Accounts are on the way</p>
            <p className="text-sm text-muted">This prototype works without signing in.</p>
          </div>
        </div>
        <ul className="mt-6 space-y-3 text-sm">
          {[
            [UserRound, 'Report and confirm right now', 'Your reports and confirmations are saved in this browser.'],
            [ShieldCheck, 'Coming with accounts', 'Trusted reporter profiles, report history across devices, and moderation.'],
            [BellRing, 'Coming with accounts', 'Real-time alerts for the routes you take most often.'],
            [Users, 'Community', 'Riders’ groups, barangay partners, and local volunteers.'],
          ].map(([Icon, t, d], i) => {
            const I = Icon as typeof UserRound
            return (
              <li key={i} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-mint text-forest">
                  <I className="size-4.5" />
                </span>
                <span>
                  <span className="block font-semibold text-ink">{t as string}</span>
                  <span className="text-muted">{d as string}</span>
                </span>
              </li>
            )
          })}
        </ul>
        <div className="mt-7 grid gap-2 sm:grid-cols-2">
          <Button onClick={() => { closeModal(); window.setTimeout(() => openModal('report'), 50) }}>Report a Road Issue</Button>
          <Button variant="secondary" onClick={() => { closeModal(); navigate('/reports') }}>
            Explore Road Reports
          </Button>
        </div>
      </div>
    </Modal>
  )
}
