import { CheckCircle2, Globe2, Plus } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { getCategory } from '../../data/categories'
import { isInScope } from '../../data/locations'
import { formatDateTime } from '../../lib/reportUtils'
import type { Report } from '../../types/report'
import { StatusBadge } from '../common/Badge'
import { Button } from '../common/Button'
import { LogoMark } from '../common/Logo'
import { Modal } from '../common/Modal'
import { ReportForm } from './ReportForm'

/** Report-an-issue flow: form → confirmation. */
export function ReportModal() {
  const { modal, closeModal, pushToast, openReport, scope, setScope } = useApp()
  const [submitted, setSubmitted] = useState<Report | null>(null)
  const [formKey, setFormKey] = useState(0)
  const open = modal === 'report'

  const close = () => {
    closeModal()
    window.setTimeout(() => {
      setSubmitted(null)
      setFormKey((k) => k + 1)
    }, 200)
  }

  const onSubmitted = (r: Report) => {
    setSubmitted(r)
    const cat = getCategory(r.category)
    pushToast({
      tone: cat.severity === 'high' ? 'alert' : 'success',
      title: `New ${cat.label.toLowerCase()} report in ${r.city}`,
      description: 'Simulated in-app alert — shown in this browser only, no push notifications are sent.',
    })
  }

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title={
        submitted ? undefined : (
          <div className="flex items-center gap-3">
            <LogoMark className="size-10" />
            <div>
              <h2 className="text-lg font-bold">Report a road issue</h2>
              <p className="text-sm text-muted">Help fellow road users see what’s ahead.</p>
            </div>
          </div>
        )
      }
      ariaLabel="Report submitted"
    >
      {submitted ? (
        <div className="px-5 pt-8 pb-6 text-center sm:px-8">
          <div className="mx-auto grid size-16 animate-fade-up place-items-center rounded-full bg-mint text-forest">
            <CheckCircle2 className="size-9" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold">Your report has been submitted!</h2>
          <p className="mt-1.5 text-sm text-muted">Thanks for keeping the road informed. It now appears in the listings and on the map.</p>

          <dl className="mt-6 divide-y divide-line rounded-2xl border border-line text-left text-sm">
            {[
              ['Report ID', <span key="id" className="font-mono font-semibold">{submitted.id}</span>],
              ['Incident category', getCategory(submitted.category).label],
              ['Location', `${submitted.location}, ${submitted.city}, ${submitted.province}`],
              ['Submitted', formatDateTime(submitted.createdAt)],
              ['Status', <StatusBadge key="s" status={submitted.status} />],
            ].map(([k, v], i) => (
              <div key={i} className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="shrink-0 text-muted">{k}</dt>
                <dd className="text-right font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted">
            Saved in this browser only (prototype). {submitted.coordinates ? '' : 'No map pin was added, so it appears in the list but not on the map.'}
          </p>

          {!isInScope(submitted.city, scope) && (
            <div className="mt-4 flex flex-col items-center gap-2 rounded-xl bg-canvas p-3 text-sm sm:flex-row sm:justify-between">
              <span className="text-muted">This report is outside Iligan City.</span>
              <Button size="sm" variant="outline" onClick={() => setScope('philippines')}>
                <Globe2 className="size-4" /> Switch to Philippines view
              </Button>
            </div>
          )}

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            <Button
              variant="primary"
              onClick={() => {
                const id = submitted.id
                close()
                window.setTimeout(() => openReport(id), 220)
              }}
            >
              View report
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSubmitted(null)
                setFormKey((k) => k + 1)
              }}
            >
              <Plus className="size-4" /> Report another
            </Button>
            <Button variant="ghost" onClick={close}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <ReportForm key={formKey} onSubmitted={onSubmitted} />
      )}
    </Modal>
  )
}
