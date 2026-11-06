import { AlertCircle } from 'lucide-react'
import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from './components/alerts/Toaster'
import { LogoMark } from './components/common/Logo'
import { Footer } from './components/layout/Footer'
import { AlertsModal } from './components/layout/AlertsModal'
import { Navbar } from './components/layout/Navbar'
import { ReportDetails } from './components/reports/ReportDetails'
import { ReportModal } from './components/reports/ReportModal'
import { AppProvider } from './context/AppContext'
import { ReportsProvider, useReports } from './context/ReportsContext'
import { HomePage } from './pages/HomePage'
import { ReportsPage } from './pages/ReportsPage'

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

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ReportsProvider>
          <a href="#main" className="sr-only z-[2000] rounded-lg bg-forest px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
            Skip to content
          </a>
          <ScrollToHash />
          <Navbar />
          <StorageErrorBanner />
          <main id="main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <ReportModal />
          <AlertsModal />
          <ReportDetails />
          <Toaster />
        </ReportsProvider>
      </AppProvider>
    </BrowserRouter>
  )
}
