import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { UserRole, type User } from '@prisma/client';
import { toPublicUser } from './users.mapper.js';
import type { UserResponseDto } from './dto/auth-response.dto.js';

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

  async list(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    return users.map(toPublicUser);
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  /**
   * Creates a user with an already-hashed password.
   * Hashing belongs to the auth module, so callers pass the hash in.
   *
   * Returns the public shape rather than the row: there is no global
   * serializer that would strip `password`, so handing a `User` to a
   * controller would put the hash in the HTTP response.
   */
  async create(
    email: string,
    passwordHash: string,
    role: UserRole = UserRole.VIEWER,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.create({
      data: { email: email.trim().toLowerCase(), password: passwordHash, role },
    });

    this.logger.log(`Created user ${user.email}`);
    return toPublicUser(user);
  }

  async updateRole(id: string, role: UserRole): Promise<UserResponseDto> {
    const current = await this.prisma.user.findUnique({ where: { id } });
    if (!current) {
      // Checked up front so a bad id is a 404, not an unhandled Prisma error.
      throw new NotFoundException(`No account with the id ${id}.`);
    }

    // Demoting the final admin is the same lockout as deleting one, so the
    // guard that protects `remove` has to protect this too.
    if (current.role === UserRole.ADMIN && role !== UserRole.ADMIN) {
      const admins = await this.prisma.user.count({ where: { role: UserRole.ADMIN } });
      if (admins <= 1) {
        throw new BadRequestException(
          'This is the last administrator. Promote another account to ADMIN before changing this one.',
        );
      }
    }

    const user = await this.prisma.user.update({ where: { id }, data: { role } });
    this.logger.log(`Set ${user.email} to ${user.role}`);
    return toPublicUser(user);
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
