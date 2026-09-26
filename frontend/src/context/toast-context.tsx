import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { ToastContext, type Toast } from '@/context/toast-store';
import { registerToastListener } from '@/lib/toast';

let nextId = 0;

const AUTO_DISMISS_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = ++nextId;
      setToasts((current) => [...current, { ...toast, id }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  // Expose the same `notify` to non-React callers (React Query callbacks)
  // through the `toast` helper module.
  useEffect(() => {
    registerToastListener(notify);
  }, [notify]);

  const value = useMemo(() => ({ toasts, notify, dismiss }), [toasts, notify, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
