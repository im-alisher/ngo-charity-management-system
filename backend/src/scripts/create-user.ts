import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { UserRole } from '@prisma/client';

import { AppModule } from '../app.module.js';
import { AuthService } from '../modules/auth/auth.service.js';
import { UsersService } from '../modules/auth/users.service.js';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../modules/auth/dto/create-user.dto.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_ROLE = UserRole.ADMIN;

/**
 * Creates an account.
 *
 * Accounts are not created through an open HTTP "register" endpoint, because
 * that would let anyone take over the system. Run this after the migration has
 * been applied:
 *
 *   npm run user:create -- admin@charity.org 'Str0ngPassw0rd'
 *   npm run user:create -- staff@charity.org 'Str0ngPassw0rd' --role=STAFF
 *
 * The same limits the API enforces are applied here, so neither entry point
 * accepts a password the other would reject.
 */
async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const usersService = app.get(UsersService);
    const authService = app.get(AuthService);

    const args = process.argv.slice(2);
    const positional = args.filter((arg) => !arg.startsWith('--'));
    const flags = args.filter((arg) => arg.startsWith('--'));

    const email = (positional[0] ?? '').trim().toLowerCase();
    const password = positional[1] ?? '';
    const providedPassword = positional.length > 1;

    if (!email || !EMAIL_PATTERN.test(email)) {
      console.error('Usage: npm run user:create -- <email> <password> [--role=ADMIN|STAFF|VIEWER]');
      console.error('The email must be a valid address.');
      process.exitCode = 1;
      return;
    }

    if (!providedPassword) {
      console.error('The password is required when running non-interactively.');
      process.exitCode = 1;
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
      console.error(
        `The password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`,
      );
      process.exitCode = 1;
      return;
    }

    const roleFlag = flags.find((flag) => flag.startsWith('--role='));
    const role = (roleFlag?.slice('--role='.length) ?? DEFAULT_ROLE).toUpperCase();

    if (!Object.values(UserRole).includes(role as UserRole)) {
      console.error(`The role must be one of: ${Object.values(UserRole).join(', ')}.`);
      process.exitCode = 1;
      return;
    }

    const existing = await usersService.findByEmail(email);
    if (existing) {
      console.error(`A user with the email ${email} already exists (role ${existing.role}).`);
      process.exitCode = 1;
      return;
    }

    const passwordHash = await authService.hashPassword(password);
    const user = await usersService.create(email, passwordHash, role as UserRole);

    console.log(`Created ${user.role} user ${user.email} (${user.id}).`);
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error('Failed to create the user:', error);
  process.exitCode = 1;
});
