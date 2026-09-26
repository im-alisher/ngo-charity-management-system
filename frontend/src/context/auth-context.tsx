import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { AuthContext, type AuthContextValue } from '@/context/auth-store';
import { ApiError, setUnauthorizedHandler, tokenStorage } from '@/lib/api-client';
import { authApi } from '@/features/auth/api';
import type { User } from '@/types/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // A token in storage is not proof of a valid session, so the app starts in a
  // loading state and confirms the token before rendering protected routes.
  const [isRestoring, setIsRestoring] = useState(() => tokenStorage.get() !== null);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setIsRestoring(false);
  }, []);

  // A 401 from any request means the session ended, wherever it happened.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      tokenStorage.clear();
      setIsRestoring(false);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    // Nothing to confirm: the initial state already has `isRestoring` false.
    if (!tokenStorage.get()) return;

    const controller = new AbortController();

    authApi
      .me(controller.signal)
      .then(setUser)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        if (error instanceof ApiError && error.isUnauthorized) logout();
      })
      .finally(() => setIsRestoring(false));

    return () => controller.abort();
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    tokenStorage.set(result.accessToken);
    setIsRestoring(false);
    setUser(result.user);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isRestoring,
      isAuthenticated: user !== null,
      login,
      logout,
    }),
    [user, isRestoring, logout, login],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
