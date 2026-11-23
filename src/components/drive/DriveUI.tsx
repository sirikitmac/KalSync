import { SEVERITY_COLOR, getCategory } from '../../data/categories'
import type { Drive, Hazard } from '../../hooks/useDrive'
import { cn } from '../../lib/cn'
import { severityColor, severityOf } from '../../lib/reportUtils'
import { formatDistance, formatDuration } from '../../lib/route'
import { Button } from '../common/Button'
import { ArrowLeft, Car, CheckCircle2, Cube, LoaderCircle, LocateFixed, MapPin, MapTrifold, Play, X } from '../common/icons'
import { PlaceSearch } from '../common/PlaceSearch'

/** Sheet header while planning a trip. */
export function DriveHeader({ drive }: { drive: Drive }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pb-4">
      <div className="flex min-w-0 items-center gap-2">
        {drive.phase === 'preview' && (
          <button onClick={drive.back} aria-label="Change destination" className="-ml-2 grid size-9 cursor-pointer place-items-center rounded-full hover:bg-fill">
            <ArrowLeft className="size-5" weight="bold" />
          </button>
        )}
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-muted">Drive mode</p>
          <h1 className="truncate text-[26px] leading-tight font-bold">{drive.phase === 'preview' && drive.dest ? drive.dest.label : 'Where to?'}</h1>
        </div>
      </div>
      <button onClick={() => drive.end()} aria-label="Close drive mode" className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-fill">
        <X className="size-5" weight="bold" />
      </button>
    </div>
  )
}

/** Sheet body while planning: choose a destination, then preview the route and the reports along it. */
export function DrivePanel({ drive }: { drive: Drive }) {
  if (drive.phase === 'pick') {
    return (
      <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <PlaceSearch
          onSelect={(p) => void drive.choose({ coordinates: p.coordinates, label: p.name })}
          placeholder="Search a barangay, road, or landmark"
          inputClassName="h-12 rounded-2xl"
        />
        <p className="mt-3 flex items-center gap-2 px-1 text-[15px] text-muted">
          <MapPin className="size-4 shrink-0" weight="fill" /> Or tap the map to drop your destination.
        </p>
        {drive.loading && (
          <p className="mt-4 flex items-center gap-2 px-1 text-[15px]">
            <LoaderCircle className="size-4 animate-spin" /> Finding a route…
          </p>
        )}
        <div className="mt-5 rounded-[18px] bg-fill/60 p-4 text-[14px] leading-relaxed text-muted">
          While you drive, KaDaan follows you and shows only the reports on your route, nearest first.
          {!drive.hasFix && ' Allow location access so the trip starts from where you are.'}
        </div>
      </div>
    )
  }

  if (drive.phase === 'preview' && drive.route) {
    const r = drive.route
    const closures = drive.hazards.filter((h) => h.report.roadStatus?.kind === 'closed').length
    const high = drive.hazards.filter((h) => severityOf(h.report) === 'high').length
    return (
      <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <div className="flex items-end gap-3 px-1">
          <p className="num text-[30px] leading-none font-bold">{formatDuration(r.duration)}</p>
          <p className="num pb-0.5 text-[17px] text-muted">{formatDistance(r.distance)}</p>
        </div>
        <p className="mt-1.5 px-1 text-[14px] text-muted">
          {drive.originGuessed ? 'From the map center (location is off)' : 'From your location'}
          {r.approximate && ' · straight-line guide'}
        </p>

        {closures > 0 && (
          <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-[14px] font-medium text-red-800 dark:bg-red-950/50 dark:text-red-200">
            This route passes {closures} official closure{closures > 1 ? 's' : ''}. Check the detour before you go.
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <Button variant="ink" size="lg" className="flex-[2]" onClick={drive.go}>
            <Car className="size-5" weight="fill" /> Start
          </Button>
          <Button variant="secondary" size="lg" className="flex-1" onClick={drive.simulate} title="Moves along the route on its own, for demos">
            <Play className="size-4" weight="fill" /> Demo
          </Button>
        </div>

        <h2 className="mt-6 px-1 text-[17px] font-bold">
          {drive.hazards.length ? `${drive.hazards.length} report${drive.hazards.length > 1 ? 's' : ''} on this route` : 'No reports on this route'}
        </h2>
        {drive.hazards.length > 0 ? (
          <>
            <p className="px-1 text-[14px] text-muted">{high ? `${high} high severity. ` : ''}Other reports are hidden while you drive.</p>
            <ul className="squircle mt-3 overflow-hidden rounded-[18px] bg-fill/60">
              {drive.hazards.map((h, i) => (
                <HazardRow key={h.report.id} hazard={h} distance={h.along} last={i === drive.hazards.length - 1} />
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-2 flex items-center gap-2 px-1 text-[15px] text-muted">
            <CheckCircle2 className="size-5 text-forest dark:text-brand" weight="fill" /> The road looks clear.
          </p>
        )}
      </div>
    )
  }
  return null
}

function HazardRow({ hazard, distance, last }: { hazard: Hazard; distance: number; last?: boolean }) {
  const r = hazard.report
  const cat = getCategory(r.category)
  const Icon = cat.icon
  const col = severityColor(r)
  return (
    <li className="flex items-center gap-3 pl-4">
      <span className="squircle grid size-10 shrink-0 place-items-center rounded-[12px]" style={{ background: col.bg, color: col.fg }}>
        <Icon className="size-5" weight="fill" />
      </span>
      <span className={cn('flex min-w-0 flex-1 items-center gap-2 py-3 pr-4', !last && 'border-b border-line')}>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold">{r.title}</span>
          <span className="block truncate text-[13px] text-muted">
            {SEVERITY_COLOR[severityOf(r)].label} · {r.roadStatus?.kind === 'closed' ? 'Officially closed' : cat.label}
          </span>
        </span>
        <span className="num shrink-0 text-[14px] font-semibold text-muted">{formatDistance(distance)}</span>
      </span>
    </li>
  )
}

/** On-screen overlays while driving: the next report ahead and the trip bar. */
export function DriveHud({ drive, desktop }: { drive: Drive; desktop: boolean }) {
  const next = drive.ahead[0]
  const dist = next ? Math.max(0, next.along - drive.along) : 0
  const col = next ? severityColor(next.report) : null
  const cat = next ? getCategory(next.report.category) : null
  const Icon = cat?.icon
  const arrive = new Date(Date.now() + drive.remainingTime * 1000)

  return (
    <>
      <div
        className={cn(
          'pointer-events-none absolute z-[660] animate-fade-up',
          desktop ? 'top-4 left-4 w-[380px]' : 'inset-x-3 top-[max(12px,env(safe-area-inset-top))]',
        )}
      >
        {next && col && Icon ? (
          <div className="squircle pointer-events-auto flex items-center gap-3 rounded-[22px] p-3 pr-4 shadow-float" style={{ background: col.bg, color: col.fg }}>
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-black/15">
              <Icon className="size-7" weight="fill" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="num text-[24px] leading-tight font-bold">{dist < 30 ? 'Now' : `In ${formatDistance(dist)}`}</p>
              <p className="truncate text-[15px] font-semibold opacity-90">
                {next.report.roadStatus?.kind === 'closed' ? 'Official closure · ' : ''}
                {next.report.title}
              </p>
            </div>
            {drive.ahead.length > 1 && <span className="num shrink-0 rounded-full bg-black/15 px-2.5 py-1 text-[13px] font-semibold">+{drive.ahead.length - 1}</span>}
          </div>
        ) : (
          <div className="squircle pointer-events-auto flex items-center gap-3 rounded-[22px] bg-forest p-3 pr-4 text-white shadow-float">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/15">
              <CheckCircle2 className="size-7" weight="fill" />
            </span>
            <div>
              <p className="text-[20px] leading-tight font-bold">Road clear ahead</p>
              <p className="text-[15px] opacity-90">No reports on the rest of your route</p>
            </div>
          </div>
        )}
        {!drive.hasFix && !drive.demo && (
          <p className="glass pointer-events-auto mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium shadow-card">
            <LoaderCircle className="size-3.5 animate-spin" /> Waiting for your location…
          </p>
        )}
      </div>

      <div
        className={cn(
          'pointer-events-none absolute z-[660]',
          desktop ? 'bottom-4 left-4 w-[380px]' : 'inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))]',
        )}
      >
        {!drive.following && (
          <div className="mb-2 flex justify-center">
            <button onClick={drive.recenter} className="glass pointer-events-auto inline-flex h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-[15px] font-semibold shadow-float">
              <LocateFixed className="size-4" weight="bold" /> Recenter
            </button>
          </div>
        )}
        <div className="glass squircle pointer-events-auto flex items-center gap-3 rounded-[24px] p-3 pl-5 shadow-float">
          <div className="min-w-0 flex-1">
            <p className="num text-[24px] leading-tight font-bold">{arrive.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
            <p className="num truncate text-[14px] text-muted">
              {formatDuration(drive.remainingTime)} · {formatDistance(drive.remaining)}
              {drive.demo && ' · Demo'}
            </p>
          </div>
          <button
            onClick={drive.toggleView}
            aria-label={drive.view === '3d' ? 'Switch to flat 2D map' : 'Switch to 3D driving view'}
            className="grid h-12 w-14 shrink-0 cursor-pointer place-items-center rounded-2xl bg-fill text-[13px] font-bold"
          >
            {drive.view === '3d' ? <MapTrifold className="size-5" weight="bold" /> : <Cube className="size-5" weight="bold" />}
            <span className="-mt-1">{drive.view === '3d' ? '2D' : '3D'}</span>
          </button>
          <button onClick={() => drive.end()} className="h-12 shrink-0 cursor-pointer rounded-2xl bg-[#DC2626] px-5 text-[16px] font-bold text-white">
            End
          </button>
        </div>
      </div>
    </>
  )
}
