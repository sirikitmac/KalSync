import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'ink' | 'tinted'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-forest text-white hover:bg-forest-600',
  ink: 'bg-ink text-canvas hover:bg-ink/90',
  tinted: 'bg-brand/12 text-forest hover:bg-brand/18 dark:text-brand',
  secondary: 'bg-surface text-ink shadow-card hover:bg-fill',
  outline: 'border border-forest/20 text-forest bg-transparent hover:bg-mint/60',
  ghost: 'text-ink hover:bg-ink/5',
  danger: 'bg-danger text-white hover:bg-red-700',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-full',
  md: 'h-11 px-5 text-[15px] gap-2 rounded-full',
  lg: 'h-13 px-6 text-[17px] gap-2.5 rounded-full',
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
        'inline-flex shrink-0 cursor-pointer items-center justify-center font-semibold whitespace-nowrap transition duration-200 ease-[var(--ease-ios)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
})
