import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/cn';

export interface SpinnerProps {
  className?: string;
  /** Accessible label announced while loading. */
  label?: string;
}

export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <Loader2
        className={cn('h-5 w-5 animate-spin text-ink-subtle', className)}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Full-area loading state, used while a page's first request is in flight. */
export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <Spinner className="h-6 w-6" label={label} />
    </div>
  );
}
