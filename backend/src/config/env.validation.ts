import type { NodeEnv } from './config.types.js';

export interface RawEnv {
  NODE_ENV?: string;
  PORT?: string;
  API_PREFIX?: string;
  DATABASE_URL?: string;
  CORS_ORIGIN?: string;
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
}

export type ValidatedEnv = Required<Omit<RawEnv, never>>;

const NODE_ENVS: NodeEnv[] = ['development', 'production', 'test'];

const DEFAULTS = {
  PORT: 3000,
  API_PREFIX: 'api',
  JWT_EXPIRES_IN: '1d',
  CORS_ORIGIN: 'http://localhost:5173',
  NODE_ENV: 'development' as NodeEnv,
};

/** Minimum secret length enforced in production. */
const MIN_SECRET_LENGTH = 32;

function parsePort(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === '') return DEFAULTS.PORT;

  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be an integer between 1 and 65535, received "${raw}".`);
  }
  return port;
}

function parseOrigins(raw: string | undefined): string[] {
  return (raw ?? DEFAULTS.CORS_ORIGIN)
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

function parseNodeEnv(raw: string | undefined): NodeEnv {
  if (raw === undefined || raw.trim() === '') return DEFAULTS.NODE_ENV;

  if (!NODE_ENVS.includes(raw as NodeEnv)) {
    throw new Error(`NODE_ENV must be one of ${NODE_ENVS.join(', ')}, received "${raw}".`);
  }
  return raw as NodeEnv;
}

/**
 * Validates `process.env` and returns a fully populated, immutable config.
 *
 * Fails fast with every problem listed at once, so a misconfigured deployment
 * is fixed in one pass instead of one variable per restart.
 */
export function validateEnv(source: RawEnv = process.env): Required<RawEnv> {
  const errors: string[] = [];

  const nodeEnv = (() => {
    try {
      return parseNodeEnv(source.NODE_ENV);
    } catch (error) {
      errors.push((error as Error).message);
      return DEFAULTS.NODE_ENV;
    }
  })();

  const port = (() => {
    try {
      return parsePort(source.PORT);
    } catch (error) {
      errors.push((error as Error).message);
      return DEFAULTS.PORT;
    }
  })();

  const databaseUrl = source.DATABASE_URL?.trim() ?? '';
  if (!databaseUrl) {
    errors.push('DATABASE_URL is required (e.g. postgresql://user:pass@localhost:5432/charity).');
  }

  const jwtSecret = source.JWT_SECRET?.trim() ?? '';
  if (!jwtSecret) {
    errors.push('JWT_SECRET is required. Use a long random string, e.g. openssl rand -base64 48.');
  } else if (nodeEnv === 'production' && jwtSecret.length < MIN_SECRET_LENGTH) {
    errors.push(`JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters in production.`);
  }

  const jwtExpiresIn = source.JWT_EXPIRES_IN?.trim() || DEFAULTS.JWT_EXPIRES_IN;
  const apiPrefix = source.API_PREFIX?.trim() || DEFAULTS.API_PREFIX;
  const corsOrigin = source.CORS_ORIGIN?.trim() || DEFAULTS.CORS_ORIGIN;

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n - ${errors.join('\n - ')}`);
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: String(port),
    API_PREFIX: apiPrefix,
    DATABASE_URL: databaseUrl,
    CORS_ORIGIN: corsOrigin,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: jwtExpiresIn,
  };
}

export { parseOrigins };
