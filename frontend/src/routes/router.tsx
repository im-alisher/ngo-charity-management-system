import { lazy, Suspense } from 'react';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '@/components/layout/app-layout';
import { LoadingState } from '@/components/ui/spinner';
import { PublicOnlyRoute, ProtectedRoute } from '@/routes/guards';

/**
 * Pages are code-split so the initial download only carries the shell and the
 * login screen. Everything else streams in as it is first visited.
 */
const LoginPage = lazy(() => import('@/pages/login-page').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() =>
  import('@/pages/dashboard-page').then((m) => ({ default: m.DashboardPage })),
);
const DonorsPage = lazy(() =>
  import('@/pages/donors-page').then((m) => ({ default: m.DonorsPage })),
);
const BeneficiariesPage = lazy(() =>
  import('@/pages/beneficiaries-page').then((m) => ({ default: m.BeneficiariesPage })),
);
const DonationsPage = lazy(() =>
  import('@/pages/donations-page').then((m) => ({ default: m.DonationsPage })),
);
const ReportsPage = lazy(() =>
  import('@/pages/reports-page').then((m) => ({ default: m.ReportsPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/not-found-page').then((m) => ({ default: m.NotFoundPage })),
);

const lazyElement = (element: React.ReactNode) => (
  <Suspense fallback={<LoadingState />}>{element}</Suspense>
);

/**
 * Route table.
 *
 * Everything except `/login` sits behind `ProtectedRoute`, so a new page is
 * authenticated by default unless it is deliberately placed outside.
 */
const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [{ path: '/login', element: lazyElement(<LoginPage />) }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: lazyElement(<DashboardPage />) },
          { path: '/donors', element: lazyElement(<DonorsPage />) },
          { path: '/beneficiaries', element: lazyElement(<BeneficiariesPage />) },
          { path: '/donations', element: lazyElement(<DonationsPage />) },
          { path: '/reports', element: lazyElement(<ReportsPage />) },
        ],
      },
    ],
  },
  { path: '*', element: lazyElement(<NotFoundPage />) },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
