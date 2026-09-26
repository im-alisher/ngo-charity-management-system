import type { BeneficiaryCategory, BeneficiaryStatus } from '@/types/api';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-US');

const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const mediumDateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

/** Formats a monetary amount, e.g. `1250.5` becomes `$1,250.50`. */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) {
    return currencyFormatter.format(0);
  }
  return currencyFormatter.format(amount);
}

/** Formats a count, e.g. `1234` becomes `1,234`. */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '0';
  return numberFormatter.format(value);
}

/**
 * Formats a date for display.
 *
 * Date-only values (`donationDate`, a `YYYY-MM-DD` filter) are parsed as UTC
 * so they do not shift a day in timezones behind UTC. Values that carry a real
 * time (created timestamps) are shown in the viewer's local time.
 */
export function formatDate(
  value: string | null | undefined,
  style: 'long' | 'medium' = 'medium',
): string {
  if (!value) return '—';

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = dateOnly ? new Date(`${value}T00:00:00Z`) : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const formatter = style === 'long' ? longDateFormatter : mediumDateFormatter;
  if (dateOnly) {
    // Render in UTC so the calendar day is exactly what was stored.
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: style === 'long' ? 'long' : 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  }

  return formatter.format(date);
}

/** Formats a timestamp as date and time in the viewer's local time. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/** Converts `FOOD` to `Food`; `INACTIVE` to `Inactive`. */
export function humanizeEnum(value: string): string {
  const lower = value.toLowerCase().replace(/_/g, ' ');
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export const CATEGORY_LABELS: Record<BeneficiaryCategory, string> = {
  FOOD: 'Food',
  EDUCATION: 'Education',
  MEDICAL: 'Medical',
};

export const STATUS_LABELS: Record<BeneficiaryStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

/** Formats a month key such as `2026-03` as `Mar 2026`. */
export function formatMonthLabel(month: string): string {
  const date = new Date(`${month}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return month;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Today as `YYYY-MM-DD`, for the default value of date inputs. */
export function todayIso(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

/** Current calendar year as a string, e.g. `2026`. */
export function currentYear(): string {
  return String(new Date().getFullYear());
}
