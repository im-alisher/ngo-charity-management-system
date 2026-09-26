import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';
import { toMessage } from '@/lib/error-message';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-ink-subtle">
        {icon ?? <Inbox className="h-5 w-5" aria-hidden="true" />}
      </span>
      <div>
        <p className="font-medium text-ink">{title}</p>
        {description ? <p className="mt-1 text-sm text-ink-subtle">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

/**
 * Renders a request failure in plain language.
 *
 * The backend's own messages are already user-facing, so they are shown as-is;
 * anything unexpected is replaced with a generic line so internal details never
 * leak into the UI.
 */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const message = toMessage(error);
  const details = error instanceof ApiError ? error.errors : [];

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 px-6 py-10 text-center"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-700">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </span>

      <div>
        <p className="font-medium text-red-900">Something went wrong</p>
        <p className="mt-1 text-sm text-red-700">{message}</p>
        {details.length > 0 ? (
          <ul className="mt-2 list-disc space-y-0.5 pl-5 text-left text-xs text-red-700">
            {details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
