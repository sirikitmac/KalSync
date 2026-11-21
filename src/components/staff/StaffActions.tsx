import { useEffect, useState } from 'react'
import { ROLE_LABEL, useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { useReports } from '../../context/ReportsContext'
import { STATUS_META } from '../../data/categories'
import { cn } from '../../lib/cn'
import { formatDateTime } from '../../lib/reportUtils'
import { getHistory, updateReport, type HistoryEntry, type StaffPatch } from '../../services/staffService'
import type { Report } from '../../types/report'
import { Button } from '../common/Button'
import { BadgeCheck, CheckCircle2, FileBadge, LoaderCircle, Megaphone, RotateCcw, ShieldCheck, X } from '../common/icons'
import { SendAlertModal } from './SendAlertModal'

/** Verify, reject, close, lift, resolve and reopen. Shown only to signed-in admins and personnel. */
export function StaffActions({ report }: { report: Report }) {
  const { profile, demo } = useAuth()
  const { reload } = useReports()
  const { pushToast } = useApp()
  const [busy, setBusy] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const [reference, setReference] = useState('')
  const [detour, setDetour] = useState(report.detour?.description ?? '')
  const [alertOpen, setAlertOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sample = report.source === 'demo'
  const office = profile?.office_id ?? 'ictpmo'
  const closed = report.roadStatus?.kind === 'closed'

  const run = async (key: string, patch: StaffPatch, done: string) => {
    setError(null)
    setBusy(key)
    try {
      await updateReport(report.id, patch)
      await reload()
      pushToast({ tone: 'success', title: done })
      setClosing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The change could not be saved.')
    } finally {
      setBusy(null)
    }
  }

  const spin = (k: string, icon: React.ReactNode) => (busy === k ? <LoaderCircle className="size-4 animate-spin" /> : icon)

  return (
    <section className="mt-5 rounded-[20px] bg-fill p-4" aria-label="Staff actions">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-muted">
          <ShieldCheck className="size-4" weight="fill" /> Staff actions
        </p>
        <span className="text-[12px] text-muted">
          {profile && profile.role !== 'pending' ? `${profile.full_name} · ${ROLE_LABEL[profile.role]}` : demo ? 'Demo mode' : ''}
        </span>
      </div>

      {sample ? (
        <p className="mt-3 text-[14px] text-muted">Sample reports are demonstration data and can’t be changed. Submit a real report to try these actions.</p>
      ) : (
        <>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {report.status === 'pending' && (
              <>
                <Button variant="primary" onClick={() => run('verify', { status: 'verified', verified_by: office }, 'Report verified')} disabled={!!busy}>
                  {spin('verify', <BadgeCheck className="size-4" weight="fill" />)} Verify
                </Button>
                <Button variant="secondary" onClick={() => run('reject', { status: 'rejected' }, 'Report rejected')} disabled={!!busy}>
                  {spin('reject', <X className="size-4" weight="bold" />)} Reject
                </Button>
              </>
            )}
            {(report.status === 'pending' || report.status === 'verified') && !closed && (
              <Button variant="secondary" onClick={() => setClosing((c) => !c)} disabled={!!busy}>
                <FileBadge className="size-4" weight="fill" /> Post official closure
              </Button>
            )}
            {closed && report.status !== 'resolved' && (
              <Button variant="secondary" onClick={() => run('lift', { road_status: 'advisory' }, 'Closure lifted, now an advisory')} disabled={!!busy}>
                {spin('lift', <RotateCcw className="size-4" />)} Lift closure
              </Button>
            )}
            {(report.status === 'pending' || report.status === 'verified') && (
              <Button variant="ink" onClick={() => run('resolve', { status: 'resolved', road_status: 'advisory' }, 'Resolved and removed from the map')} disabled={!!busy}>
                {spin('resolve', <CheckCircle2 className="size-4" weight="fill" />)} Resolve
              </Button>
            )}
            {(report.status === 'resolved' || report.status === 'rejected') && (
              <Button variant="secondary" onClick={() => run('reopen', { status: 'verified', verified_by: office }, 'Report reopened')} disabled={!!busy}>
                {spin('reopen', <RotateCcw className="size-4" />)} Reopen
              </Button>
            )}
            {report.status !== 'resolved' && report.status !== 'rejected' && (
              <Button variant="secondary" onClick={() => setAlertOpen(true)} disabled={!!busy}>
                <Megaphone className="size-4" weight="fill" /> Alert followers
              </Button>
            )}
          </div>

          {closing && (
            <form
              className="mt-3 space-y-3 rounded-[16px] bg-surface p-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (!reference.trim()) return setError('Enter the SP resolution, ordinance or permit number.')
                void run(
                  'close',
                  {
                    status: 'verified',
                    verified_by: report.verifiedBy ?? office,
                    road_status: 'closed',
                    closure_reference: reference.trim(),
                    issued_by: office,
                    detour_description: detour.trim() || null,
                  },
                  'Official closure posted',
                )
              }}
            >
              <label className="block">
                <span className="label">Reference number</span>
                <input className="input" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="SP Res. No. 2026-118" />
              </label>
              <label className="block">
                <span className="label">Detour (optional)</span>
                <input className="input" value={detour} onChange={(e) => setDetour(e.target.value)} placeholder="Use Aguinaldo St." />
              </label>
              <Button type="submit" variant="ink" className="w-full" disabled={!!busy}>
                {spin('close', <FileBadge className="size-4" weight="fill" />)} Post closure
              </Button>
            </form>
          )}
          {error && <p className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-[14px] text-red-700">{error}</p>}
          <StatusTimeline reportId={report.id} version={`${report.status}-${report.roadStatus?.kind}-${report.statusUpdatedAt}`} />
        </>
      )}
      {alertOpen && <SendAlertModal open onClose={() => setAlertOpen(false)} report={report} />}
    </section>
  )
}

function StatusTimeline({ reportId, version }: { reportId: string; version: string }) {
  const [items, setItems] = useState<HistoryEntry[] | null>(null)
  useEffect(() => {
    let live = true
    getHistory(reportId)
      .then((h) => live && setItems(h))
      .catch(() => live && setItems([]))
    return () => {
      live = false
    }
  }, [reportId, version])
  if (!items?.length) return null
  return (
    <div className="mt-4">
      <p className="text-[13px] font-semibold text-muted">History</p>
      <ol className="mt-2 space-y-0">
        {items.map((h, i) => (
          <li key={h.id} className="relative flex gap-3 pb-3 last:pb-0">
            {i < items.length - 1 && <span className="absolute top-3 left-[5px] h-full w-px bg-line" aria-hidden />}
            <span className={cn('relative mt-1.5 size-[11px] shrink-0 rounded-full', i === items.length - 1 ? 'bg-forest' : 'bg-muted/50')} />
            <span className="text-[14px]">
              <span className="font-semibold">
                {h.road_status === 'closed' && h.status === 'verified' ? 'Officially closed' : STATUS_META[h.status].label}
              </span>
              <span className="block text-[12px] text-muted">
                {formatDateTime(h.created_at)}
                {h.profiles?.full_name ? ` · ${h.profiles.full_name}` : ''}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
