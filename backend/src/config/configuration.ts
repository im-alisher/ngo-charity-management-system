import { registerAs } from '@nestjs/config';

import type { AppConfig, JwtConfig } from './config.types.js';
import { parseOrigins } from './env.validation.js';

export const appConfig = registerAs('app', (): AppConfig => ({
  nodeEnv: (process.env.NODE_ENV ?? 'development') as AppConfig['nodeEnv'],
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 3000),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  cors: {
    origins: parseOrigins(process.env.CORS_ORIGIN),
  },
}));

export const jwtConfig = registerAs('jwt', (): JwtConfig => ({
  secret: process.env.JWT_SECRET ?? '',
  expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
}));

export const configurations = [appConfig, jwtConfig];
