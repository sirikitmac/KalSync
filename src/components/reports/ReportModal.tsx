import { CheckCircle2, Plus } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { getCategory } from '../../data/categories'
import { orgNames } from '../../data/organizations'
import { formatDateTime } from '../../lib/reportUtils'
import type { Report } from '../../types/report'
import { StatusBadge } from '../common/Badge'
import { Button } from '../common/Button'
import { LogoMark } from '../common/Logo'
import { Modal } from '../common/Modal'
import { ReportForm } from './ReportForm'

/** Report-an-issue flow: form → confirmation. */
export function ReportModal() {
  const { modal, closeModal, pushToast, openReport } = useApp()
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
      title: `Report sent to ${orgNames(r.reportedTo)}`,
      description: `${cat.label} in Brgy. ${r.barangay}. Pending verification by personnel.`,
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
          <h2 className="mt-4 text-2xl font-extrabold">Report sent!</h2>
          <p className="mt-1.5 text-sm text-muted">
            Sent to <strong className="text-ink">{orgNames(submitted.reportedTo)}</strong>. It’s visible to others now as{' '}
            <strong className="text-ink">Pending verification</strong> until personnel check it.
          </p>

          <dl className="mt-6 divide-y divide-line rounded-2xl border border-line text-left text-sm">
            {[
              ['Report ID', <span key="id" className="font-mono font-semibold">{submitted.id}</span>],
              ['Incident category', getCategory(submitted.category).label],
              ['Location', `${submitted.location}, Brgy. ${submitted.barangay}`],
              ['Sent to', orgNames(submitted.reportedTo)],
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
            You’ll see the status change here when an office verifies or resolves it.{' '}
            {submitted.coordinates ? '' : 'No map pin was added, so it appears in the list but not on the map.'}
          </p>

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
