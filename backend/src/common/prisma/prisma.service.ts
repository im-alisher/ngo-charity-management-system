import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma client wrapper.
 *
 * Prisma 7 talks to PostgreSQL through a driver adapter rather than an
 * embedded engine, so the connection string arrives from configuration and is
 * handed to `@prisma/adapter-pg`.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const connectionString = configService.get<string>('app.database.url');

    if (!connectionString) {
      throw new Error(
        'DATABASE_URL is not configured. Copy backend/.env.example to backend/.env and set it.',
      );
    }

    super({
      adapter: new PrismaPg({
        connectionString,
        // A hosted database is often several time zones away, so the very first
        // connection also pays a TLS handshake. Without these generous limits a
        // cold start fails with "Unable to start a transaction in the given
        // time" even though the database is perfectly healthy.
        connectionTimeoutMillis: 30_000,
        max: 10,
      }),
      transactionOptions: {
        maxWait: 20_000,
        timeout: 30_000,
      },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();

    // Establish a real pooled connection now, so the first user request does
    // not pay the round-trip cost of opening one. A failure here is not fatal:
    // the exception filter reports an unreachable database per request.
    try {
      await this.$queryRaw`SELECT 1`;
      this.logger.log('Connected to PostgreSQL');
    } catch {
      this.logger.warn('Connected but the first query failed; the database may be unreachable.');
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Disconnected from PostgreSQL');
  }
}
