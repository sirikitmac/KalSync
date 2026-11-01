import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useReports } from '../context/ReportsContext'
import { filterReports } from '../lib/reportUtils'
import type { ReportFilters } from '../types/report'

export { useReports }

/** Reports in the current geographic scope with all filters applied. */
export function useFilteredReports(filters: ReportFilters) {
  const { reports, confirmedIds, loading } = useReports()
  const { scope } = useApp()
  const filtered = useMemo(
    () => filterReports(reports, scope, filters, confirmedIds),
    [reports, scope, filters, confirmedIds],
  )
  return { filtered, loading }
}
