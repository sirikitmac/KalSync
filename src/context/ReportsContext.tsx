import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { reportService } from '../services/reportService'
import type { NewReportInput, Report, ReportStatus } from '../types/report'

interface ReportsContextValue {
  reports: Report[]
  loading: boolean
  error: string | null
  confirmedIds: Set<string>
  submitReport: (input: NewReportInput) => Promise<Report>
  setStatus: (id: string, status: ReportStatus) => Promise<void>
  confirmReport: (id: string) => Promise<void>
  resetLocalData: () => Promise<void>
  reload: () => Promise<void>
}

const ReportsContext = createContext<ReportsContextValue | null>(null)

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(() => reportService.getConfirmedIds())

  const reload = useCallback(async () => {
    try {
      setError(null)
      setReports(await reportService.list())
      setConfirmedIds(reportService.getConfirmedIds())
    } catch (e) {
      console.error(e)
      setError('We couldn’t load saved reports from this browser. Showing sample data only.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const submitReport = useCallback(async (input: NewReportInput) => {
    const created = await reportService.create(input)
    setReports((prev) => [created, ...prev])
    return created
  }, [])

  const setStatus = useCallback(async (id: string, status: ReportStatus) => {
    await reportService.updateStatus(id, status)
    const statusUpdatedAt = new Date().toISOString()
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status, statusUpdatedAt } : r)))
  }, [])

  const confirmReport = useCallback(async (id: string) => {
    await reportService.confirm(id)
    setConfirmedIds((prev) => new Set(prev).add(id))
  }, [])

  const resetLocalData = useCallback(async () => {
    await reportService.resetLocalData()
    await reload()
  }, [reload])

  const value = useMemo(
    () => ({ reports, loading, error, confirmedIds, submitReport, setStatus, confirmReport, resetLocalData, reload }),
    [reports, loading, error, confirmedIds, submitReport, setStatus, confirmReport, resetLocalData, reload],
  )

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useReports() {
  const ctx = useContext(ReportsContext)
  if (!ctx) throw new Error('useReports must be used inside <ReportsProvider>')
  return ctx
}
