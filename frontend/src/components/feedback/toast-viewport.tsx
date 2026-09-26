import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

import { useToast, type ToastTone } from '@/context/toast-store';
import { cn } from '@/lib/cn';

const TONE_STYLES: Record<ToastTone, { container: string; icon: React.ReactNode }> = {
  success: {
    container: 'border-brand-200 bg-brand-50 text-brand-900',
    icon: <CheckCircle2 className="h-5 w-5 text-brand-700" aria-hidden="true" />,
  },
  error: {
    container: 'border-red-200 bg-red-50 text-red-900',
    icon: <AlertCircle className="h-5 w-5 text-red-700" aria-hidden="true" />,
  },
  info: {
    container: 'border-neutral-200 bg-white text-ink',
    icon: <Info className="h-5 w-5 text-ink-subtle" aria-hidden="true" />,
  },
};

/** Renders the toast stack; mounted once at the app root. */
export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-100 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className={cn(
            'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-card-hover animate-fade-in',
            TONE_STYLES[toast.tone].container,
          )}
        >
          {TONE_STYLES[toast.tone].icon}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.description ? (
              <p className="mt-0.5 text-sm opacity-90">{toast.description}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
            className="-mt-0.5 -mr-1 rounded p-1 opacity-60 transition-opacity hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
