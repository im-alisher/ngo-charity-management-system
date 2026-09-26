import { History, Pencil, Plus, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Card } from '@/components/ui/card';
import { DataTable, type TableColumn } from '@/components/ui/data-table';
import { EmptyState, ErrorState } from '@/components/ui/feedback';
import { PageHeader } from '@/components/ui/page-header';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { DonorFormModal } from '@/features/donors/components/donor-form-modal';
import { DonorHistoryModal } from '@/features/donors/components/donor-history-modal';
import { useDeleteDonorMutation, useDonorsQuery } from '@/features/donors/queries';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { formatDate } from '@/lib/format';
import type { Donor, DonorListParams } from '@/types/api';

const DEFAULT_PAGE_SIZE = 10;

export function DonorsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());

  // Search and pagination live in one filter object, so a single request key
  // describes exactly what the table is showing.
  const [filters, setFilters] = useState<DonorListParams>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const query = useDonorsQuery({
    ...filters,
    search: debouncedSearch || undefined,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [historyDonor, setHistoryDonor] = useState<Donor | null>(null);
  const [deletingDonor, setDeletingDonor] = useState<Donor | null>(null);

  function openCreate() {
    setEditingDonor(null);
    setIsFormOpen(true);
  }

  function openEdit(donor: Donor) {
    setEditingDonor(donor);
    setIsFormOpen(true);
  }

  const deleteMutation = useDeleteDonorMutation(() => setDeletingDonor(null));

  const columns: TableColumn<Donor>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (donor) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{donor.fullName}</p>
          {donor.email ? <p className="truncate text-sm text-ink-subtle">{donor.email}</p> : null}
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      mobileLabel: 'Phone',
      render: (donor) => <span className="text-ink-muted">{donor.phone ?? '—'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Added',
      mobileLabel: 'Added',
      render: (donor) => <span className="text-ink-muted">{formatDate(donor.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      headerClassName: 'text-right',
      className: 'text-right',
      render: (donor) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHistoryDonor(donor)}
            aria-label={`View donation history for ${donor.fullName}`}
            title="Donation history"
          >
            <History className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(donor)}
            aria-label={`Edit ${donor.fullName}`}
            title="Edit donor"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeletingDonor(donor)}
            aria-label={`Delete ${donor.fullName}`}
            title="Delete donor"
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
        title="Donors"
        description="Everyone who has contributed to the organisation."
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New donor
          </Button>
        }
      />

      <Card>
        <DataTable
          caption="Donors"
          columns={columns}
          rows={query.data?.data ?? []}
          rowKey={(donor) => donor.id}
          isLoading={query.isPending}
          toolbar={
            <div className="border-b border-neutral-200 p-4">
              <SearchInput
                value={search}
                onChange={(value) => {
                  setSearch(value);
                  setFilters((current) => ({ ...current, page: 1 }));
                }}
                placeholder="Search by name, email or phone"
                label="Search donors"
                className="sm:max-w-sm"
              />
            </div>
          }
          emptyState={
            <EmptyState
              title={search ? 'No donors match your search' : 'No donors yet'}
              description={
                search
                  ? 'Try a different name, email or phone number.'
                  : 'Add your first donor to start recording donations.'
              }
              icon={<UserPlus className="h-5 w-5" aria-hidden="true" />}
              action={
                search ? null : (
                  <Button onClick={openCreate}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    New donor
                  </Button>
                )
              }
            />
          }
        />

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
            itemLabel="donors"
          />
        ) : null}
      </Card>

      <DonorFormModal
        isOpen={isFormOpen}
        donor={editingDonor}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDonor(null);
        }}
      />

      <DonorHistoryModal donor={historyDonor} onClose={() => setHistoryDonor(null)} />

      <ConfirmDialog
        isOpen={deletingDonor !== null}
        title="Delete donor"
        confirmLabel="Delete donor"
        isBusy={deleteMutation.isPending}
        message={
          <>
            <p>
              Delete <strong className="text-ink">{deletingDonor?.fullName}</strong>? This also
              removes every donation recorded for them. This cannot be undone.
            </p>
          </>
        }
        onConfirm={() => {
          if (deletingDonor) deleteMutation.mutate(deletingDonor.id);
        }}
        onClose={() => setDeletingDonor(null)}
      />
    </div>
  );
}
