import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const VARIANT_STYLES: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
  secondary: 'bg-neutral-900 text-white hover:bg-black active:bg-black',
  outline: 'border border-neutral-300 bg-white text-ink hover:bg-neutral-50 active:bg-neutral-100',
  ghost: 'text-ink-muted hover:bg-neutral-100 hover:text-ink active:bg-neutral-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
};

const SIZE_STYLES: Record<Size, string> = {
  sm: 'h-8 gap-1.5 px-3 text-sm',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-11 gap-2 px-5 text-base',
  icon: 'h-9 w-9',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      // Loading buttons stay in the layout and stay unclickable, so a form
      // does not jump when a request is in flight.
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md font-medium',
        'transition-colors duration-150',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
});
