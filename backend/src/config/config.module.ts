import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { configurations } from './configuration.js';
import { validateEnv } from './env.validation.js';

/**
 * Loads and validates environment variables once, at bootstrap.
 * `validateEnv` runs before any module is instantiated, so a misconfigured
 * environment aborts startup instead of failing on the first request.
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: configurations,
      validate: validateEnv,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
})
export class AppConfigModule {}
