import { AlertTriangle, Camera, Check, ImagePlus, LoaderCircle, LocateFixed, MapPinned, RefreshCw, Send, ShieldCheck, Trash2, X } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from 'react'
import { useReports } from '../../context/ReportsContext'
import { CATEGORIES, getCategory } from '../../data/categories'
import { BARANGAYS, isBarangay } from '../../data/barangays'
import { ILIGAN_CITY, ILIGAN_PROVINCE, SCOPES, nearestPlace, type Place } from '../../data/locations'
import { ORGANIZATIONS, orgNames, suggestOrgs } from '../../data/organizations'
import { useGeolocation } from '../../hooks/useGeolocation'
import { cn } from '../../lib/cn'
import { MAX_UPLOAD_BYTES } from '../../services/imageService'
import type { Coordinates, IncidentCategory, OrgId, Report } from '../../types/report'
import { Button } from '../common/Button'
import { PlaceSearch } from '../common/PlaceSearch'

const PinPickerMap = lazy(() => import('../map/PinPickerMap').then((m) => ({ default: m.PinPickerMap })))

const LIMITS = { title: 80, description: 500, descriptionMin: 15 }

interface FormState {
  title: string
  category: IncidentCategory | null
  description: string
  location: string
  barangay: string
  coordinates?: Coordinates
  reportedTo: OrgId[]
  startsAt: string
  endsAt: string
  consent: boolean
}

type Errors = Partial<Record<keyof FormState | 'image' | 'schedule', string>>

const initial = (): FormState => ({
  title: '',
  category: null,
  description: '',
  location: '',
  barangay: '',
  reportedTo: [],
  startsAt: '',
  endsAt: '',
  consent: false,
})

function validateReport(f: FormState): Errors {
  const e: Errors = {}
  if (!f.category) e.category = 'Choose the type of road issue.'
  if (!f.title.trim()) e.title = 'Add a short title so others can scan it quickly.'
  else if (f.title.length > LIMITS.title) e.title = `Keep the title under ${LIMITS.title} characters.`
  if (!f.location.trim()) e.location = 'Enter a street, barangay, or landmark.'
  if (!f.barangay) e.barangay = 'Choose the barangay so the right office gets it.'
  if (f.reportedTo.length === 0) e.reportedTo = 'Choose at least one office to send this to.'
  if (f.category === 'event') {
    if (!f.startsAt || !f.endsAt) e.schedule = 'Add when the closure or event starts and ends.'
    else if (new Date(f.endsAt) <= new Date(f.startsAt)) e.schedule = 'The end time must be after the start time.'
  }
  if (!f.consent) e.consent = 'Please agree so we can process your report.'
  if (f.description.trim().length < LIMITS.descriptionMin)
    e.description = `Describe what you saw in at least ${LIMITS.descriptionMin} characters.`
  else if (f.description.length > LIMITS.description) e.description = `Keep it under ${LIMITS.description} characters.`
  return e
}

export function ReportForm({ onSubmitted }: { onSubmitted: (r: Report) => void }) {
  const { submitReport } = useReports()
  const [form, setForm] = useState<FormState>(initial)
  /** Once the reporter edits the office list we stop auto-suggesting. */
  const [orgsTouched, setOrgsTouched] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [showPin, setShowPin] = useState(false)
  const [mapCenter, setMapCenter] = useState<Coordinates>(SCOPES.iligan.center)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const geo = useGeolocation()
  const uploadRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!image) return setPreview(null)
    const url = URL.createObjectURL(image)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [image])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const chooseCategory = (c: IncidentCategory) => {
    setForm((f) => ({ ...f, category: c, reportedTo: orgsTouched ? f.reportedTo : suggestOrgs(c) }))
    setErrors((e) => ({ ...e, category: undefined, reportedTo: undefined, schedule: undefined }))
  }

  const toggleOrg = (id: OrgId) => {
    setOrgsTouched(true)
    setForm((f) => ({ ...f, reportedTo: f.reportedTo.includes(id) ? f.reportedTo.filter((x) => x !== id) : [...f.reportedTo, id] }))
    setErrors((e) => ({ ...e, reportedTo: undefined }))
  }

  const onFile = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors((e) => ({ ...e, image: 'That file isn’t an image. Please choose a JPG, PNG, or HEIC photo.' }))
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setErrors((e) => ({ ...e, image: 'That photo is larger than 15 MB. Please choose a smaller one.' }))
      return
    }
    setErrors((e) => ({ ...e, image: undefined }))
    setImage(file)
  }

  const applyPlace = (p: Place) => {
    setForm((f) => ({
      ...f,
      location: p.kind === 'city' ? f.location : p.name,
      barangay: isBarangay(p.name) ? p.name : f.barangay,
      coordinates: p.coordinates,
    }))
    setMapCenter(p.coordinates)
    setErrors((e) => ({ ...e, location: p.kind === 'city' ? e.location : undefined, barangay: isBarangay(p.name) ? undefined : e.barangay }))
  }

  const locateMe = async () => {
    const c = await geo.locate()
    if (!c) return
    const near = nearestPlace(c)
    setForm((f) => ({
      ...f,
      coordinates: c,
      barangay: f.barangay || (near && isBarangay(near.name) ? near.name : ''),
    }))
    setMapCenter(c)
    setShowPin(true)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const v = validateReport(form)
    setErrors(v)
    if (Object.keys(v).length) {
      // Focus the first invalid field
      requestAnimationFrame(() => {
        const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
        first?.focus()
        first?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      })
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const report = await submitReport({
        title: form.title,
        category: form.category!,
        description: form.description,
        location: form.location,
        city: ILIGAN_CITY,
        province: ILIGAN_PROVINCE,
        barangay: form.barangay,
        coordinates: form.coordinates,
        reportedTo: form.reportedTo,
        schedule:
          form.category === 'event'
            ? { startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt).toISOString() }
            : undefined,
        image: image ?? undefined,
      })
      onSubmitted(report)
    } catch (err) {
      console.error(err)
      setSubmitError('We couldn’t send your report. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const errorCount = Object.values(errors).filter(Boolean).length

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col">
      <div className="space-y-6 px-5 py-5 sm:px-6">
        <div role="note" className="flex gap-3 rounded-2xl border border-amber/40 bg-amber-50 p-3.5 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 size-4.5 shrink-0 text-amber-600" />
          <p>
            <strong className="font-semibold">Safety first.</strong> Always stop in a safe location before using your phone to
            submit a report. Never use your phone while riding.
          </p>
        </div>

        {/* Photo */}
        <fieldset>
          <legend className="label">
            Photo <span className="font-normal text-muted">(recommended)</span>
          </legend>
          <input ref={uploadRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
          {preview ? (
            <div className="relative overflow-hidden rounded-2xl border border-line">
              <img src={preview} alt="Selected incident photo preview" className="aspect-[16/10] w-full object-cover" />
              <div className="absolute inset-x-2 bottom-2 flex justify-end gap-2">
                <Button size="sm" variant="secondary" onClick={() => uploadRef.current?.click()}>
                  <RefreshCw className="size-4" /> Replace
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setImage(null)} className="text-danger">
                  <Trash2 className="size-4" /> Remove
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'grid gap-2 rounded-2xl border-2 border-dashed p-3 transition sm:grid-cols-2',
                errors.image ? 'border-danger/50 bg-red-50/40' : 'border-line bg-canvas',
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                onFile(e.dataTransfer.files?.[0])
              }}
            >
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl bg-white p-4 text-sm font-semibold text-ink shadow-card transition hover:text-forest"
              >
                <Camera className="size-6 text-brand" />
                Take a photo
                <span className="text-xs font-normal text-muted">Opens camera on supported phones</span>
              </button>
              <button
                type="button"
                onClick={() => uploadRef.current?.click()}
                className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl bg-white p-4 text-sm font-semibold text-ink shadow-card transition hover:text-forest"
              >
                <ImagePlus className="size-6 text-brand" />
                Upload from device
                <span className="text-xs font-normal text-muted">or drag &amp; drop · up to 15 MB</span>
              </button>
            </div>
          )}
          <FieldError msg={errors.image} />
        </fieldset>

        {/* Category */}
        <fieldset>
          <legend className="label">
            What did you see? <Req />
          </legend>
          <div
            className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-3"
            role="radiogroup"
            aria-invalid={!!errors.category}
            tabIndex={errors.category ? -1 : undefined}
          >
            {CATEGORIES.map((c) => {
              const Icon = c.icon
              const selected = form.category === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => chooseCategory(c.id)}
                  className={cn(
                    'flex min-h-16 cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[13px] leading-tight font-semibold transition',
                    selected ? 'border-forest bg-mint/70 text-forest ring-2 ring-forest/15' : 'border-line bg-white text-ink hover:border-forest/30',
                  )}
                >
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-lg"
                    style={{ background: selected ? c.color : `${c.color}14`, color: selected ? '#fff' : c.color }}
                  >
                    <Icon className="size-4" />
                  </span>
                  {c.label}
                </button>
              )
            })}
          </div>
          <FieldError msg={errors.category} />
        </fieldset>

        {/* Title */}
        <div>
          <label htmlFor="r-title" className="label">
            Short title <Req />
          </label>
          <input
            id="r-title"
            className={cn('input', errors.title && 'border-danger')}
            maxLength={LIMITS.title}
            placeholder={form.category ? `e.g. ${getCategory(form.category).title} near the market` : 'e.g. Flooding near Pala-o market'}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            aria-invalid={!!errors.title}
            aria-describedby="r-title-err"
          />
          <FieldError id="r-title-err" msg={errors.title} />
        </div>

        {/* Location */}
        <fieldset className="space-y-3">
          <legend className="label">
            Location <Req />
          </legend>
          <PlaceSearch onSelect={applyPlace} placeholder="Search a barangay, road, or landmark" />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => void locateMe()} disabled={geo.state === 'locating'} className="min-h-11">
              {geo.state === 'locating' ? <LoaderCircle className="size-4 animate-spin" /> : <LocateFixed className="size-4 text-brand" />}
              Use my current location
            </Button>
            <Button size="sm" variant={showPin ? 'outline' : 'secondary'} onClick={() => setShowPin((s) => !s)} className="min-h-11">
              <MapPinned className="size-4 text-brand" /> {showPin ? 'Hide map' : 'Pin on map'}
            </Button>
          </div>
          {geo.message && <p className="text-xs text-muted">{geo.message}</p>}
          <p className="text-xs text-muted">Location access is optional — you can always type or pin the location yourself.</p>

          {showPin && (
            <div className="space-y-2">
              <div className="overflow-hidden rounded-xl border border-line">
                <Suspense fallback={<div className="h-56 animate-pulse bg-slate-100" />}>
                  <PinPickerMap value={form.coordinates} center={mapCenter} onChange={(c) => set('coordinates', c)} />
                </Suspense>
              </div>
              <p className="text-xs text-muted">Tap the map to drop a pin. Drag the pin to adjust.</p>
            </div>
          )}
          {form.coordinates && (
            <div className="flex items-center justify-between gap-2 rounded-xl bg-mint/50 px-3 py-2 text-xs text-forest">
              <span className="font-medium">
                Pinned at {form.coordinates.lat.toFixed(5)}, {form.coordinates.lng.toFixed(5)}
              </span>
              <button type="button" className="grid size-9 cursor-pointer place-items-center rounded-lg hover:bg-white/60" aria-label="Remove map pin" onClick={() => set('coordinates', undefined)}>
                <X className="size-4" />
              </button>
            </div>
          )}

          <div>
            <label htmlFor="r-loc" className="sr-only">Street, barangay, or landmark</label>
            <input
              id="r-loc"
              className={cn('input', errors.location && 'border-danger')}
              placeholder="Street, barangay, or landmark"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              aria-invalid={!!errors.location}
              aria-describedby="r-loc-err"
            />
            <FieldError id="r-loc-err" msg={errors.location} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="r-brgy" className="mb-1 block text-xs font-medium text-muted">
                Barangay <Req />
              </label>
              <select
                id="r-brgy"
                className={cn('input', !form.barangay && 'text-muted', errors.barangay && 'border-danger')}
                value={form.barangay}
                onChange={(e) => set('barangay', e.target.value)}
                aria-invalid={!!errors.barangay}
                aria-describedby="r-brgy-err"
              >
                <option value="">Choose barangay…</option>
                {BARANGAYS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <FieldError id="r-brgy-err" msg={errors.barangay} />
            </div>
            <div>
              <p className="mb-1 block text-xs font-medium text-muted">City</p>
              <p className="input flex items-center bg-canvas text-muted">Iligan City, Lanao del Norte</p>
            </div>
          </div>
        </fieldset>

        {/* Schedule (planned closures / events) */}
        {form.category === 'event' && (
          <fieldset>
            <legend className="label">
              When is it? <Req />
            </legend>
            <div className="grid gap-3 sm:grid-cols-2" aria-invalid={!!errors.schedule} tabIndex={errors.schedule ? -1 : undefined}>
              <div>
                <label htmlFor="r-start" className="mb-1 block text-xs font-medium text-muted">Starts</label>
                <input id="r-start" type="datetime-local" className={cn('input', errors.schedule && 'border-danger')} value={form.startsAt} onChange={(e) => { set('startsAt', e.target.value); setErrors((x) => ({ ...x, schedule: undefined })) }} />
              </div>
              <div>
                <label htmlFor="r-end" className="mb-1 block text-xs font-medium text-muted">Ends</label>
                <input id="r-end" type="datetime-local" className={cn('input', errors.schedule && 'border-danger')} value={form.endsAt} min={form.startsAt || undefined} onChange={(e) => { set('endsAt', e.target.value); setErrors((x) => ({ ...x, schedule: undefined })) }} />
              </div>
            </div>
            <FieldError msg={errors.schedule} />
          </fieldset>
        )}

        {/* Report to */}
        <fieldset>
          <legend className="label">
            Send this report to <Req />
          </legend>
          <p className="-mt-1 mb-2.5 text-xs text-muted">
            {form.category
              ? orgsTouched
                ? 'You can pick more than one office.'
                : `Suggested for ${getCategory(form.category).label.toLowerCase()}. Tap to change.`
              : 'Pick the type of issue above and we’ll suggest the right office.'}
          </p>
          <div className="grid gap-2 sm:grid-cols-2" role="group" aria-invalid={!!errors.reportedTo} tabIndex={errors.reportedTo ? -1 : undefined}>
            {ORGANIZATIONS.map((o) => {
              const on = form.reportedTo.includes(o.id)
              const Icon = o.icon
              return (
                <button
                  key={o.id}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => toggleOrg(o.id)}
                  className={cn(
                    'flex min-h-14 cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition',
                    on ? 'border-forest bg-mint/60 ring-2 ring-forest/15' : 'border-line bg-white hover:border-forest/30',
                  )}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg" style={{ background: on ? o.color : `${o.color}14`, color: on ? '#fff' : o.color }}>
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] leading-tight font-semibold text-ink">{o.short}</span>
                    <span className="line-clamp-1 text-[11px] text-muted">{o.handles}</span>
                  </span>
                  <span className={cn('grid size-5 shrink-0 place-items-center rounded-md border', on ? 'border-forest bg-forest text-white' : 'border-line')}>
                    {on && <Check className="size-3.5" />}
                  </span>
                </button>
              )
            })}
          </div>
          <FieldError msg={errors.reportedTo} />
        </fieldset>

        {/* Description */}
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="r-desc" className="label">
              Description <Req />
            </label>
            <span className={cn('text-xs tabular-nums', form.description.length > LIMITS.description - 40 ? 'text-amber-700' : 'text-muted')}>
              {form.description.length}/{LIMITS.description}
            </span>
          </div>
          <textarea
            id="r-desc"
            rows={4}
            maxLength={LIMITS.description}
            className={cn('input min-h-28 py-3 leading-relaxed', errors.description && 'border-danger')}
            placeholder="What's happening, which lane is affected, and what should other riders do?"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            aria-invalid={!!errors.description}
            aria-describedby="r-desc-err"
          />
          <FieldError id="r-desc-err" msg={errors.description} />
          <p className="mt-1.5 text-xs text-muted">Please don’t include plate numbers, faces, or other personal information.</p>
        </div>

        {/* Data privacy consent */}
        <div>
          <label
            className={cn(
              'flex cursor-pointer gap-3 rounded-2xl border p-3.5 text-sm transition',
              form.consent ? 'border-forest/30 bg-mint/40' : errors.consent ? 'border-danger/50 bg-red-50/40' : 'border-line bg-canvas',
            )}
          >
            <input
              type="checkbox"
              className="mt-0.5 size-4.5 shrink-0 accent-[#14532D]"
              checked={form.consent}
              onChange={(e) => set('consent', e.target.checked)}
              aria-invalid={!!errors.consent}
              aria-describedby="r-consent-err"
            />
            <span className="text-ink/85">
              <span className="flex items-center gap-1.5 font-semibold text-ink">
                <ShieldCheck className="size-4 text-brand" /> Data Privacy Act (RA 10173)
              </span>
              I agree that my photo, location, and description will be shared with the offices I selected and shown publicly
              on KaDaan. No name or account is needed to report.
            </span>
          </label>
          <FieldError id="r-consent-err" msg={errors.consent} />
        </div>
      </div>

      <div className="pb-safe sticky bottom-0 border-t border-line bg-white/95 px-5 pt-3 backdrop-blur sm:px-6 sm:pb-4">
        {errorCount > 0 && (
          <p className="mb-2 text-sm font-medium text-danger" role="alert">
            Please fix {errorCount} {errorCount === 1 ? 'field' : 'fields'} above.
          </p>
        )}
        {submitError && <p className="mb-2 text-sm font-medium text-danger" role="alert">{submitError}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? <LoaderCircle className="size-5 animate-spin" /> : <Send className="size-4.5" />}
          {submitting
            ? `Sending to ${orgNames(form.reportedTo) || 'offices'}…`
            : form.reportedTo.length
              ? `Send to ${orgNames(form.reportedTo)}`
              : 'Submit Report'}
        </Button>
      </div>
    </form>
  )
}

const Req = () => <span className="text-danger" aria-hidden>*</span>

function FieldError({ msg, id }: { msg?: string; id?: string }) {
  if (!msg) return <span id={id} />
  return (
    <p id={id} className="mt-1.5 text-[13px] font-medium text-danger">
      {msg}
    </p>
  )
}
