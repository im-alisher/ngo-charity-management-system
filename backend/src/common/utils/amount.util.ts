import { Prisma } from '@prisma/client';

/**
 * Money is stored as `Decimal(14,2)` so totals stay exact in the database.
 * The HTTP API, however, speaks plain JSON numbers, so every value that leaves
 * a service is normalised here.
 */

export type NumericLike = Prisma.Decimal | number | string;

/** Converts a Prisma Decimal to a JSON-safe number, rounding to 2 decimals. */
export function toAmount(value: NumericLike | null | undefined): number {
  if (value === null || value === undefined) return 0;

  const amount = typeof value === 'number' ? value : Number(value.toString());
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
}

/** Coerces an aggregate result (which may be null) into a plain number. */
export function toAggregateAmount(value: NumericLike | null | undefined): number {
  return toAmount(value);
}
