import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import type { JwtConfig } from '../../config/config.types.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { AuthController } from './auth.controller.js';
import { UsersController } from './users.controller.js';
import { AuthService } from './auth.service.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwt = configService.getOrThrow<JwtConfig>('jwt');
        return {
          secret: jwt.secret,
          signOptions: { expiresIn: jwt.expiresIn },
        };
      },
    }),
    // Baseline limit for the whole API. Expensive endpoints such as login
    // tighten it further with @Throttle().
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 300 }]),
  ],
  controllers: [AuthController, UsersController],
  providers: [
    AuthService,
    UsersService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Order matters: RolesGuard reads the user that JwtAuthGuard attached.
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [UsersService, AuthService],
})
export class AuthModule {}
