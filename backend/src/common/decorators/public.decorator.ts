import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as reachable without a bearer token.
 *
 * Access control is deny-by-default: `JwtAuthGuard` is registered globally and
 * only skips routes that opt out with `@Public()`.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
