import { ImageOff } from 'lucide-react'
import { getCategory } from '../../data/categories'
import { useReportImage } from '../../hooks/useReportImage'
import { cn } from '../../lib/cn'
import type { Report } from '../../types/report'
import { SceneIllustration } from './SceneIllustration'

export function ReportImage({ report, className }: { report: Report; className?: string }) {
  const { url, loading } = useReportImage(report.imageKey)
  const isScene = report.imageKey?.startsWith('scene:')
  const cat = getCategory(report.category)
  const Icon = cat.icon

  return (
    <div className={cn('relative overflow-hidden bg-slate-100', className)}>
      {url ? (
        <img src={url} alt={`Photo for: ${report.title}`} className="h-full w-full object-cover" loading="lazy" decoding="async" />
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
      {isScene && (
        <span className="absolute right-2 bottom-2 rounded-md bg-black/45 px-1.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur">
          Illustration · not a photo
        </span>
      )}
    </div>
  )
}
