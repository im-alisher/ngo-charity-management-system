import { UserRole } from '@prisma/client';

/** The authenticated principal attached to every protected request. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  /**
   * Taken from the verified token rather than the database, so authorisation
   * never needs an extra query. A revoked role therefore takes effect when the
   * token expires, not instantly.
   */
  role: UserRole;
}

export interface JwtPayload {
  /** User id. */
  sub: string;
  /** User email. */
  email: string;
  /** Access level, used by {@link RolesGuard}. */
  role: UserRole;
  /** Issued-at, seconds since epoch. */
  iat?: number;
  /** Expiry, seconds since epoch. */
  exp?: number;
}
