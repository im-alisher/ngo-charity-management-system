import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';

import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface.js';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Authorises the caller by role, after `JwtAuthGuard` has attached the user.
 *
 * Two rules, in order:
 *
 * 1. A route decorated with `@Roles(...)` admits only those roles.
 * 2. Otherwise the HTTP method decides: reads are open to every signed-in
 *    role, and writes require at least `STAFF`.
 *
 * The second rule is what makes `VIEWER` genuinely read-only. Expressing it
 * here rather than annotating every controller means a new write endpoint is
 * read-only for viewers by default, instead of only if someone remembers to
 * annotate it.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];

    // `@Public()` routes (login, health) have no authenticated user, so there
    // is no role to check. JwtAuthGuard has already let them through.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets);
    if (isPublic) return true;

    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, targets);

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // JwtAuthGuard runs first and rejects anonymous callers, so this only
    // happens if the two guards are ever reordered.
    if (!user) return false;

    if (required?.length) {
      if (!required.includes(user.role)) {
        throw new ForbiddenException(
          `This action requires one of the following roles: ${required.join(', ')}.`,
        );
      }
      return true;
    }

    if (WRITE_METHODS.has(request.method) && user.role === UserRole.VIEWER) {
      throw new ForbiddenException('Your account has read-only access.');
    }

    return true;
  }
}
