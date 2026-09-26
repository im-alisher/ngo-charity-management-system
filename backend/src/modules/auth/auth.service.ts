import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';

import type { JwtConfig } from '../../config/config.types.js';
import type { JwtPayload } from '../../common/interfaces/authenticated-user.interface.js';
import type { LoginDto } from './dto/login.dto.js';
import type { LoginResponseDto, UserResponseDto } from './dto/auth-response.dto.js';
import { UsersService } from './users.service.js';
import { toPublicUser } from './users.mapper.js';

/** Cost factor for bcrypt. 10 rounds is a sensible balance for an admin login. */
const SALT_ROUNDS = 10;

/**
 * A valid bcrypt hash of a random secret nobody knows. Comparing against it
 * always fails while still costing the same time as a real comparison, so a
 * login for an unknown email is not measurably faster than a wrong password.
 */
const DUMMY_PASSWORD_HASH = '$2b$10$2qCZEHPxURAZ/ngs1xmifuWE5n5PrdW4PBkfPPUhQCAKequSqTxly';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Verifies credentials and issues an access token.
   *
   * A missing user and a wrong password produce the exact same error, and the
   * comparison runs even when the user is unknown, so response timing does not
   * reveal which emails are registered.
   */
  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);

    const passwordMatches = user
      ? await compare(dto.password, user.password)
      : await this.compareAgainstDummyHash(dto.password);

    if (!user || !passwordMatches) {
      this.logger.warn(`Failed login attempt for ${email}`);
      throw new UnauthorizedException('Invalid email or password.');
    }

    // The role travels in the token so authorisation needs no extra query.
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    const jwt = this.configService.getOrThrow<JwtConfig>('jwt');

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: String(jwt.expiresIn),
      user: toPublicUser(user),
    };
  }

  /** Used by `GET /auth/me` to resolve the caller from a verified token. */
  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('The account linked to this token no longer exists.');
    }

    return toPublicUser(user);
  }

  async hashPassword(plainPassword: string): Promise<string> {
    return hash(plainPassword, SALT_ROUNDS);
  }

  /**
   * Burns roughly the same time as a real comparison so a login for an unknown
   * email is not measurably faster than a login with a wrong password.
   */
  private async compareAgainstDummyHash(plainPassword: string): Promise<boolean> {
    await compare(plainPassword, DUMMY_PASSWORD_HASH);
    return false;
  }
}
