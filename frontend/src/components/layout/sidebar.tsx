import { HandHeart } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { NAV_ITEMS } from '@/components/layout/nav-items';
import { cn } from '@/lib/cn';

export interface SidebarProps {
  /** Mobile drawer state; the desktop rail ignores it. */
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop. */}
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        // Off-canvas on mobile, a fixed rail from the large breakpoint up.
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-neutral-200 bg-white',
          'transition-transform duration-200 ease-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-neutral-200 px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-600 text-white">
            <HandHeart className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">Charity Manager</p>
            <p className="truncate text-xs text-ink-subtle">Administration</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-800'
                    : 'text-ink-muted hover:bg-neutral-100 hover:text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'h-4.5 w-4.5 shrink-0',
                      isActive ? 'text-brand-700' : 'text-ink-subtle',
                    )}
                    aria-hidden="true"
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-neutral-200 p-4">
          <p className="text-xs text-ink-subtle">
            Signed-in users can manage donors, beneficiaries and donations.
          </p>
        </div>
      </aside>
    </>
  );
}
