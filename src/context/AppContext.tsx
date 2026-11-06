import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { alertService, type AlertPrefs } from '../services/alertService'
import type { Coordinates, GeographicScope } from '../types/report'

export interface Toast {
  id: number
  title: string
  description?: string
  tone?: 'success' | 'info' | 'alert'
}

type Modal = 'report' | 'alerts' | null

interface AppContextValue {
  /** Always Iligan City — KaDaan's coverage area. */
  scope: GeographicScope
  /** Location the map should focus on after a place search. */
  focus: { coordinates: Coordinates; label: string; zoom: number } | null
  setFocus: (f: AppContextValue['focus']) => void

  modal: Modal
  openModal: (m: Exclude<Modal, null>) => void
  closeModal: () => void

  selectedReportId: string | null
  openReport: (id: string) => void
  closeReport: () => void

  userLocation: Coordinates | null
  setUserLocation: (c: Coordinates | null) => void

  /** Barangays this rider follows for alerts (+ optional SMS number). */
  alertPrefs: AlertPrefs
  saveAlertPrefs: (p: AlertPrefs) => Promise<void>

  toasts: Toast[]
  pushToast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: number) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const scope: GeographicScope = 'iligan'
  const [focus, setFocus] = useState<AppContextValue['focus']>(null)
  const [modal, setModal] = useState<Modal>(null)
  const [selectedReportId, setSelected] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)
  const [alertPrefs, setAlertPrefs] = useState<AlertPrefs>(() => alertService.read())
  const saveAlertPrefs = useCallback(async (p: AlertPrefs) => {
    setAlertPrefs(await alertService.save(p))
  }, [])

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const pushToast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = nextId.current++
      setToasts((prev) => [...prev.slice(-2), { ...t, id }])
      window.setTimeout(() => dismissToast(id), 6000)
    },
    [dismissToast],
  )

  const value = useMemo<AppContextValue>(
    () => ({
      scope,
      focus,
      setFocus,
      modal,
      openModal: (m) => setModal(m),
      closeModal: () => setModal(null),
      selectedReportId,
      openReport: (id) => setSelected(id),
      closeReport: () => setSelected(null),
      userLocation,
      setUserLocation,
      alertPrefs,
      saveAlertPrefs,
      toasts,
      pushToast,
      dismissToast,
    }),
    [alertPrefs, saveAlertPrefs, scope, focus, modal, selectedReportId, userLocation, toasts, pushToast, dismissToast],
  )
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
