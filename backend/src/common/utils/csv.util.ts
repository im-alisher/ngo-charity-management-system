/**
 * Helpers for streaming CSV downloads.
 *
 * Values are quoted whenever they contain a delimiter, quote, or newline, and
 * embedded quotes are doubled per RFC 4180.
 */

const DELIMITER = ',';
const NEWLINE = '\r\n';

export type CsvColumn<T> = {
  header: string;
  value: (row: T) => unknown;
};

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return '';

  const text = value instanceof Date ? value.toISOString() : String(value);
  const needsQuotes = text.includes(DELIMITER) || text.includes('"') || /[\r\n]/.test(text);

  return needsQuotes ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Serialises rows into an RFC 4180 compliant CSV document. */
export function toCsv<T>(columns: CsvColumn<T>[], rows: T[]): string {
  const header = columns.map((column) => escapeCell(column.header)).join(DELIMITER);
  const body = rows.map((row) =>
    columns.map((column) => escapeCell(column.value(row))).join(DELIMITER),
  );

  return [header, ...body].join(NEWLINE) + NEWLINE;
}
