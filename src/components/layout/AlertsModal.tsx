import { BellRing, Check, LoaderCircle, Search, ShieldCheck, Smartphone, X } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useApp } from '../../context/AppContext'
import { BARANGAYS } from '../../data/barangays'
import { cn } from '../../lib/cn'
import { PH_MOBILE } from '../../services/alertService'
import { Button } from '../common/Button'
import { Modal } from '../common/Modal'

/**
 * "Get alerts" — riders follow barangays and (optionally) leave an SMS number.
 * No account needed. Saved through alertService (simulated server).
 */
export function AlertsModal() {
  const { modal, closeModal, alertPrefs, saveAlertPrefs, pushToast } = useApp()
  const open = modal === 'alerts'
  const [selected, setSelected] = useState<string[]>(alertPrefs.barangays)
  const [sms, setSms] = useState(alertPrefs.sms ?? '')
  const [consent, setConsent] = useState(!!alertPrefs.consentedAt)
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ barangays?: string; sms?: string; consent?: string }>({})

  // Reset the form to the saved preferences every time it opens
  useEffect(() => {
    if (!open) return
    setSelected(alertPrefs.barangays)
    setSms(alertPrefs.sms ?? '')
    setConsent(!!alertPrefs.consentedAt)
    setQuery('')
    setErrors({})
  }, [open, alertPrefs])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? BARANGAYS.filter((b) => b.toLowerCase().includes(q)) : BARANGAYS
  }, [query])

  const toggle = (b: string) => {
    setSelected((s) => (s.includes(b) ? s.filter((x) => x !== b) : [...s, b]))
    setErrors((e) => ({ ...e, barangays: undefined }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const cleaned = sms.replace(/[\s-]/g, '')
    const next: typeof errors = {}
    if (selected.length === 0) next.barangays = 'Follow at least one barangay.'
    if (cleaned && !PH_MOBILE.test(cleaned)) next.sms = 'Use the format 09XXXXXXXXX (11 digits).'
    if (!consent) next.consent = 'Please agree so we can send you alerts.'
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    try {
      await saveAlertPrefs({ barangays: selected, sms: cleaned || undefined })
      pushToast({
        tone: 'success',
        title: `Following ${selected.length} barangay${selected.length > 1 ? 's' : ''}`,
        description: cleaned ? `Road alerts will also be sent by SMS to ${cleaned.slice(0, 4)}•••${cleaned.slice(-3)}.` : 'You’ll see their alerts under the bell icon.',
      })
      closeModal()
    } catch {
      pushToast({ tone: 'alert', title: 'Couldn’t save your alert settings', description: 'Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={closeModal}
      size="lg"
      title={
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-mint text-forest">
            <BellRing className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold">Get road alerts</h2>
            <p className="text-sm text-muted">Follow barangays you pass through. No account needed.</p>
          </div>
        </div>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col">
        <div className="space-y-6 px-5 py-5 sm:px-6">
          <fieldset>
            <div className="flex items-baseline justify-between gap-2">
              <legend className="label">Barangays to follow</legend>
              <span className="text-xs text-muted tabular-nums">{selected.length} selected</span>
            </div>
            {selected.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {selected.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggle(b)}
                    className="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-full bg-forest px-3 text-xs font-semibold text-white"
                    aria-label={`Unfollow ${b}`}
                  >
                    {b} <X className="size-3.5" />
                  </button>
                ))}
              </div>
            )}
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
              <input className="input pl-10" placeholder="Search 44 barangays" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search barangays" />
            </div>
            <div className={cn('mt-2 grid max-h-56 grid-cols-2 gap-1.5 overflow-y-auto rounded-xl border p-1.5 sm:grid-cols-3', errors.barangays ? 'border-danger/50' : 'border-line')}>
              {list.map((b) => {
                const on = selected.includes(b)
                return (
                  <button
                    key={b}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggle(b)}
                    className={cn(
                      'flex min-h-10 cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 text-left text-[13px] font-medium transition',
                      on ? 'bg-mint text-forest' : 'text-ink hover:bg-canvas',
                    )}
                  >
                    <span className="truncate">{b}</span>
                    {on && <Check className="size-4 shrink-0" />}
                  </button>
                )
              })}
              {list.length === 0 && <p className="col-span-full px-2 py-4 text-center text-sm text-muted">No barangay matches “{query}”.</p>}
            </div>
            {errors.barangays && <p className="mt-1.5 text-[13px] font-medium text-danger">{errors.barangays}</p>}
          </fieldset>

          <div>
            <label htmlFor="a-sms" className="label">
              Mobile number for SMS <span className="font-normal text-muted">(optional)</span>
            </label>
            <div className="relative">
              <Smartphone className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
              <input
                id="a-sms"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                className={cn('input pl-10', errors.sms && 'border-danger')}
                placeholder="09XXXXXXXXX"
                value={sms}
                maxLength={13}
                onChange={(e) => {
                  setSms(e.target.value)
                  setErrors((x) => ({ ...x, sms: undefined }))
                }}
                aria-invalid={!!errors.sms}
              />
            </div>
            {errors.sms ? (
              <p className="mt-1.5 text-[13px] font-medium text-danger">{errors.sms}</p>
            ) : (
              <p className="mt-1.5 text-xs text-muted">For riders without data. Only official closures and high-severity hazards are sent by SMS.</p>
            )}
          </div>

          <label className={cn('flex cursor-pointer gap-3 rounded-2xl border p-3.5 text-sm', consent ? 'border-forest/30 bg-mint/40' : errors.consent ? 'border-danger/50 bg-red-50/40' : 'border-line bg-canvas')}>
            <input
              type="checkbox"
              className="mt-0.5 size-4.5 shrink-0 accent-[#14532D]"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked)
                setErrors((x) => ({ ...x, consent: undefined }))
              }}
            />
            <span className="text-ink/85">
              <span className="flex items-center gap-1.5 font-semibold text-ink">
                <ShieldCheck className="size-4 text-brand" /> Data Privacy Act (RA 10173)
              </span>
              My number is used only to send road alerts for the barangays I follow. I can unsubscribe any time.
            </span>
          </label>
          {errors.consent && <p className="-mt-4 text-[13px] font-medium text-danger">{errors.consent}</p>}
        </div>

        <div className="pb-safe sticky bottom-0 flex flex-col gap-2 border-t border-line bg-white/95 px-5 pt-3 backdrop-blur sm:flex-row sm:justify-end sm:px-6 sm:pb-4">
          <Button variant="ghost" onClick={closeModal} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <LoaderCircle className="size-4 animate-spin" /> : <BellRing className="size-4" />}
            {saving ? 'Saving…' : 'Save alert settings'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
