import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { BARANGAYS } from '../../data/barangays'
import { cn } from '../../lib/cn'
import { sendBarangayAlert } from '../../services/staffService'
import type { Report, Severity } from '../../types/report'
import { Button } from '../common/Button'
import { LoaderCircle, Search, Send, X } from '../common/icons'
import { Modal } from '../common/Modal'

const SMS_LIMIT = 150 // "KaDaan: " is added in front, and one SMS is 160 characters

/** UC-10 Send Barangay Alert. Personnel and admins only (checked again by the database). */
export function SendAlertModal({ open, onClose, report }: { open: boolean; onClose: () => void; report?: Report | null }) {
  const { pushToast } = useApp()
  const [picked, setPicked] = useState<string[]>(() => (report?.barangay ? [report.barangay] : []))
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState<Severity>('high')
  const [message, setMessage] = useState(() =>
    report ? `${report.title}${report.barangay ? `, Brgy. ${report.barangay}` : ''}.`.slice(0, SMS_LIMIT) : '',
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? BARANGAYS.filter((b) => b.toLowerCase().includes(q)) : BARANGAYS
  }, [query])

  const toggle = (b: string) => setPicked((p) => (p.includes(b) ? p.filter((x) => x !== b) : [...p, b]))

  const send = async () => {
    setError(null)
    if (picked.length === 0) return setError('Choose at least one barangay.')
    if (message.trim().length < 5) return setError('Write the alert message.')
    setBusy(true)
    try {
      await sendBarangayAlert({ barangays: picked, message, severity, reportId: report?.id.startsWith('DEMO-') ? null : report?.id })
      pushToast({ tone: 'success', title: 'Alert sent', description: `Followers of ${picked.length === 1 ? `Brgy. ${picked[0]}` : `${picked.length} barangays`} will see it now.` })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The alert could not be sent.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<span className="text-[17px] font-bold">Send barangay alert</span>}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="ink" onClick={() => void send()} disabled={busy}>
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />} Send alert
          </Button>
        </div>
      }
    >
      <div className="space-y-5 px-5 pb-2 sm:px-6">
        <div>
          <p className="label">Barangays</p>
          {picked.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {picked.map((b) => (
                <button key={b} onClick={() => toggle(b)} className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full bg-forest pr-2 pl-3 text-[13px] font-semibold text-white">
                  {b} <X className="size-3.5" weight="bold" />
                </button>
              ))}
            </div>
          )}
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input className="input pl-9" placeholder="Search barangay" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="mt-2 flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">
            {list.map((b) => (
              <button
                key={b}
                onClick={() => toggle(b)}
                aria-pressed={picked.includes(b)}
                className={cn('h-8 cursor-pointer rounded-full px-3 text-[13px] font-medium transition', picked.includes(b) ? 'bg-forest text-white' : 'bg-fill text-ink')}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="label">Severity</p>
          <div className="grid grid-cols-3 gap-2">
            {(['high', 'medium', 'low'] as Severity[]).map((s) => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                aria-pressed={severity === s}
                className={cn('h-10 cursor-pointer rounded-xl text-[14px] font-semibold capitalize transition', severity === s ? 'bg-ink text-canvas' : 'bg-fill text-ink')}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="alert-msg" className="label">
            Message
          </label>
          <textarea
            id="alert-msg"
            className="input min-h-24 py-2.5"
            maxLength={SMS_LIMIT}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Road, status and detour. Example: Quezon Ave closed until 5 PM. Use Aguinaldo St."
          />
          <p className="mt-1 text-right text-[12px] text-muted num">
            {message.length}/{SMS_LIMIT} · fits one SMS
          </p>
        </div>
        {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[14px] text-red-700">{error}</p>}
        <p className="text-[12px] leading-snug text-muted">
          Followers see the alert in the app right away. SMS copies are queued for followers who saved a number and go out once an SMS provider is connected.
        </p>
      </div>
    </Modal>
  )
}
