/**
 * Typed application configuration.
 *
 * Every value is read once, validated, and namespaced so that services can
 * inject `ConfigService` and pull a narrow, typed slice instead of touching
 * `process.env` all over the codebase.
 */
import type { JwtSignOptions } from '@nestjs/jwt';

/**
 * Token lifetime as understood by `jsonwebtoken`: a number of seconds, or a
 * time span such as `30m`, `12h`, `7d`.
 */
export type JwtExpiresIn = NonNullable<JwtSignOptions['expiresIn']>;

export type NodeEnv = 'development' | 'production' | 'test';

export interface AppConfig {
  nodeEnv: NodeEnv;
  isProduction: boolean;
  port: number;
  apiPrefix: string;
  database: {
    url: string;
  };
  cors: {
    origins: string[];
  };
}

export interface JwtConfig {
  secret: string;
  expiresIn: JwtExpiresIn;
}

export interface DatabaseConfig {
  url: string;
}
