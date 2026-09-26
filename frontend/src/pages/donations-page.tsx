import { Pencil, Plus, Receipt, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable, type TableColumn } from '@/components/ui/data-table';
import { EmptyState, ErrorState } from '@/components/ui/feedback';
import { PageHeader } from '@/components/ui/page-header';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { DonationFormModal } from '@/features/donations/components/donation-form-modal';
import { useDeleteDonationMutation, useDonationsQuery } from '@/features/donations/queries';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Donation, DonationListParams } from '@/types/api';

const DEFAULT_PAGE_SIZE = 10;

export function DonationsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());

  const [filters, setFilters] = useState<DonationListParams>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // The backend rejects an inverted range, so the pair is only sent when it is
  // actually valid rather than surfacing a server error on every keystroke.
  const isRangeValid = !from || !to || from <= to;

  const query = useDonationsQuery({
    ...filters,
    search: debouncedSearch || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Donation | null>(null);
  const [deleting, setDeleting] = useState<Donation | null>(null);

  const deleteMutation = useDeleteDonationMutation(() => setDeleting(null));

  const hasFilters = Boolean(debouncedSearch || from || to);

  const columns: TableColumn<Donation>[] = [
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
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      headerClassName: 'text-right',
      className: 'text-right',
      render: (donation) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing(donation);
              setIsFormOpen(true);
            }}
            aria-label={`Edit donation of ${formatCurrency(donation.amount)} from ${donation.donor.fullName}`}
            title="Edit donation"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleting(donation)}
            aria-label={`Delete donation of ${formatCurrency(donation.amount)} from ${donation.donor.fullName}`}
            title="Delete donation"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Donations"
        description="Every contribution recorded in the system."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Record donation
          </Button>
        }
      />

      <Card>
        <DataTable
          caption="Donations"
          columns={columns}
          rows={query.data?.data ?? []}
          rowKey={(donation) => donation.id}
          isLoading={query.isPending}
          toolbar={
            <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 lg:flex-row lg:items-end">
              <SearchInput
                value={search}
                onChange={(value) => {
                  setSearch(value);
                  setFilters((current) => ({ ...current, page: 1 }));
                }}
                placeholder="Search notes or donor"
                label="Search donations"
                className="lg:max-w-xs"
              />

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
                  From
                  <input
                    type="date"
                    value={from}
                    max={to || undefined}
                    onChange={(event) => {
                      setFrom(event.target.value);
                      setFilters((current) => ({ ...current, page: 1 }));
                    }}
                    className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-ink"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
                  To
                  <input
                    type="date"
                    value={to}
                    min={from || undefined}
                    onChange={(event) => {
                      setTo(event.target.value);
                      setFilters((current) => ({ ...current, page: 1 }));
                    }}
                    className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-ink"
                  />
                </label>
              </div>

              {hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setFrom('');
                    setTo('');
                    setFilters((current) => ({ ...current, page: 1 }));
                  }}
                  className="self-start text-sm font-medium text-ink-muted underline underline-offset-2 hover:text-ink lg:self-auto"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          }
          emptyState={
            <EmptyState
              title={hasFilters ? 'No donations match your filters' : 'No donations yet'}
              description={
                hasFilters
                  ? 'Try a different date range or search term.'
                  : 'Record a donation to start building donor histories.'
              }
              icon={<Receipt className="h-5 w-5" aria-hidden="true" />}
              action={
                hasFilters ? null : (
                  <Button
                    onClick={() => {
                      setEditing(null);
                      setIsFormOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Record donation
                  </Button>
                )
              }
            />
          }
        />

        {isRangeValid ? null : (
          <p className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            The “from” date must be on or before the “to” date.
          </p>
        )}

        {query.isError ? (
          <div className="p-4">
            <ErrorState error={query.error} onRetry={() => query.refetch()} />
          </div>
        ) : null}

        {query.data ? (
          <Pagination
            meta={query.data.meta}
            onPageChange={(next) => setFilters((current) => ({ ...current, page: next }))}
            onPageSizeChange={(nextSize) =>
              setFilters((current) => ({ ...current, page: 1, pageSize: nextSize }))
            }
            itemLabel="donations"
          />
        ) : null}
      </Card>

      <DonationFormModal
        isOpen={isFormOpen}
        donation={editing}
        onClose={() => {
          setIsFormOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        isOpen={deleting !== null}
        title="Delete donation"
        confirmLabel="Delete donation"
        isBusy={deleteMutation.isPending}
        message={
          <p>
            Delete the donation of{' '}
            <strong className="text-ink">{formatCurrency(deleting?.amount ?? 0)}</strong> from{' '}
            <strong className="text-ink">{deleting?.donor.fullName}</strong>? This cannot be undone.
          </p>
        }
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id);
        }}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
