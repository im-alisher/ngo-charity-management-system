import { forwardRef, type SelectHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, hasError = false, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      aria-invalid={hasError || undefined}
      className={cn(
        'h-10 w-full cursor-pointer appearance-none rounded-md border bg-white',
        "bg-[url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23737373' stroke-linecap='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E\")]",
        'bg-[length:20px_20px] bg-[position:right_0.5rem_center] bg-no-repeat pr-9 pl-3 text-sm text-ink',
        'placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:bg-neutral-100',
        'aria-[invalid=true]:border-red-500',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
