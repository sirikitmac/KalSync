import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  /** Accessible label when no visible title is provided */
  ariaLabel?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}

/**
 * Centered dialog on tablet/desktop, bottom sheet on mobile.
 * Locks body scroll, closes on Escape / backdrop, restores focus.
 */
export function Modal({ open, onClose, title, ariaLabel, children, footer, size = 'md' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    requestAnimationFrame(() => panelRef.current?.focus())
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade-in bg-ink/45 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : ariaLabel}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92dvh] w-full animate-sheet-up flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift outline-none sm:max-h-[88vh] sm:rounded-3xl',
          size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg',
        )}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line sm:hidden" aria-hidden />
        {title !== undefined && (
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 pt-3 pb-4 sm:px-6 sm:pt-5">
            <div className="min-w-0 flex-1">{typeof title === 'string' ? <h2 className="text-lg font-bold">{title}</h2> : title}</div>
            <button
              onClick={onClose}
              className="-mr-2 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition hover:bg-ink/5 hover:text-ink"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="pb-safe shrink-0 border-t border-line bg-white px-5 pt-3 sm:px-6 sm:pb-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
