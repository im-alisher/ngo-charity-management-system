import { Download, TrendingUp, Users, Wallet, BarChart3 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type TableColumn } from '@/components/ui/data-table';
import { EmptyState, ErrorState } from '@/components/ui/feedback';
import { toMessage } from '@/lib/error-message';
import { PageHeader } from '@/components/ui/page-header';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/context/toast-store';
import {
  useDonationReportQuery,
  useExportDonationsMutation,
  useReportDonationListQuery,
} from '@/features/reports/queries';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/cn';
import {
  currentYear,
  formatCurrency,
  formatDate,
  formatMonthLabel,
  formatNumber,
} from '@/lib/format';
import type { Donation, MonthlyTotal } from '@/types/api';

const DEFAULT_PAGE_SIZE = 10;

export function ReportsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());

  // The report defaults to the current calendar year, which matches the
  // monthly chart the backend builds.
  const [year, setYear] = useState(currentYear());
  const [rangeMode, setRangeMode] = useState<'year' | 'custom'>('year');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [listFilters, setListFilters] = useState({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  const { notify } = useToast();

  const rangeParams = useMemo(() => {
    if (rangeMode === 'year') {
      return { year };
    }
    return { from: from || undefined, to: to || undefined };
  }, [rangeMode, year, from, to]);

  const isRangeValid = rangeMode === 'year' || !from || !to || from <= to;

  const reportParams = {
    ...rangeParams,
    search: debouncedSearch || undefined,
  };

  const report = useDonationReportQuery(reportParams);
  const listQuery = useReportDonationListQuery({ ...reportParams, ...listFilters });

  const exportMutation = useExportDonationsMutation();

  const years = buildYearOptions();

  const listColumns: TableColumn<Donation>[] = [
    {
      key: 'donor',
      header: 'Donor',
      render: (donation) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{donation.donor.fullName}</p>
          {donation.donor.email ? (
            <p className="truncate text-sm text-ink-subtle">{donation.donor.email}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      mobileLabel: 'Amount',
      className: 'font-semibold text-ink tabular-nums',
      render: (donation) => formatCurrency(donation.amount),
    },
    {
      key: 'donationDate',
      header: 'Date',
      mobileLabel: 'Date',
      render: (donation) => (
        <span className="text-ink-muted">{formatDate(donation.donationDate)}</span>
      ),
    },
    {
      key: 'notes',
      header: 'Notes',
      mobileLabel: 'Notes',
      render: (donation) => (
        <span className="line-clamp-2 text-ink-muted">{donation.notes ?? '—'}</span>
      ),
    },
  ];

  async function handleExport() {
    try {
      await exportMutation.mutateAsync({ ...rangeParams, search: debouncedSearch || undefined });
      notify({
        tone: 'success',
        title: 'Export ready',
        description: 'The CSV file was downloaded.',
      });
    } catch (error) {
      notify({ tone: 'error', title: 'Export failed', description: toMessage(error) });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Summarise donations over a period and export the underlying records."
        action={
          <Button
            onClick={handleExport}
            isLoading={exportMutation.isPending}
            disabled={!isRangeValid}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </Button>
        }
      />

      <Card>
        <CardBody className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="radio"
                name="range-mode"
                checked={rangeMode === 'year'}
                onChange={() => setRangeMode('year')}
                className="h-4 w-4 accent-brand-600"
              />
              Calendar year
            </label>

            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="radio"
                name="range-mode"
                checked={rangeMode === 'custom'}
                onChange={() => setRangeMode('custom')}
                className="h-4 w-4 accent-brand-600"
              />
              Custom range
            </label>
          </div>

          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
            {rangeMode === 'year' ? (
              <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
                Year
                <select
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-ink sm:w-32"
                >
                  {years.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <>
                <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
                  From
                  <input
                    type="date"
                    value={from}
                    max={to || undefined}
                    onChange={(event) => setFrom(event.target.value)}
                    className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-ink"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
                  To
                  <input
                    type="date"
                    value={to}
                    min={from || undefined}
                    onChange={(event) => setTo(event.target.value)}
                    className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-ink"
                  />
                </label>
              </>
            )}

            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setListFilters((current) => ({ ...current, page: 1 }));
              }}
              placeholder="Search donors or notes"
              label="Search donations"
              className="sm:max-w-xs"
            />
          </div>
        </CardBody>

        {isRangeValid ? null : (
          <p className="border-t border-red-200 bg-red-50 px-5 py-2 text-sm text-red-700">
            The “from” date must be on or before the “to” date.
          </p>
        )}
      </Card>

      {report.isPending ? (
        <div className="flex min-h-48 items-center justify-center">
          <Spinner label="Loading report" />
        </div>
      ) : report.isError ? (
        <ErrorState error={report.error} onRetry={() => report.refetch()} />
      ) : report.data ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total raised"
              value={formatCurrency(report.data.summary.totalAmount)}
              icon={Wallet}
            />
            <SummaryCard
              label="Donations"
              value={formatNumber(report.data.summary.totalDonations)}
              icon={TrendingUp}
            />
            <SummaryCard
              label="Average donation"
              value={formatCurrency(report.data.summary.averageAmount)}
              icon={BarChart3}
            />
            <SummaryCard
              label="Unique donors"
              value={formatNumber(report.data.summary.uniqueDonors)}
              icon={Users}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly totals</CardTitle>
              </CardHeader>

              {report.data.monthlyTotals.length === 0 ? (
                <EmptyState
                  title="No donations in this period"
                  description="Choose a different period to see monthly totals."
                />
              ) : (
                <CardBody>
                  <MonthlyChart months={report.data.monthlyTotals} />
                </CardBody>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top donors</CardTitle>
              </CardHeader>

              {report.data.topDonors.length === 0 ? (
                <EmptyState title="No donors in this period" />
              ) : (
                <CardBody className="space-y-3">
                  {report.data.topDonors.map((donor, index) => {
                    const max = report.data?.topDonors[0]?.totalAmount ?? 0;

                    return (
                      <div key={donor.donorId} className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-ink-muted">
                          {index + 1}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{donor.donorName}</p>
                          <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-neutral-100">
                            <span
                              className={cn(
                                'block h-full rounded-full',
                                index === 0 ? 'bg-brand-600' : 'bg-brand-300',
                              )}
                              style={{
                                width: `${max > 0 ? (donor.totalAmount / max) * 100 : 0}%`,
                              }}
                            />
                          </span>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-ink tabular-nums">
                            {formatCurrency(donor.totalAmount)}
                          </p>
                          <p className="text-xs text-ink-subtle">
                            {formatNumber(donor.totalDonations)}{' '}
                            {donor.totalDonations === 1 ? 'gift' : 'gifts'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardBody>
              )}
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Donations in this period</CardTitle>
            </CardHeader>

            <DataTable
              caption="Donations in the selected period"
              columns={listColumns}
              rows={listQuery.data?.data ?? []}
              rowKey={(donation) => donation.id}
              isLoading={listQuery.isPending}
              emptyState={
                <EmptyState
                  title="No donations in this period"
                  description="Adjust the period or search to see donations."
                />
              }
            />

            {listQuery.isError ? (
              <div className="p-4">
                <ErrorState error={listQuery.error} onRetry={() => listQuery.refetch()} />
              </div>
            ) : null}

            {listQuery.data ? (
              <Pagination
                meta={listQuery.data.meta}
                onPageChange={(next) => setListFilters((current) => ({ ...current, page: next }))}
                onPageSizeChange={(nextSize) =>
                  setListFilters((current) => ({ ...current, page: 1, pageSize: nextSize }))
                }
                itemLabel="donations"
              />
            ) : null}
          </Card>
        </>
      ) : null}
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  icon: typeof Wallet;
}

function SummaryCard({ label, value, icon: Icon }: SummaryCardProps) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-subtle">{label}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink tabular-nums">
              {value}
            </p>
          </div>

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
        </div>
      </CardBody>
    </Card>
  );
}

interface MonthlyChartProps {
  months: MonthlyTotal[];
}

/**
 * Renders monthly totals as a bar chart.
 *
 * Built from plain divs rather than a charting library: the dataset is a
 * dozen bars, so this avoids a dependency and keeps full control of the
 * neutral, accessible styling. Each bar exposes a label and value to
 * assistive technology through its title and hidden text.
 */
function MonthlyChart({ months }: MonthlyChartProps) {
  const max = Math.max(...months.map((month) => month.totalAmount), 0);

  return (
    <div>
      <div className="flex h-48 items-end gap-1.5 sm:gap-3">
        {months.map((month) => {
          const height = max > 0 ? (month.totalAmount / max) * 100 : 0;

          return (
            <div
              key={month.month}
              className="group flex h-full min-w-0 flex-1 flex-col justify-end"
            >
              <div
                className="relative w-full rounded-t bg-brand-500 transition-colors hover:bg-brand-600"
                style={{ height: `${Math.max(height, month.totalAmount > 0 ? 2 : 0)}%` }}
                title={`${formatMonthLabel(month.month)}: ${formatCurrency(month.totalAmount)}`}
              >
                <span className="sr-only">
                  {formatMonthLabel(month.month)}: {formatCurrency(month.totalAmount)} across{' '}
                  {month.totalDonations} donations
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex gap-1.5 border-t border-neutral-200 pt-2 sm:gap-3">
        {months.map((month) => (
          <p
            key={month.month}
            className="min-w-0 flex-1 truncate text-center text-xs text-ink-subtle"
            title={formatMonthLabel(month.month)}
          >
            {month.label}
          </p>
        ))}
      </div>

      {months.length > 0 && months.some((month) => month.totalAmount > 0) ? (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-subtle">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
          Peak month:{' '}
          <span className="font-medium text-ink">
            {formatMonthLabel(
              months.reduce((best, month) => (month.totalAmount > best.totalAmount ? month : best))
                .month,
            )}
          </span>
        </p>
      ) : null}
    </div>
  );
}

/** Offers the current year plus the four years before it. */
function buildYearOptions(): string[] {
  const current = Number(currentYear());
  return Array.from({ length: 5 }, (_, index) => String(current - index));
}
