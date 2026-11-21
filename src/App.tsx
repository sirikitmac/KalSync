import { AlertCircle } from './components/common/icons'
import { useEffect } from 'react'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from './components/alerts/Toaster'
import { LogoMark } from './components/common/Logo'
import { Footer } from './components/layout/Footer'
import { AlertsModal } from './components/layout/AlertsModal'
import { Navbar } from './components/layout/Navbar'
import { Splash } from './components/layout/Splash'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ReportDetails } from './components/reports/ReportDetails'
import { ReportModal } from './components/reports/ReportModal'
import { AppProvider } from './context/AppContext'
import { ReportsProvider, useReports } from './context/ReportsContext'
import { HomePage } from './pages/HomePage'

const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const HistoryPage = lazy(() => import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })))
const MapPage = lazy(() => import('./pages/MapPage').then((m) => ({ default: m.MapPage })))

/** Scrolls to #hash targets after route changes (e.g. /#how-it-works from another page). */
function ScrollToHash() {
  const { hash, pathname } = useLocation()
  useEffect(() => {
    if (!hash) return
    const id = hash.slice(1)
    let tries = 0
    const attempt = () => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else if (tries++ < 20) window.setTimeout(attempt, 50)
    }
    attempt()
  }, [hash, pathname])
  return null
}

function StorageErrorBanner() {
  const { error } = useReports()
  if (!error) return null
  return (
    <div role="alert" className="container-page mt-3">
      <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <AlertCircle className="size-4 shrink-0" /> {error}
      </p>
    </div>
  )
}

function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <LogoMark className="mx-auto mb-6 size-16" />
      <h1 className="text-4xl font-extrabold">Wrong turn.</h1>
      <p className="mt-2 text-muted">This page doesn’t exist.</p>
    </div>
  )
}

/** Landing pages get the site navbar and footer; the map app is full screen. */
function Shell() {
  const { pathname } = useLocation()
  const isApp = pathname.startsWith('/map') || pathname.startsWith('/login')
  return (
    <>
      <a href="#main" className="sr-only z-[2000] rounded-lg bg-forest px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      <ScrollToHash />
      {!isApp && <Navbar />}
      {!isApp && <StorageErrorBanner />}
      <main id="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/map"
            element={
              <Suspense fallback={<div className="fixed inset-0 bg-fill" />}>
                <MapPage />
              </Suspense>
            }
          />
          <Route path="/login" element={<Suspense fallback={null}><LoginPage /></Suspense>} />
          <Route path="/history" element={<Suspense fallback={null}><HistoryPage /></Suspense>} />
          <Route path="/reports" element={<Navigate to="/map" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isApp && <Footer />}
      <ReportModal />
      <AlertsModal />
      <ReportDetails />
      <Toaster />
      <Splash />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <ReportsProvider>
              <Shell />
            </ReportsProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
