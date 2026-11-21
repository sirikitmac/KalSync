import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useReports } from '../../context/ReportsContext'
import { resolveReports } from '../../services/staffService'
import type { Report } from '../../types/report'
import { Button } from '../common/Button'
import { CheckCircle2, LoaderCircle } from '../common/icons'
import { Modal } from '../common/Modal'

/** Resolve every report currently shown in the list. Sample reports are skipped. */
export function BulkResolveModal({ open, onClose, reports, label }: { open: boolean; onClose: () => void; reports: Report[]; label: string }) {
  const { reload } = useReports()
  const { pushToast } = useApp()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const real = reports.filter((r) => r.source !== 'demo')
  const samples = reports.length - real.length

  const confirm = async () => {
    setBusy(true)
    setError(null)
    try {
      const n = await resolveReports(real.map((r) => r.id))
      await reload()
      pushToast({ tone: 'success', title: `${n} report${n === 1 ? '' : 's'} resolved`, description: 'They are off the map. Reopen any of them from History.' })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The reports could not be resolved.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Resolve all shown?"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="ink" onClick={confirm} disabled={busy || real.length === 0}>
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" weight="fill" />}
            Resolve {real.length}
          </Button>
        </div>
      }
    >
      <p className="text-[15px] leading-relaxed">
        {real.length === 0
          ? 'Only sample reports are shown, and those can’t be changed.'
          : `All ${real.length} ${label} will be marked resolved and removed from the map. You can reopen any of them from History.`}
      </p>
      {samples > 0 && real.length > 0 && <p className="mt-2 text-[14px] text-muted">{samples} sample report{samples === 1 ? '' : 's'} will be skipped.</p>}
      {error && <p className="mt-3 text-[14px] text-red-600">{error}</p>}
    </Modal>
  )
}
