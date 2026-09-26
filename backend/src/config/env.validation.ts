import type { JwtExpiresIn } from './config.types.js';

export interface RawEnv {
  NODE_ENV?: string;
  PORT?: string;
  API_PREFIX?: string;
  DATABASE_URL?: string;
  CORS_ORIGIN?: string;
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
}

const NODE_ENVS = ['development', 'production', 'test'] as const;

const DEFAULTS = {
  PORT: 3000,
  API_PREFIX: 'api',
  JWT_EXPIRES_IN: '1d',
  CORS_ORIGIN: 'http://localhost:5173',
  NODE_ENV: 'development',
};

/** Minimum secret length enforced in production. */
const MIN_SECRET_LENGTH = 32;

/** `30m`, `12h`, `7d`, `2w` ... — the time-span form `jsonwebtoken` accepts. */
const DURATION_PATTERN = /^\d+(?:\.\d+)?(?:ms|s|m|h|d|w|y)$/i;

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

function parseNodeEnv(raw: string | undefined): (typeof NODE_ENVS)[number] {
  if (raw === undefined || raw.trim() === '')
    return DEFAULTS.NODE_ENV as (typeof NODE_ENVS)[number];

  if (!NODE_ENVS.includes(raw as (typeof NODE_ENVS)[number])) {
    throw new Error(`NODE_ENV must be one of ${NODE_ENVS.join(', ')}, received "${raw}".`);
  }
  return raw as (typeof NODE_ENVS)[number];
}

/**
 * Validates a token lifetime and narrows it to the type `jsonwebtoken` expects.
 *
 * Doing the check here means no `as` cast is needed at the point of use, and a
 * typo in `JWT_EXPIRES_IN` fails at startup rather than on the first login.
 */
export function parseJwtExpiresIn(raw: string | undefined): JwtExpiresIn {
  const value = raw?.trim() || DEFAULTS.JWT_EXPIRES_IN;

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  if (!DURATION_PATTERN.test(value)) {
    throw new Error(
      `JWT_EXPIRES_IN must be a number of seconds or a time span such as 30m, 12h or 7d, received "${value}".`,
    );
  }

  return value as JwtExpiresIn;
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
      return DEFAULTS.NODE_ENV as (typeof NODE_ENVS)[number];
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

  const jwtExpiresIn = (() => {
    try {
      return parseJwtExpiresIn(source.JWT_EXPIRES_IN);
    } catch (error) {
      errors.push((error as Error).message);
      return DEFAULTS.JWT_EXPIRES_IN;
    }
  })();

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
    JWT_EXPIRES_IN: String(jwtExpiresIn),
  };
}

export { parseOrigins };
