import { FlaskConical, Smartphone } from 'lucide-react'
import type { ReactNode } from 'react'
import { SEVERITY_META, STATUS_META, getCategory } from '../../data/categories'
import { cn } from '../../lib/cn'
import type { IncidentCategory, ReportSource, ReportStatus, Severity } from '../../types/report'

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ring-1 ring-inset',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: ReportStatus }) {
  const m = STATUS_META[status]
  return (
    <Badge className={m.className}>
      <span className={cn('size-1.5 rounded-full', m.dot)} aria-hidden />
      {m.label}
    </Badge>
  )
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const m = SEVERITY_META[severity]
  return (
    <Badge className={m.className}>
      <span className={cn('size-1.5 rounded-full', m.dot)} aria-hidden />
      {m.label}
    </Badge>
  )
}

export function CategoryBadge({ category, solid }: { category: IncidentCategory; solid?: boolean }) {
  const c = getCategory(category)
  const Icon = c.icon
  return (
    <Badge className={solid ? 'bg-white/95 text-ink ring-black/5 backdrop-blur' : 'bg-white text-ink ring-line'}>
      <Icon className="size-3.5" style={{ color: c.color }} aria-hidden />
      {c.label}
    </Badge>
  )
}

export function SourceBadge({ source, compact }: { source: ReportSource; compact?: boolean }) {
  return source === 'demo' ? (
    <Badge className="bg-slate-900/80 text-white ring-transparent backdrop-blur">
      <FlaskConical className="size-3" aria-hidden />
      {compact ? 'DEMO' : 'DEMO DATA'}
    </Badge>
  ) : (
    <Badge className="bg-forest text-white ring-transparent">
      <Smartphone className="size-3" aria-hidden />
      {compact ? 'Yours' : 'Submitted by you'}
    </Badge>
  )
}
