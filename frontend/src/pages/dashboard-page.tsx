import { HandHeart, Receipt, TrendingUp, Users } from 'lucide-react';

import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState, EmptyState } from '@/components/ui/feedback';
import { PageHeader } from '@/components/ui/page-header';
import { Spinner } from '@/components/ui/spinner';
import { useDashboardQuery } from '@/features/dashboard/api';
import { cn } from '@/lib/cn';
import {
  formatCurrency,
  formatDate,
  formatNumber,
  CATEGORY_LABELS,
  STATUS_LABELS,
} from '@/lib/format';
import type { BeneficiaryBreakdownItem } from '@/types/api';

export function DashboardPage() {
  const { data, isPending, isError, error, refetch } = useDashboardQuery();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A snapshot of donors, donations and beneficiaries."
        action={
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-medium text-ink-muted underline underline-offset-2 hover:text-ink"
          >
            Refresh
          </button>
        }
      />

      {isPending ? (
        <div className="flex min-h-64 items-center justify-center">
          <Spinner label="Loading dashboard" />
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total donations"
              value={formatCurrency(data.stats.totalDonationAmount)}
              hint={`${formatNumber(data.stats.totalDonations)} recorded`}
              icon={TrendingUp}
            />
            <StatCard
              label="Total donors"
              value={formatNumber(data.stats.totalDonors)}
              hint="All time"
              icon={HandHeart}
            />
            <StatCard
              label="Active beneficiaries"
              value={formatNumber(data.stats.activeBeneficiaries)}
              hint="Currently receiving aid"
              icon={Users}
            />
            <StatCard
              label="Average donation"
              value={formatCurrency(
                data.stats.totalDonations === 0
                  ? 0
                  : data.stats.totalDonationAmount / data.stats.totalDonations,
              )}
              hint="Per recorded donation"
              icon={Receipt}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent donations</CardTitle>
              </CardHeader>

              {data.recentDonations.length === 0 ? (
                <EmptyState
                  title="No donations yet"
                  description="Recorded donations will appear here."
                />
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {data.recentDonations.map((donation) => (
                    <li
                      key={donation.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{donation.donorName}</p>
                        <p className="text-sm text-ink-subtle">
                          {formatDate(donation.donationDate, 'long')}
                          {donation.notes ? ` · ${donation.notes}` : ''}
                        </p>
                      </div>

                      <p className="font-semibold text-ink tabular-nums">
                        {formatCurrency(donation.amount)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Beneficiaries</CardTitle>
              </CardHeader>

              {data.beneficiaryBreakdown.length === 0 ? (
                <EmptyState
                  title="No beneficiaries"
                  description="Beneficiary counts appear once records exist."
                />
              ) : (
                <CardBody className="space-y-4">
                  {groupByCategory(data.beneficiaryBreakdown).map((group) => (
                    <div key={group.category}>
                      <p className="mb-2 text-xs font-semibold tracking-wide text-ink-subtle uppercase">
                        {CATEGORY_LABELS[group.category]}
                      </p>

                      <ul className="space-y-1.5">
                        {group.rows.map((row) => (
                          <li
                            key={`${row.category}-${row.status}`}
                            className="flex items-center gap-3"
                          >
                            <span className="w-16 shrink-0 text-sm text-ink-muted">
                              {STATUS_LABELS[row.status]}
                            </span>
                            <span className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                              <span
                                className={cn(
                                  'block h-full rounded-full',
                                  row.status === 'ACTIVE' ? 'bg-brand-500' : 'bg-neutral-400',
                                )}
                                // Width is a share of the largest group, so the
                                // bars stay comparable within this card.
                                style={{
                                  width: `${group.max > 0 ? (row.count / group.max) * 100 : 0}%`,
                                }}
                              />
                            </span>
                            <span className="w-8 shrink-0 text-right text-sm font-medium text-ink tabular-nums">
                              {row.count}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardBody>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

interface CategoryGroup {
  category: BeneficiaryBreakdownItem['category'];
  rows: BeneficiaryBreakdownItem[];
  max: number;
}

/** Groups the flat breakdown by category, keeping a stable order per group. */
function groupByCategory(items: BeneficiaryBreakdownItem[]): CategoryGroup[] {
  const groups = new Map<BeneficiaryBreakdownItem['category'], BeneficiaryBreakdownItem[]>();

  for (const item of items) {
    const bucket = groups.get(item.category);
    if (bucket) bucket.push(item);
    else groups.set(item.category, [item]);
  }

  return [...groups.entries()].map(([category, rows]) => ({
    category,
    rows: rows.sort((a, b) => a.status.localeCompare(b.status)),
    max: Math.max(...rows.map((row) => row.count), 0),
  }));
}

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  icon: typeof Users;
}

function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-subtle">{label}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink tabular-nums">
              {value}
            </p>
            <p className="mt-1 text-xs text-ink-subtle">{hint}</p>
          </div>

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
