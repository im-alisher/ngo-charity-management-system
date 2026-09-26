import { toMessage } from '@/lib/error-message';

import type { ToastTone } from '@/context/toast-store';

export interface ToastRequest {
  tone: ToastTone;
  title: string;
  description?: string;
}

type Listener = (request: ToastRequest) => void;

let listener: Listener | null = null;

/**
 * Connects the toast module to the provider.
 *
 * React Query callbacks live outside the component tree, so they cannot call
 * `useToast()` directly. The provider registers itself once instead, which
 * keeps `toast.*` usable from any mutation.
 */
export function registerToastListener(next: Listener): void {
  listener = next;
}

function emit(request: ToastRequest): void {
  listener?.(request);
}

export const toast = {
  success(title: string, description?: string): void {
    emit({ tone: 'success', title, description });
  },

  error(title: string, error: unknown): void {
    emit({ tone: 'error', title, description: toMessage(error) });
  },

  info(title: string, description?: string): void {
    emit({ tone: 'info', title, description });
  },
};
