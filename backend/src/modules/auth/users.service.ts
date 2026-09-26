import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { UserRole, type User } from '@prisma/client';
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
  async create(
    email: string,
    passwordHash: string,
    role: UserRole = UserRole.VIEWER,
  ): Promise<User> {
    const user = await this.prisma.user.create({
      data: { email: email.trim().toLowerCase(), password: passwordHash, role },
    });

    this.logger.log(`Created user ${user.email}`);
    return user;
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = await this.prisma.user.update({ where: { id }, data: { role } });
    this.logger.log(`Set ${user.email} to ${user.role}`);
    return user;
  }

  /** Refuses to remove the last admin, which would lock everyone out. */
  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return;

    if (user.role === UserRole.ADMIN) {
      const admins = await this.prisma.user.count({ where: { role: UserRole.ADMIN } });
      if (admins <= 1) {
        throw new BadRequestException(
          'This is the last administrator. Promote another account before deleting it.',
        );
      }
    }

    await this.prisma.user.delete({ where: { id } });
    this.logger.log(`Deleted user ${user.email}`);
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: { password: passwordHash } });
  }
}
