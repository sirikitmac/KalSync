import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import { getCategory } from '../../data/categories'
import { useReportImage } from '../../hooks/useReportImage'
import { cn } from '../../lib/cn'
import type { Report } from '../../types/report'
import { SceneIllustration } from './SceneIllustration'

/**
 * Report thumbnail. Priority: the reporter's own photo (IndexedDB) → a freely
 * licensed stock photo (demo data) → a drawn illustration (fallback if offline).
 */
export function ReportImage({ report, className, eager }: { report: Report; className?: string; eager?: boolean }) {
  const { url, loading } = useReportImage(report.imageKey)
  const [stockFailed, setStockFailed] = useState(false)
  const [stockLoaded, setStockLoaded] = useState(false)
  const useStock = !url && report.photo && !stockFailed
  const isScene = !url && !useStock && report.imageKey?.startsWith('scene:')
  const cat = getCategory(report.category)
  const Icon = cat.icon

  return (
    <div className={cn('relative overflow-hidden bg-slate-100', className)}>
      {url ? (
        <img src={url} alt={`Photo for: ${report.title}`} className="h-full w-full object-cover" loading="lazy" decoding="async" />
      ) : useStock ? (
        <>
          {!stockLoaded && <div className="absolute inset-0 animate-pulse bg-slate-200" />}
          <img
            src={report.photo!.src}
            alt={`Stock photo illustrating ${cat.label.toLowerCase()}`}
            className={cn('h-full w-full object-cover transition-opacity duration-300', stockLoaded ? 'opacity-100' : 'opacity-0')}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setStockLoaded(true)}
            onError={() => setStockFailed(true)}
          />
        </>
      ) : isScene ? (
        <SceneIllustration category={report.category} seed={report.id} />
      ) : loading ? (
        <div className="h-full w-full animate-pulse bg-slate-200" />
      ) : (
        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-mint/70 to-white text-muted">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-white shadow-card">
              <Icon className="size-6" style={{ color: cat.color }} />
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium">
              <ImageOff className="size-3.5" /> No photo attached
            </span>
          </div>
        </div>
      )}
      {(useStock || isScene) && (
        <span className="absolute right-2 bottom-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur">
          {useStock ? 'Stock photo · not this location' : 'Illustration · not a photo'}
        </span>
      )}
    </div>
  )
}

/** Attribution line for a demo report's stock photo (required by CC BY / BY-SA). */
export function PhotoCredit({ report }: { report: Report }) {
  const p = report.photo
  if (!p) return null
  return (
    <p className="text-[11px] leading-relaxed text-muted">
      Photo:{' '}
      <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-2 hover:text-forest">
        {p.title.replace(/\.(jpe?g|png)$/i, '')}
      </a>{' '}
      by {p.author}, via Wikimedia Commons ·{' '}
      {p.licenseUrl ? (
        <a href={p.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-2 hover:text-forest">
          {p.license}
        </a>
      ) : (
        p.license
      )}
      . Stock image showing the incident type — not taken at this location.
    </p>
  )
}
