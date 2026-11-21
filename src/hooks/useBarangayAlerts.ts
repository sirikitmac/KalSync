import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { listBarangayAlerts, type BarangayAlert } from '../services/staffService'

/** Official alerts sent by personnel (UC-10), kept live through realtime. */
export function useBarangayAlerts() {
  const [alerts, setAlerts] = useState<BarangayAlert[]>([])
  useEffect(() => {
    if (!supabase) return
    let live = true
    const load = () => void listBarangayAlerts().then((a) => live && setAlerts(a)).catch(() => {})
    load()
    const channel = supabase
      .channel('barangay-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'barangay_alerts' }, load)
      .subscribe()
    return () => {
      live = false
      void supabase?.removeChannel(channel)
    }
  }, [])
  return alerts
}
