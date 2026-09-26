import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingState } from '@/components/ui/spinner';
import { useAuth } from '@/context/auth-store';

/**
 * Gate for authenticated routes.
 *
 * While the stored token is being verified, rendering is paused; otherwise a
 * refresh would bounce the user to the login page and straight back.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isRestoring } = useAuth();
  const location = useLocation();

  if (isRestoring) return <LoadingState label="Restoring your session" />;

  if (!isAuthenticated) {
    // Remember where the user was headed so login can return them there.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}

/** Keeps a signed-in user away from the login page. */
export function PublicOnlyRoute() {
  const { isAuthenticated, isRestoring } = useAuth();

  if (isRestoring) return <LoadingState label="Loading" />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
