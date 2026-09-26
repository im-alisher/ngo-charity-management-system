import 'dotenv/config';

import { defineConfig } from 'prisma/config';

/**
 * Prisma CLI configuration (Prisma ORM v7+).
 *
 * The connection string is read from DATABASE_URL. It is declared here rather
 * than in `prisma/schema.prisma` because Prisma 7 removed the `url` property
 * from the schema's datasource block.
 *
 * `prisma generate` does not need a database, so a missing DATABASE_URL must
 * not break the build. We warn instead of throwing, and let the commands that
 * genuinely require a live database fail on their own.
 */
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn(
    '[prisma] DATABASE_URL is not set. Commands that need a live database ' +
      '(migrate, db push, db seed, studio) will fail. `prisma generate` still works.',
  );
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl ?? '',
  },
});
