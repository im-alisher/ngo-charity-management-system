import { IsEmail, IsEnum, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

/** Passwords the API accepts, matched to the minimum the CLI enforces. */
export const PASSWORD_MIN_LENGTH = 8;
/**
 * bcrypt only considers the first 72 bytes of a password. Anything longer is
 * silently ignored, which would let two different passwords match, so the
 * limit is enforced rather than left to surprise someone later.
 */
export const PASSWORD_MAX_LENGTH = 72;

const ROLE_VALUES = Object.values(UserRole).join(', ');

export class CreateUserDto {
  @IsEmail({}, { message: 'email must be a valid address' })
  @MaxLength(180, { message: 'email must be at most 180 characters' })
  email!: string;

  @IsNotEmpty({ message: 'password is required' })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: `password must be at most ${PASSWORD_MAX_LENGTH} characters`,
  })
  password!: string;

  @IsEnum(UserRole, { message: `role must be one of: ${ROLE_VALUES}` })
  role!: UserRole;
}

export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: `role must be one of: ${ROLE_VALUES}` })
  role!: UserRole;
}
