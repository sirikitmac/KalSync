import { CalendarClock, Clock, MapPin, MapPinOff, Navigation, Send } from 'lucide-react'
import { getOrg, orgNames } from '../../data/organizations'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/cn'
import { NEARBY_KM, distanceTo, formatDateTime, formatKm, formatSchedule, severityOf } from '../../lib/reportUtils'
import type { Report } from '../../types/report'
import { CategoryBadge, OfficialBadge, ScheduleBadge, SeverityBadge, SourceBadge, StatusBadge } from '../common/Badge'
import { ConfirmButton } from './ConfirmButton'
import { ReportImage } from './ReportImage'

export function ReportCard({ report, index = 0 }: { report: Report; index?: number }) {
  const { openReport, userLocation } = useApp()
  const dist = distanceTo(report, userLocation ?? undefined)
  const nearby = dist !== undefined && dist <= NEARBY_KM
  const severity = severityOf(report)
  const inactive = report.status === 'resolved' || report.status === 'rejected'

  return (
    <article
      className={cn(
        'group card flex animate-fade-up cursor-pointer flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lift',
        nearby && 'ring-2 ring-amber/70',
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
      onClick={() => openReport(report.id)}
    >
      <div className="relative">
        <ReportImage report={report} className={cn('aspect-[16/9] transition', inactive && 'opacity-70 grayscale-[35%]')} />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <CategoryBadge category={report.category} solid />
          <SourceBadge source={report.source} compact />
        </div>
        {nearby && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-amber px-2.5 py-1 text-xs font-bold text-ink shadow">
            <Navigation className="size-3" /> Nearby · {formatKm(dist!)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={report.status} />
          {report.roadStatus?.kind === 'closed' && !inactive && <OfficialBadge status={report.roadStatus} />}
          {report.schedule && !inactive && <ScheduleBadge schedule={report.schedule} />}
          {severity === 'high' && !inactive && report.roadStatus?.kind !== 'closed' && <SeverityBadge severity="high" />}
        </div>
        <div>
          <h3 className="text-[1.05rem] leading-snug font-bold text-ink">
            <button
              type="button"
              className="cursor-pointer text-left focus-visible:underline"
              onClick={(e) => {
                e.stopPropagation()
                openReport(report.id)
              }}
            >
              {report.title}
            </button>
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{report.description}</p>
        </div>
        <dl className="mt-auto space-y-1.5 text-[13px] text-muted">
          <div className="flex items-start gap-2">
            <dt className="sr-only">Location</dt>
            {report.coordinates ? (
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-brand" />
            ) : (
              <MapPinOff className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
            )}
            <dd className="min-w-0">
              <span className="font-medium text-ink">{report.location}</span>
              {report.barangay && <span> · Brgy. {report.barangay}</span>}
            </dd>
          </div>
          {report.schedule && (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Schedule</dt>
              <CalendarClock className="size-3.5 shrink-0 text-cyan-700" />
              <dd className="font-medium text-ink">{formatSchedule(report.schedule)}</dd>
            </div>
          )}
          {(report.postedBy || report.reportedTo?.length) && (
            <div className="flex items-center gap-2">
              <dt className="sr-only">{report.postedBy ? 'Posted by' : 'Sent to'}</dt>
              <Send className="size-3.5 shrink-0" />
              <dd className="truncate">{report.postedBy ? `Posted by ${getOrg(report.postedBy).short}` : `Sent to ${orgNames(report.reportedTo)}`}</dd>
            </div>
          )}
          <div className="flex items-center gap-2">
            <dt className="sr-only">Submitted</dt>
            <Clock className="size-3.5 shrink-0" />
            <dd>
              <time dateTime={report.createdAt}>{formatDateTime(report.createdAt)}</time>
            </dd>
          </div>
        </dl>
        <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
          <span className="font-mono text-[11px] text-muted/80">{report.id}</span>
          <ConfirmButton report={report} />
        </div>
      </div>
    </article>
  )
}
