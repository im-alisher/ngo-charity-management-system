import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import type { User } from '@prisma/client';
import { toPublicUser } from './users.mapper.js';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Emails are stored lower-cased so lookups are case-insensitive. */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async list(): Promise<ReturnType<typeof toPublicUser>[]> {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    return users.map(toPublicUser);
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  /**
   * Creates a user with an already-hashed password.
   * Hashing belongs to the auth module, so callers pass the hash in.
   */
  async create(email: string, passwordHash: string): Promise<User> {
    const user = await this.prisma.user.create({
      data: { email: email.trim().toLowerCase(), password: passwordHash },
    });

    this.logger.log(`Created user ${user.email}`);
    return user;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: { password: passwordHash } });
  }
}
