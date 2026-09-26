import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Sidebar } from '@/components/layout/sidebar';
import { NAV_ITEMS } from '@/components/layout/nav-items';
import { Topbar } from '@/components/layout/topbar';
import { cn } from '@/lib/cn';

export function AppLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // A route change on mobile should reveal the new page, not the open drawer.
  // Adjusting state during render (rather than in an effect) closes the drawer
  // in the same commit that renders the new route, with no extra frame.
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setIsSidebarOpen(false);
  }

  const pageTitle =
    NAV_ITEMS.find((item) => location.pathname.startsWith(item.to))?.label ?? 'Charity Manager';

  return (
    <div className="min-h-full">
      <a
        href="#main-content"
        className={cn(
          'sr-only focus:not-sr-only',
          'focus:absolute focus:top-3 focus:left-3 focus:z-100',
          'focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:text-white',
        )}
      >
        Skip to content
      </a>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} pageTitle={pageTitle} />

        <main id="main-content" className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
