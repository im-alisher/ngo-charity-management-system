import { useId, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

export interface FieldProps {
  label: string;
  /** Shown under the label; use for units or formats, e.g. "USD". */
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (props: { id: string; hasError: boolean; describedBy?: string }) => ReactNode;
}

/**
 * Wraps a form control with a label and an error message, and wires up the
 * `id` and `aria-describedby` relationships the control needs.
 *
 * `children` is a render prop so the same field shell can wrap an input, a
 * select or a textarea without the caller having to juggle ids.
 */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {required ? (
          <span className="ml-0.5 text-red-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {children({ id, hasError: Boolean(error), describedBy: describedBy || undefined })}

      {hint ? (
        <p id={hintId} className="text-xs text-ink-subtle">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
