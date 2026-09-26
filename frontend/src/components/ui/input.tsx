import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

const CONTROL_STYLES = cn(
  'w-full rounded-md border bg-white text-sm text-ink',
  'placeholder:text-neutral-400',
  'transition-colors duration-150',
  'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500',
  // `aria-invalid` styling lives in the base so every control matches.
  'aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500',
);

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, hasError = false, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={hasError || undefined}
      className={cn(
        CONTROL_STYLES,
        'h-10 border-neutral-300 px-3',
        'focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20',
        className,
      )}
      {...props}
    />
  );
});
