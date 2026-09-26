import { ApiError } from '@/lib/api-client';

/**
 * Turns any thrown value into a message safe to show a user.
 *
 * `ApiError` messages come from the backend and are already user-facing.
 * Anything else is replaced with a generic line, so internal details such as
 * stack traces or driver messages never reach the UI.
 */
export function toMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return 'An unexpected error occurred. Please try again.';
}
