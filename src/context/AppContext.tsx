import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { local } from '../services/storageService'
import type { Coordinates, GeographicScope } from '../types/report'

export interface Toast {
  id: number
  title: string
  description?: string
  tone?: 'success' | 'info' | 'alert'
}

type Modal = 'report' | 'join' | null

interface AppContextValue {
  scope: GeographicScope
  setScope: (s: GeographicScope) => void
  /** Location the map should focus on after a place search (cleared on scope change). */
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

  toasts: Toast[]
  pushToast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: number) => void
}

const AppContext = createContext<AppContextValue | null>(null)
const SCOPE_KEY = 'kalsync:scope'

export function AppProvider({ children }: { children: ReactNode }) {
  const [scope, setScopeState] = useState<GeographicScope>(() => local.read<GeographicScope>(SCOPE_KEY, 'iligan'))
  const [focus, setFocus] = useState<AppContextValue['focus']>(null)
  const [modal, setModal] = useState<Modal>(null)
  const [selectedReportId, setSelected] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const setScope = useCallback((s: GeographicScope) => {
    setScopeState(s)
    setFocus(null)
    local.write(SCOPE_KEY, s)
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
      setScope,
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
      toasts,
      pushToast,
      dismissToast,
    }),
    [scope, setScope, focus, modal, selectedReportId, userLocation, toasts, pushToast, dismissToast],
  )
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
