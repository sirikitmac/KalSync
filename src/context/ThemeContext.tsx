import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type ThemePref = 'light' | 'dark' | 'system'
const KEY = 'kadaan:theme'

interface ThemeValue {
  pref: ThemePref
  /** What is actually showing. */
  resolved: 'light' | 'dark'
  setPref: (p: ThemePref) => void
}

const ThemeContext = createContext<ThemeValue | null>(null)

const readPref = (): ThemePref => {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'dark' || v === 'system' || v === 'light' ? v : 'light'
  } catch {
    return 'light'
  }
}

const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>(readPref)
  const [sysDark, setSysDark] = useState(systemDark)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const on = () => setSysDark(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const resolved = pref === 'system' ? (sysDark ? 'dark' : 'light') : pref

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('theme-switching')
    root.classList.toggle('dark', resolved === 'dark')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#0b0d0c' : '#f4f5f3')
    const t = window.setTimeout(() => root.classList.remove('theme-switching'), 50)
    return () => window.clearTimeout(t)
  }, [resolved])

  const setPref = useCallback((p: ThemePref) => {
    setPrefState(p)
    try {
      localStorage.setItem(KEY, p)
    } catch {
      /* private mode */
    }
  }, [])

  const value = useMemo(() => ({ pref, resolved, setPref }), [pref, resolved, setPref])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
