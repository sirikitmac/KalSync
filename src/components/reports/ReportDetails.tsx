import { CalendarClock, Clock, Crosshair, FileBadge, Info, Lock, Map as MapIcon, MapPin, MapPinOff, Route, Send, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useReports } from '../../context/ReportsContext'
import { STATUS_META, getCategory } from '../../data/categories'
import { getOrg, orgNames } from '../../data/organizations'
import { formatDateTime, formatSchedule, severityOf } from '../../lib/reportUtils'
import { CategoryBadge, OfficialBadge, SeverityBadge, SourceBadge, StatusBadge } from '../common/Badge'
import { Button } from '../common/Button'
import { Modal } from '../common/Modal'
import { ConfirmButton } from './ConfirmButton'
import { PhotoCredit, ReportImage } from './ReportImage'

export function ReportDetails() {
  const { selectedReportId, closeReport, setFocus } = useApp()
  const { reports } = useReports()
  const navigate = useNavigate()
  const report = reports.find((r) => r.id === selectedReportId)

  if (!report) return null
  const cat = getCategory(report.category)
  const closed = report.roadStatus?.kind === 'closed'

  const viewOnMap = () => {
    if (!report.coordinates) return
    setFocus({ coordinates: report.coordinates, label: report.location, zoom: 16 })
    closeReport()
    navigate('/#map')
    window.setTimeout(() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' }), 60)
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <ConfirmButton report={report} size="lg" className="w-full justify-center sm:w-auto" />
          {report.coordinates ? (
            <Button variant="secondary" onClick={viewOnMap} className="w-full sm:w-auto">
              <MapIcon className="size-4" /> View on map
            </Button>
          ) : (
            <p className="text-center text-xs text-muted sm:text-left">No map pin — listed by location name only.</p>
          )}
          <ResolveButton resolved={report.status === 'resolved'} />
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
            {report.roadStatus && <OfficialBadge status={report.roadStatus} />}
            {(report.status === 'pending' || report.status === 'verified') && !closed && <SeverityBadge severity={severityOf(report)} />}
          </div>
          <h2 className="mt-3 text-2xl leading-tight font-extrabold">{report.title}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink/80">{report.description}</p>
        </div>

        {closed && (
          <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <FileBadge className="mt-0.5 size-5 shrink-0 text-red-600" />
            <div>
              <p className="font-bold">Officially closed</p>
              <p className="mt-0.5 text-red-900/80">
                {report.roadStatus?.issuedBy ? `Issued by ${getOrg(report.roadStatus.issuedBy).name}.` : 'Issued by the city.'}
                {report.roadStatus?.reference && (
                  <>
                    {' '}Reference: <span className="font-mono font-semibold">{report.roadStatus.reference}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {report.detour && (
          <div className="flex gap-3 rounded-2xl border border-green-200 bg-mint/50 p-4 text-sm text-forest">
            <Route className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-bold">Suggested detour</p>
              <p className="mt-0.5 text-forest/85">{report.detour.description}</p>
              {report.detour.path && <p className="mt-1 text-xs text-forest/70">Shown as a green dashed line on the map.</p>}
            </div>
          </div>
        )}

        <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line text-sm sm:grid-cols-2">
          <Meta icon={<MapPin className="size-4" />} label="Location" value={report.location} />
          <Meta icon={<MapIcon className="size-4" />} label="Barangay" value={report.barangay ? `${report.barangay}, Iligan City` : 'Iligan City'} />
          {report.schedule && <Meta icon={<CalendarClock className="size-4" />} label="Schedule" value={formatSchedule(report.schedule)} wide />}
          <Meta
            icon={<Send className="size-4" />}
            label={report.postedBy ? 'Posted by' : 'Sent to'}
            value={report.postedBy ? getOrg(report.postedBy).name : orgNames(report.reportedTo) || '—'}
          />
          <Meta
            icon={<ShieldCheck className="size-4" />}
            label="Verified by"
            value={report.verifiedBy ? getOrg(report.verifiedBy).name : report.status === 'pending' ? 'Waiting for personnel' : '—'}
          />
          <Meta icon={<Clock className="size-4" />} label="Submitted" value={formatDateTime(report.createdAt)} />
          <Meta
            icon={<Info className="size-4" />}
            label="Status updated"
            value={report.statusUpdatedAt ? formatDateTime(report.statusUpdatedAt) : '—'}
          />
          <Meta
            icon={report.coordinates ? <Crosshair className="size-4" /> : <MapPinOff className="size-4" />}
            label="Coordinates"
            value={report.coordinates ? `${report.coordinates.lat.toFixed(4)}, ${report.coordinates.lng.toFixed(4)}` : 'Not provided'}
          />
          <Meta icon={<Info className="size-4" />} label="Category" value={cat.label} />
        </dl>

        <p className="flex gap-2 rounded-xl bg-canvas p-3 text-xs leading-relaxed text-muted">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>
            {STATUS_META[report.status].hint} “Me too” confirmations help offices see which reports matter most.
            {report.source === 'demo' && ' This is sample data and does not describe a real or current incident.'}
          </span>
        </p>
      </div>
    </Modal>
  )
}

/**
 * Personnel-only action. Shown disabled in the public (riders and road users) app so
 * people know a report gets closed by the barangay or city office, not by the reporter.
 */
function ResolveButton({ resolved }: { resolved: boolean }) {
  return (
    <div className="flex flex-col gap-1 sm:ml-auto sm:items-end">
      <button
        type="button"
        disabled
        aria-disabled
        aria-describedby="resolve-note"
        title="Only authorized personnel can mark a report resolved."
        className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-line bg-slate-100 px-4 text-[15px] font-semibold text-slate-400 sm:w-auto"
      >
        <Lock className="size-4" /> {resolved ? 'Resolved' : 'Resolve'}
      </button>
      <p id="resolve-note" className="text-center text-[11px] leading-snug text-muted sm:max-w-56 sm:text-right">
        Only authorized personnel (barangay, ICTPMO, ICDRRMO) can mark a report resolved.
      </p>
    </div>
  )
}

function Meta({ icon, label, value, wide }: { icon: ReactNode; label: string; value: string; wide?: boolean }) {
  return (
    <div className={`flex gap-3 bg-white p-3.5 ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="mt-0.5 text-muted">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs font-medium text-muted">{label}</dt>
        <dd className="mt-0.5 font-medium break-words text-ink">{value}</dd>
      </div>
    </div>
  )
}
