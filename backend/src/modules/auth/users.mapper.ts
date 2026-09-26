import type { User } from '@prisma/client';

import type { UserResponseDto } from './dto/auth-response.dto.js';

/** Strips the password hash so a `User` can safely cross the HTTP boundary. */
export function toPublicUser(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
