import { createContext, useContext } from 'react';

import type { User } from '@/types/api';

export interface AuthContextValue {
  user: User | null;
  /** True while a stored token is being exchanged for the current user. */
  isRestoring: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

/**
 * Defined in its own module so that `useAuth` and the provider live in
 * separate files: that keeps the context object out of a module that also
 * exports a component, which is what React Fast Refresh needs.
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an <AuthProvider>.');
  return context;
}
