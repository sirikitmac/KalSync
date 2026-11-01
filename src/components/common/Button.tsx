import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary:
    'bg-forest text-white shadow-[0_1px_0_rgb(255_255_255/0.12)_inset,0_6px_16px_-6px_rgb(20_83_45/0.6)] hover:bg-forest-600 active:translate-y-px',
  secondary: 'bg-white text-ink border border-line shadow-card hover:border-brand/40 hover:text-forest',
  outline: 'border border-forest/20 text-forest bg-transparent hover:bg-mint/60',
  ghost: 'text-ink hover:bg-ink/5',
  danger: 'bg-danger text-white hover:bg-red-700',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-4.5 text-[15px] gap-2 rounded-xl',
  lg: 'h-13 px-6 text-base gap-2.5 rounded-xl',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center font-semibold whitespace-nowrap transition duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
})
