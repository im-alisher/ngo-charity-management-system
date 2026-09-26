/** The authenticated principal attached to every protected request. */
export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface JwtPayload {
  /** User id. */
  sub: string;
  /** User email. */
  email: string;
  /** Issued-at, seconds since epoch. */
  iat?: number;
  /** Expiry, seconds since epoch. */
  exp?: number;
}
