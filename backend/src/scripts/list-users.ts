import 'dotenv/config';

import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module.js';
import { UsersService } from '../modules/auth/users.service.js';

/** Lists the admin accounts that can sign in. Never prints password hashes. */
async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const users = await app.get(UsersService).list();

    if (users.length === 0) {
      console.log('No users yet. Create the first admin with:');
      console.log("  npm run user:create -- admin@charity.org 'Str0ngPassw0rd'");
      return;
    }

    console.log(`${users.length} user(s):`);
    for (const user of users) {
      console.log(`  ${user.email}  created ${user.createdAt.toISOString()}  (${user.id})`);
    }
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error('Failed to list users:', error);
  process.exitCode = 1;
});
