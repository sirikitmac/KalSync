import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useReports } from '../../context/ReportsContext'
import { ILIGAN_PHOTOS } from '../../data/iliganPhotos'
import { Logo } from '../common/Logo'

export function Footer() {
  const { pushToast, openModal } = useApp()
  const { resetLocalData } = useReports()

  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Road status and road reports for Iligan City, sent to the barangay and city offices that can act on them.
          </p>
        </div>
        <div>
          <p className="text-[15px] font-semibold">Use KaDaan</p>
          <ul className="mt-3 space-y-1 text-[15px] text-muted">
            <li><Link className="inline-block py-1.5 hover:text-ink" to="/map">Road map</Link></li>
            <li><button className="cursor-pointer py-1.5 hover:text-ink" onClick={() => openModal('report')}>Report a road issue</button></li>
            <li><button className="cursor-pointer py-1.5 hover:text-ink" onClick={() => openModal('alerts')}>Barangay alerts</button></li>
          </ul>
        </div>
        <div>
          <p className="text-[15px] font-semibold">About</p>
          <ul className="mt-3 space-y-1 text-[15px] text-muted">
            <li><Link className="inline-block py-1.5 hover:text-ink" to="/#how-it-works">How it works</Link></li>
            <li><Link className="inline-block py-1.5 hover:text-ink" to="/#offices">Offices</Link></li>
            <li><Link className="inline-block py-1.5 hover:text-ink" to="/#faq">FAQ</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-3 py-6 text-[12px] leading-relaxed text-muted sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-2xl">
            KaDaan is a prototype for ISY108, MSU-IIT. Reports marked Sample, and the resolution and permit numbers on them, are made up for demonstration.
            Map data © OpenStreetMap contributors. City photos from Wikimedia Commons:{' '}
            {Object.values(ILIGAN_PHOTOS).map((p, i, a) => (
              <span key={p.src}>
                <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:text-ink hover:underline">
                  {p.caption}
                </a>
                {i < a.length - 1 ? ', ' : '.'}
              </span>
            ))}
          </p>
          <button
            className="shrink-0 cursor-pointer self-start underline-offset-2 hover:text-ink hover:underline"
            onClick={async () => {
              if (!window.confirm('Remove your submitted reports, confirmations, and sample status changes from this browser?')) return
              await resetLocalData()
              pushToast({ tone: 'info', title: 'Data on this browser cleared' })
            }}
          >
            Reset data on this browser
          </button>
        </div>
      </div>
    </footer>
  )
}
