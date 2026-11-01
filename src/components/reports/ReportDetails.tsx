import { Clock, Crosshair, Hash, Info, Map as MapIcon, MapPin, MapPinOff, ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useReports } from '../../context/ReportsContext'
import { STATUSES, STATUS_META, getCategory } from '../../data/categories'
import { isInScope } from '../../data/locations'
import { cn } from '../../lib/cn'
import { formatDateTime, severityOf } from '../../lib/reportUtils'
import type { ReportStatus } from '../../types/report'
import { CategoryBadge, SeverityBadge, SourceBadge, StatusBadge } from '../common/Badge'
import { Button } from '../common/Button'
import { Modal } from '../common/Modal'
import { ConfirmButton } from './ConfirmButton'
import { PhotoCredit, ReportImage } from './ReportImage'

export function ReportDetails() {
  const { selectedReportId, closeReport, setFocus, scope, setScope, pushToast } = useApp()
  const { reports, setStatus } = useReports()
  const navigate = useNavigate()
  const report = reports.find((r) => r.id === selectedReportId)

  if (!report) return null
  const cat = getCategory(report.category)

  const viewOnMap = () => {
    if (!report.coordinates) return
    if (!isInScope(report.city, scope)) setScope('philippines')
    // setScope clears focus, so set it on the next tick
    window.setTimeout(() => setFocus({ coordinates: report.coordinates!, label: report.location, zoom: 16 }), 0)
    closeReport()
    navigate('/#map')
    window.setTimeout(() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' }), 60)
  }

  const changeStatus = async (s: ReportStatus) => {
    if (s === report.status) return
    await setStatus(report.id, s)
    pushToast({ title: `Status set to “${STATUS_META[s].label}”`, description: 'Demo moderation — saved in this browser only.', tone: 'info' })
  }

  return (
    <Modal
      open
      onClose={closeReport}
      size="lg"
      ariaLabel={report.title}
      title={
        <div className="flex flex-wrap items-center gap-2">
          <SourceBadge source={report.source} />
          <span className="font-mono text-xs text-muted">{report.id}</span>
        </div>
      }
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <ConfirmButton report={report} size="lg" className="w-full justify-center sm:w-auto" />
          {report.coordinates ? (
            <Button variant="secondary" onClick={viewOnMap} className="w-full sm:w-auto">
              <MapIcon className="size-4" /> View on map
            </Button>
          ) : (
            <p className="text-center text-xs text-muted sm:text-right">No map pin — listed by location name only.</p>
          )}
        </div>
      }
    >
      <ReportImage report={report} eager className="aspect-[16/9] w-full sm:aspect-[2/1]" />
      <div className="space-y-5 px-5 py-5 sm:px-6">
        {report.photo && <PhotoCredit report={report} />}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={report.category} />
            <StatusBadge status={report.status} />
            {(report.status === 'pending' || report.status === 'verified') && <SeverityBadge severity={severityOf(report)} />}
          </div>
          <h2 className="mt-3 text-2xl leading-tight font-extrabold">{report.title}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink/80">{report.description}</p>
        </div>

        <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line text-sm sm:grid-cols-2">
          <Meta icon={<MapPin className="size-4" />} label="Location" value={report.location} />
          <Meta icon={<MapIcon className="size-4" />} label="City / Province" value={`${report.city}, ${report.province}`} />
          <Meta
            icon={report.coordinates ? <Crosshair className="size-4" /> : <MapPinOff className="size-4" />}
            label="Coordinates"
            value={report.coordinates ? `${report.coordinates.lat.toFixed(4)}, ${report.coordinates.lng.toFixed(4)}` : 'Not provided'}
          />
          <Meta icon={<Clock className="size-4" />} label="Submitted" value={formatDateTime(report.createdAt)} />
          <Meta icon={<Hash className="size-4" />} label="Category" value={cat.label} />
          <Meta
            icon={<Info className="size-4" />}
            label="Status updated"
            value={report.statusUpdatedAt ? formatDateTime(report.statusUpdatedAt) : '—'}
          />
        </dl>

        <p className="flex gap-2 rounded-xl bg-canvas p-3 text-xs leading-relaxed text-muted">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>
            {STATUS_META[report.status].hint} Confirmations are a prototype interaction saved in this browser — not an
            authenticated community vote.
            {report.source === 'demo' && ' This is sample data and does not describe a real or current incident.'}
          </span>
        </p>

        <section className="rounded-2xl border border-dashed border-amber/60 bg-amber-50/50 p-4" aria-labelledby="demo-mod">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-700" />
            <div>
              <h3 id="demo-mod" className="font-sans text-sm font-bold text-amber-900">
                Demo moderation control
              </h3>
              <p className="mt-0.5 text-xs text-amber-900/80">
                Simulates a KalSync moderator reviewing this report. Not an official or government verification. The
                original submission details are kept.
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Report status">
            {STATUSES.map((s) => (
              <button
                key={s}
                role="radio"
                aria-checked={report.status === s}
                onClick={() => void changeStatus(s)}
                className={cn(
                  'min-h-11 cursor-pointer rounded-xl border px-2 text-xs font-semibold transition',
                  report.status === s
                    ? 'border-forest bg-forest text-white'
                    : 'border-line bg-white text-ink hover:border-forest/40',
                )}
              >
                {STATUS_META[s].label.replace(' Verification', '')}
              </button>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  )
}

function Meta({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 bg-white p-3.5">
      <span className="mt-0.5 text-muted">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs font-medium text-muted">{label}</dt>
        <dd className="mt-0.5 font-medium break-words text-ink">{value}</dd>
      </div>
    </div>
  )
}
