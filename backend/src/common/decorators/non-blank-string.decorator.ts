import { applyDecorators } from '@nestjs/common';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * A required string that must contain at least one non-whitespace character.
 *
 * `@IsNotEmpty()` alone would still accept `"   "`, which services then trim to
 * an empty value before it reaches the database.
 */
export function NonBlankString(options: { maxLength?: number } = {}) {
  const { maxLength = 255 } = options;

  return applyDecorators(
    IsString(),
    MinLength(1),
    MaxLength(maxLength),
    Matches(/\S/, {
      message: 'must contain at least one non-whitespace character',
    }),
  );
}
