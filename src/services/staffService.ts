import { supabase } from '../lib/supabase'
import type { OrgId, ReportStatus, Severity } from '../types/report'

/** Actions only signed-in personnel and admins can perform. Row level security enforces this in the database. */

export interface StaffPatch {
  status?: ReportStatus
  road_status?: 'advisory' | 'closed'
  closure_reference?: string | null
  issued_by?: OrgId | null
  verified_by?: OrgId | null
  detour_description?: string | null
  severity?: Severity | null
}

function db() {
  if (!supabase) throw new Error('Staff actions need the online backend.')
  return supabase
}

export async function updateReport(id: string, patch: StaffPatch) {
  const { data, error } = await db().from('reports').update(patch).eq('id', id).select('id')
  if (error) throw error
  if (!data?.length) throw new Error('This report could not be changed. It may be a sample report, or your account has no permission.')
}

/** Resolve many reports at once. Returns how many rows the database actually changed. */
export async function resolveReports(ids: string[]) {
  if (!ids.length) return 0
  const { data, error } = await db().from('reports').update({ status: 'resolved', road_status: 'advisory' }).in('id', ids).select('id')
  if (error) throw error
  return data?.length ?? 0
}

export interface HistoryEntry {
  id: number
  status: ReportStatus
  road_status: 'advisory' | 'closed'
  created_at: string
  changed_by: string | null
  profiles: { full_name: string } | null
}

export async function getHistory(reportId: string): Promise<HistoryEntry[]> {
  const { data, error } = await db()
    .from('report_status_history')
    .select('id, status, road_status, created_at, changed_by, profiles(full_name)')
    .eq('report_id', reportId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as unknown as HistoryEntry[]
}

export interface BarangayAlert {
  id: number
  barangays: string[]
  severity: Severity
  message: string
  report_id: string | null
  office_id: OrgId
  created_at: string
}

export async function sendBarangayAlert(input: { barangays: string[]; message: string; severity: Severity; reportId?: string | null }) {
  const { data, error } = await db().rpc('send_barangay_alert', {
    p_barangays: input.barangays,
    p_message: input.message.trim(),
    p_severity: input.severity,
    p_report_id: input.reportId ?? null,
  })
  if (error) throw error
  return data as BarangayAlert
}

export async function listBarangayAlerts(limit = 30): Promise<BarangayAlert[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('barangay_alerts')
    .select('id, barangays, severity, message, report_id, office_id, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as BarangayAlert[]
}
