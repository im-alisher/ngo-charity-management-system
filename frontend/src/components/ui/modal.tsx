import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Tailwind max-width class; defaults to a medium dialog. */
  size?: 'sm' | 'md' | 'lg';
  /** Prevents closing while a request is in flight. */
  isBusy?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

const SIZE_STYLES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
} as const;

/**
 * Accessible dialog rendered in a portal.
 *
 * Handles the behaviours a native `<dialog>` would give for free: Escape to
 * close, a focus trap, focus moving to the dialog on open and returning to the
 * trigger on close, background scroll locking, and a backdrop click target.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  isBusy = false,
  children,
  footer,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    // Move focus into the dialog so screen readers announce its title.
    const focusTimer = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (first ?? panelRef.current)?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isBusy) {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      // Cycle focus within the dialog.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isBusy, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={() => {
          if (!isBusy) onClose();
        }}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-lg bg-white shadow-xl',
          'animate-slide-in-right sm:rounded-lg',
          SIZE_STYLES[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <h2 id="modal-title" className="text-base font-semibold text-ink">
              {title}
            </h2>
            {description ? (
              <p id="modal-description" className="mt-1 text-sm text-ink-subtle">
                {description}
              </p>
            ) : null}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Close dialog"
            className="-mr-1.5 -mt-1"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-neutral-200 bg-neutral-50 px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
