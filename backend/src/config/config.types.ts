/**
 * Typed application configuration.
 *
 * Every value is read once, validated, and namespaced so that services can
 * inject `ConfigService` and pull a narrow, typed slice instead of touching
 * `process.env` all over the codebase.
 */

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
  expiresIn: string;
}

export interface DatabaseConfig {
  url: string;
}
