import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useReports } from '../context/ReportsContext'
import { SCOPES, isInScope } from '../data/locations'
import { computeStats } from '../lib/reportUtils'

/** Current geographic scope plus the reports and stats that belong to it. */
export function useGeographicScope() {
  const { scope } = useApp()
  const { reports } = useReports()
  const scopedReports = useMemo(() => reports.filter((r) => isInScope(r.city, scope)), [reports, scope])
  const stats = useMemo(() => computeStats(reports, scope), [reports, scope])
  return { scope, config: SCOPES[scope], scopedReports, stats }
}
