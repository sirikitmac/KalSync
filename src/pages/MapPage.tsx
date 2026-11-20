import type { Map as MapLibreMap } from 'maplibre-gl'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AppMap, flyIntoView } from '../components/app/AppMap'
import { BottomSheet, type Detent } from '../components/app/BottomSheet'
import { ReportGallery, ViewToggle, useReportView } from '../components/app/ReportGallery'
import { CategoryChips, FollowCard, PanelHeader, ReportRow, SectionTitle, StatTiles } from '../components/app/PanelParts'
import { NotificationCenter } from '../components/alerts/NotificationCenter'
import { ArrowLeft, Bell, Compass, House, LoaderCircle, LocateFixed, Menu, X } from '../components/common/icons'
import { LogoMark } from '../components/common/Logo'
import { PlaceSearch } from '../components/common/PlaceSearch'
import { ThemeToggle } from '../components/common/ThemeToggle'
import { ReportActions, ReportDetailsContent } from '../components/reports/ReportDetails'
import { useApp } from '../context/AppContext'
import { useReports } from '../context/ReportsContext'
import { getCategory, isActiveStatus } from '../data/categories'
import { SCOPES, distanceKm } from '../data/locations'
import { useGeolocation } from '../hooks/useGeolocation'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { cn } from '../lib/cn'
import { NEARBY_KM, alertFeed, severityOf, sortReports } from '../lib/reportUtils'
import type { IncidentCategory, Report } from '../types/report'

type QuickFilter = 'all' | 'active' | 'closed' | 'high'

const QUICK_LABEL: Record<QuickFilter, string> = {
  all: 'All reports',
  active: 'Active reports',
  closed: 'Road closures',
  high: 'High risk',
}

export function MapPage() {
  const desktop = useMediaQuery('(min-width: 1024px)')
  const { selectedReportId, openReport, closeReport, openModal, alertPrefs, setFocus, setUserLocation, pushToast } = useApp()
  const { reports, loading, confirmedIds } = useReports()
  const [categories, setCategories] = useState<IncidentCategory[]>([])
  const [quick, setQuick] = useState<QuickFilter>('all')
  const [detent, setDetent] = useState<Detent>('half')
  const [sheetH, setSheetH] = useState(0)
  const mapRef = useRef<MapLibreMap | null>(null)
  const geo = useGeolocation()
  const [view, setView] = useReportView()
  const [panelW, setPanelW] = usePanelWidth()

  useEffect(() => {
    document.title = 'Map · KaDaan'
    return () => {
      document.title = 'KaDaan · Road status for Iligan City'
    }
  }, [])

  const inCity = useMemo(() => reports.filter((r) => r.city === 'Iligan City'), [reports])
  const visible = useMemo(() => {
    let list = categories.length ? inCity.filter((r) => categories.includes(r.category)) : inCity
    if (quick === 'active') list = list.filter((r) => isActiveStatus(r.status))
    if (quick === 'closed') list = list.filter((r) => isActiveStatus(r.status) && r.roadStatus?.kind === 'closed')
    if (quick === 'high') list = list.filter((r) => isActiveStatus(r.status) && severityOf(r) === 'high')
    return sortReports(list, 'newest', confirmedIds)
  }, [inCity, categories, quick, confirmedIds])

  const activeCount = inCity.filter((r) => isActiveStatus(r.status)).length
  const followedAlerts = useMemo(
    () => (alertPrefs.barangays.length ? alertFeed(inCity, 'iligan', alertPrefs.barangays).filter((r) => r.source !== 'user') : []),
    [inCity, alertPrefs.barangays],
  )
  const selected = selectedReportId ? (reports.find((r) => r.id === selectedReportId) ?? null) : null

  const insets = useMemo(() => (desktop ? { bottom: 0, left: panelW + 32 } : { bottom: sheetH, left: 0 }), [desktop, sheetH, panelW])

  const select = useCallback(
    (id: string | null) => {
      if (id) {
        openReport(id)
        if (!desktop) setDetent((d) => (d === 'peek' ? 'half' : d))
      } else closeReport()
    },
    [openReport, closeReport, desktop],
  )

  const locate = async () => {
    const c = await geo.locate()
    if (!c) {
      pushToast({ tone: 'info', title: 'Location not available', description: geo.message ?? 'You can still search the map.' })
      return
    }
    setUserLocation(c)
    if (mapRef.current) flyIntoView(mapRef.current, c, 14, insets)
    const near = inCity.filter((r) => r.coordinates && isActiveStatus(r.status) && distanceKm(c, r.coordinates) <= NEARBY_KM)
    pushToast({
      tone: near.length ? 'alert' : 'info',
      title: near.length ? `${near.length} active report${near.length > 1 ? 's' : ''} within ${NEARBY_KM} km` : `Nothing reported within ${NEARBY_KM} km`,
      description: 'Your location stays on this device.',
    })
  }

  const recenter = () => {
    const c = SCOPES.iligan.center
    mapRef.current?.flyTo({ center: [c.lng, c.lat], zoom: SCOPES.iligan.zoom, bearing: 0, pitch: 0, padding: { top: 0, bottom: insets.bottom, left: insets.left, right: 0 }, duration: 800 })
  }

  const pickQuick = (k: QuickFilter) => {
    setQuick((q) => (q === k ? 'all' : k))
    if (!desktop) setDetent('full')
  }

  const header = selected ? (
    <DetailHeader report={selected} onBack={() => select(null)} />
  ) : (
    <PanelHeader activeCount={activeCount} onReport={() => openModal('report')} />
  )

  const body = selected ? (
    <div className="pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <ReportDetailsContent report={selected} />
      <div className="px-5 sm:px-6">
        <ReportActions report={selected} />
      </div>
    </div>
  ) : (
    <div className="pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <StatTiles reports={inCity} onPick={pickQuick} />
      <div className="mt-4">
        <FollowCard followed={alertPrefs.barangays} alertCount={followedAlerts.length} />
      </div>
      {followedAlerts.length > 0 && (
        <>
          <SectionTitle>For your barangays</SectionTitle>
          <ul className="squircle mx-4 overflow-hidden rounded-[18px] bg-fill/60">
            {followedAlerts.slice(0, 3).map((r, i, a) => (
              <ReportRow key={r.id} report={r} onOpen={() => select(r.id)} last={i === a.length - 1} />
            ))}
          </ul>
        </>
      )}
      <SectionTitle
        action={
          <div className="flex items-center gap-3">
            {quick !== 'all' && (
              <button onClick={() => setQuick('all')} className="cursor-pointer text-[15px] font-medium text-forest dark:text-brand">
                Show all
              </button>
            )}
            <ViewToggle value={view} onChange={setView} />
          </div>
        }
      >
        {QUICK_LABEL[quick]}
      </SectionTitle>
      <CategoryChips value={categories} onChange={setCategories} />
      <div className="@container mt-3 px-4">
        {loading && <p className="py-6 text-center text-sm text-muted">Loading reports…</p>}
        {!loading && visible.length === 0 && <p className="rounded-[18px] bg-fill/60 py-6 text-center text-sm text-muted">No reports match these filters.</p>}
        {!loading && visible.length > 0 && <ReportGallery reports={visible} view={view} onOpen={(id) => select(id)} />}
      </div>
      <p className="mt-4 px-6 text-center text-[12px] leading-relaxed text-muted">
        Reports marked Sample are demonstration data, not real incidents. Map © OpenStreetMap contributors.
      </p>
    </div>
  )

  return (
    <div className="fixed inset-0 overflow-hidden bg-fill">
      <AppMap reports={visible} selectedId={selectedReportId} onSelect={select} insets={insets} onReady={(m) => (mapRef.current = m)} />

      {/* Top bar (mobile) */}
      {!desktop && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[650] flex items-center gap-2 px-3 pt-[max(12px,env(safe-area-inset-top))]">
          <div className="glass pointer-events-auto flex h-12 min-w-0 flex-1 items-center rounded-full pl-1 shadow-float">
            <AppMenu />
            <PlaceSearch
              onSelect={(p) => setFocus({ coordinates: p.coordinates, label: p.name, zoom: p.kind === 'city' ? 13 : 15 })}
              placeholder="Search a road or barangay"
              className="min-w-0 flex-1"
              inputClassName="h-12 min-h-0 border-0 bg-transparent pl-9 shadow-none focus:ring-0"
            />
          </div>
          <div className="glass pointer-events-auto rounded-full shadow-float">
            <NotificationCenter />
          </div>
        </div>
      )}

      {/* Map controls */}
      <div
        className={cn(
          'pointer-events-none absolute right-3 z-[640] flex flex-col gap-2 transition-[bottom] duration-500 ease-[var(--ease-ios)]',
          desktop ? 'top-4 right-4' : '',
        )}
        style={desktop ? undefined : { bottom: Math.min(sheetH, window.innerHeight * 0.52) + 12 }}
      >
        <MapButton label="Show my location" onClick={() => void locate()}>
          {geo.state === 'locating' ? <LoaderCircle className="size-5 animate-spin" /> : <LocateFixed className="size-5" weight={geo.state === 'granted' ? 'fill' : 'regular'} />}
        </MapButton>
        <MapButton label="Back to all of Iligan" onClick={recenter}>
          <Compass className="size-5" />
        </MapButton>
      </div>

      {desktop ? (
        <aside
          className="glass @container absolute top-4 bottom-4 left-4 z-[700] flex flex-col rounded-[28px] shadow-float squircle"
          style={{ width: panelW }}
        >
          <ResizeHandle width={panelW} onChange={setPanelW} />
          <div className="flex items-center gap-2 px-3 pt-3 pb-2">
            <Link to="/" aria-label="KaDaan home" className="grid size-10 shrink-0 place-items-center rounded-full">
              <LogoMark className="size-8 rounded-[9px]" />
            </Link>
            <PlaceSearch
              onSelect={(p) => setFocus({ coordinates: p.coordinates, label: p.name, zoom: p.kind === 'city' ? 13 : 15 })}
              placeholder="Search a road or barangay"
              className="min-w-0 flex-1"
              inputClassName="h-10 min-h-0 rounded-full border-0 bg-fill pl-9 shadow-none focus:ring-2"
            />
            <NotificationCenter />
            <AppMenu />
          </div>
          <div className="shrink-0 pt-2">{header}</div>
          <div key={selected?.id ?? 'list'} className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-b-[28px]">{body}</div>
        </aside>
      ) : (
        <BottomSheet detent={detent} onDetentChange={setDetent} header={header} onVisibleHeight={setSheetH} resetKey={selected?.id ?? 'list'}>
          {body}
        </BottomSheet>
      )}
    </div>
  )
}

const PANEL_KEY = 'kadaan:panel-width'
const PANEL_MIN = 360
const panelMax = () => Math.max(PANEL_MIN, Math.min(820, window.innerWidth - 240))

function usePanelWidth() {
  const [w, setW] = useState(() => {
    const saved = Number(localStorage.getItem(PANEL_KEY))
    return Number.isFinite(saved) && saved >= PANEL_MIN ? Math.min(saved, panelMax()) : 440
  })
  const set = useCallback((next: number) => {
    const clamped = Math.round(Math.min(panelMax(), Math.max(PANEL_MIN, next)))
    setW(clamped)
    try {
      localStorage.setItem(PANEL_KEY, String(clamped))
    } catch {
      /* ignore */
    }
  }, [])
  return [w, set] as const
}

/** Drag the right edge of the side panel to resize it. Arrow keys work too. */
function ResizeHandle({ width, onChange }: { width: number; onChange: (w: number) => void }) {
  const start = useRef<{ x: number; w: number } | null>(null)
  const [active, setActive] = useState(false)
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panel"
      aria-valuenow={width}
      aria-valuemin={PANEL_MIN}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') onChange(width - 24)
        if (e.key === 'ArrowRight') onChange(width + 24)
      }}
      onPointerDown={(e) => {
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        start.current = { x: e.clientX, w: width }
        setActive(true)
      }}
      onPointerMove={(e) => start.current && onChange(start.current.w + e.clientX - start.current.x)}
      onPointerUp={() => {
        start.current = null
        setActive(false)
      }}
      onDoubleClick={() => onChange(440)}
      className="group absolute top-0 -right-3 bottom-0 z-10 flex w-6 cursor-col-resize touch-none items-center justify-center outline-none"
    >
      <span
        className={cn(
          'h-12 w-1.5 rounded-full bg-ink/20 opacity-0 transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100',
          active && 'h-20 bg-ink/40 opacity-100',
        )}
      />
    </div>
  )
}

function DetailHeader({ report, onBack }: { report: Report; onBack: () => void }) {
  const cat = getCategory(report.category)
  return (
    <div className="flex items-center gap-2 px-3 pb-3">
      <button onClick={onBack} className="inline-flex h-10 cursor-pointer items-center gap-1 rounded-full pr-3 pl-2 text-[15px] font-medium text-forest active:bg-fill dark:text-brand">
        <ArrowLeft className="size-4" weight="bold" /> Reports
      </button>
      <p className="min-w-0 flex-1 truncate text-center text-[13px] font-semibold" style={{ color: cat.color }}>
        {cat.label}
      </p>
      <button onClick={onBack} aria-label="Close report" className="grid size-10 cursor-pointer place-items-center rounded-full bg-fill text-muted">
        <X className="size-4" weight="bold" />
      </button>
    </div>
  )
}

function MapButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="glass squircle pointer-events-auto grid size-12 cursor-pointer place-items-center rounded-[16px] text-ink shadow-float transition active:scale-95"
    >
      {children}
    </button>
  )
}

/** Small menu: home, alerts, appearance. */
function AppMenu() {
  const [open, setOpen] = useState(false)
  const { openModal } = useApp()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Menu"
        className="grid size-10 cursor-pointer place-items-center rounded-full text-ink transition hover:bg-ink/5"
      >
        <Menu className="size-5" />
      </button>
      {open && (
        <div className="absolute top-12 left-0 z-[800] w-64 origin-top-left animate-pop rounded-[20px] bg-elevated p-2 shadow-lift squircle lg:right-0 lg:left-auto lg:origin-top-right">
          <Link to="/" className="flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium hover:bg-fill">
            <House className="size-5 text-muted" /> Home
          </Link>
          <button
            onClick={() => {
              setOpen(false)
              openModal('alerts')
            }}
            className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-[15px] font-medium hover:bg-fill"
          >
            <Bell className="size-5 text-muted" /> Barangay alerts
          </button>
          <div className="my-1.5 h-px bg-line" />
          <div className="flex items-center justify-between gap-3 px-3 py-1.5">
            <span className="text-[15px] font-medium">Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  )
}

