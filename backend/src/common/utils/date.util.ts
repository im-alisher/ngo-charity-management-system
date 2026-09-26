/**
 * Date helpers.
 *
 * The `donationDate` column is a PostgreSQL `DATE`, so it only ever holds a
 * calendar day. Exports render it as `YYYY-MM-DD` in UTC rather than as a full
 * timestamp, which would imply a time of day that is not stored.
 */

/** Formats a date as `YYYY-MM-DD` using its UTC calendar day. */
export function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Formats a date as an ISO 8601 timestamp, for fields that do store a time. */
export function toTimestamp(date: Date): string {
  return date.toISOString();
}
