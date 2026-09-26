import { LogOut, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-store';

export interface TopbarProps {
  onMenuClick: () => void;
  pageTitle: string;
}

export function Topbar({ onMenuClick, pageTitle }: TopbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>

      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{pageTitle}</p>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-ink">{user?.email}</p>
        </div>

        <span
          className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-ink-muted"
          aria-hidden="true"
        >
          {user?.email?.charAt(0).toUpperCase() ?? '?'}
        </span>

        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
