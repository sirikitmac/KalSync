import { CalendarClock, Clock, Crosshair, FileBadge, Info, Lock, Map as MapIcon, MapPin, MapPinOff, Route, Send, ShieldCheck } from '../common/icons'
import type { ReactNode } from 'react'
import type { Report } from '../../types/report'
import { useAuth } from '../../context/AuthContext'
import { StaffActions } from '../staff/StaffActions'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useReports } from '../../context/ReportsContext'
import { getCategory } from '../../data/categories'
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
  const { pathname } = useLocation()
  const { isStaff } = useAuth()
  const report = reports.find((r) => r.id === selectedReportId)

  // On the map app the details open inside the bottom sheet instead.
  if (!report || pathname.startsWith('/map')) return null

  const viewOnMap = () => {
    if (!report.coordinates) return
    setFocus({ coordinates: report.coordinates, label: report.location, zoom: 16 })
    navigate('/map')
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
      footer={<ReportActions report={report} onViewOnMap={report.coordinates ? viewOnMap : undefined} />}
    >
      <ReportDetailsContent report={report} />
      {isStaff && (
        <div className="px-5 pb-5 sm:px-6">
          <StaffActions report={report} />
        </div>
      )}
    </Modal>
  )
}

export function ReportActions({ report, onViewOnMap }: { report: Report; onViewOnMap?: () => void }) {
  const { isStaff } = useAuth()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ConfirmButton report={report} size="lg" className="w-full justify-center sm:w-auto" />
      {onViewOnMap && (
        <Button variant="secondary" size="lg" onClick={onViewOnMap} className="h-12 flex-1 text-[15px] sm:flex-none">
          <MapIcon className="size-4" /> View on map
        </Button>
      )}
      {!isStaff && <ResolveButton resolved={report.status === 'resolved'} />}
    </div>
  )
}

export function ReportDetailsContent({ report }: { report: Report }) {
  const cat = getCategory(report.category)
  const closed = report.roadStatus?.kind === 'closed'
  return (
    <>
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
          {report.description && <p className="mt-2 text-[15px] leading-relaxed text-ink/80">{report.description}</p>}
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
            value={report.postedBy ? getOrg(report.postedBy).name : orgNames(report.reportedTo) || 'Not set'}
          />
          <Meta
            icon={<ShieldCheck className="size-4" />}
            label="Verified by"
            value={report.verifiedBy ? getOrg(report.verifiedBy).name : report.status === 'pending' ? 'Waiting for personnel' : 'Not yet'}
          />
          <Meta icon={<Clock className="size-4" />} label="Submitted" value={formatDateTime(report.createdAt)} />
          <Meta
            icon={<Info className="size-4" />}
            label="Status updated"
            value={report.statusUpdatedAt ? formatDateTime(report.statusUpdatedAt) : 'No changes yet'}
          />
          <Meta
            icon={report.coordinates ? <Crosshair className="size-4" /> : <MapPinOff className="size-4" />}
            label="Coordinates"
            value={report.coordinates ? `${report.coordinates.lat.toFixed(4)}, ${report.coordinates.lng.toFixed(4)}` : 'Not provided'}
          />
          <Meta icon={<Info className="size-4" />} label="Category" value={cat.label} />
        </dl>

        {report.source === 'demo' && <p className="text-xs text-muted">Sample data, not a real incident.</p>}
      </div>
    </>
  )
}

/**
 * Personnel-only action. Shown disabled in the public (riders and road users) app so
 * people know a report gets closed by the barangay or city office, not by the reporter.
 */
function ResolveButton({ resolved }: { resolved: boolean }) {
  return (
    <button
      type="button"
      disabled
      title="Only authorized personnel can mark a report resolved."
      className="inline-flex h-12 flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-full bg-fill px-4 text-[15px] font-semibold text-muted/70 sm:ml-auto sm:flex-none"
    >
      <Lock className="size-4" /> {resolved ? 'Resolved' : 'Resolve'}
    </button>
  )
}

function Meta({ icon, label, value, wide }: { icon: ReactNode; label: string; value: string; wide?: boolean }) {
  return (
    <div className={`flex gap-3 bg-surface p-3.5 ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="mt-0.5 text-muted">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs font-medium text-muted">{label}</dt>
        <dd className="mt-0.5 font-medium break-words text-ink">{value}</dd>
      </div>
    </div>
  )
}
