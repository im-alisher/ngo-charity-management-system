import 'dotenv/config';

import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module.js';
import { AuthService } from '../modules/auth/auth.service.js';
import { UsersService } from '../modules/auth/users.service.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Interactive helper for creating the first admin account.
 *
 * Accounts are not created through the HTTP API on purpose: an open
 * "register" endpoint would let anyone take over the system. Run this once
 * after the database migration has been applied:
 *
 *   npm run user:create -- admin@charity.org 'Str0ngPassw0rd'
 */
async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const usersService = app.get(UsersService);
    const authService = app.get(AuthService);

    const args = process.argv.slice(2);
    const email = (args[0] ?? '').trim().toLowerCase();
    const password = args[1] ?? '';
    const providedPassword = args.length > 1;

    if (!email || !EMAIL_PATTERN.test(email)) {
      console.error('Usage: npm run user:create -- <email> <password>');
      console.error('The email must be a valid address.');
      process.exitCode = 1;
      return;
    }

    if (!providedPassword) {
      console.error('The password is required when running non-interactively.');
      process.exitCode = 1;
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      console.error(`The password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      process.exitCode = 1;
      return;
    }

    const existing = await usersService.findByEmail(email);
    if (existing) {
      console.error(`A user with the email ${email} already exists.`);
      process.exitCode = 1;
      return;
    }

    const passwordHash = await authService.hashPassword(password);
    const user = await usersService.create(email, passwordHash);

    console.log(`Created admin user ${user.email} (${user.id}).`);
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error('Failed to create the user:', error);
  process.exitCode = 1;
});
