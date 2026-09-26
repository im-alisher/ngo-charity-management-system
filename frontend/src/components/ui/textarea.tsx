import { forwardRef, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, hasError = false, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={hasError || undefined}
      className={cn(
        'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-ink',
        'placeholder:text-neutral-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20',
        'disabled:cursor-not-allowed disabled:bg-neutral-100',
        'aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500',
        className,
      )}
      {...props}
    />
  );
});
