import { getDeviceId } from '../lib/deviceId'
import { supabase } from '../lib/supabase'
import { simulateLatency } from './reportService'
import { local } from './storageService'

/** What a rider subscribes to. In production this is saved server-side and drives SMS/push. */
export interface AlertPrefs {
  barangays: string[]
  /** Optional, PH mobile format 09XXXXXXXXX. Used only for road alerts. */
  sms?: string
  consentedAt?: string
}

const KEY = 'kadaan:alert-prefs'
export const EMPTY_PREFS: AlertPrefs = { barangays: [] }

export const PH_MOBILE = /^09\d{9}$/

export const alertService = {
  read(): AlertPrefs {
    return local.read<AlertPrefs>(KEY, EMPTY_PREFS)
  },
  async save(prefs: AlertPrefs): Promise<AlertPrefs> {
    if (supabase) {
      // The alert settings form requires consent before it can be saved.
      const { error } = await supabase.rpc('save_alert_subscription', {
        p_device_id: getDeviceId(),
        p_barangays: prefs.barangays,
        p_sms_number: prefs.sms ?? null,
        p_consent: true,
      })
      if (error) throw error
    } else {
      await simulateLatency(500, 900)
    }
    const saved = { ...prefs, consentedAt: new Date().toISOString() }
    local.write(KEY, saved)
    return saved
  },
  async clear() {
    if (supabase) {
      const { error } = await supabase.rpc('delete_alert_subscription', { p_device_id: getDeviceId() })
      if (error) throw error
    } else {
      await simulateLatency(250, 500)
    }
    local.write(KEY, EMPTY_PREFS)
  },
}
