import { Pencil, Plus, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable, type TableColumn } from '@/components/ui/data-table';
import { EmptyState, ErrorState } from '@/components/ui/feedback';
import { PageHeader } from '@/components/ui/page-header';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { BeneficiaryFormModal } from '@/features/beneficiaries/components/beneficiary-form-modal';
import {
  useBeneficiariesQuery,
  useDeleteBeneficiaryMutation,
} from '@/features/beneficiaries/queries';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { CATEGORY_LABELS, formatDate, STATUS_LABELS } from '@/lib/format';
import {
  BENEFICIARY_CATEGORIES,
  BENEFICIARY_STATUSES,
  type Beneficiary,
  type BeneficiaryCategory,
  type BeneficiaryListParams,
  type BeneficiaryStatus,
} from '@/types/api';

const DEFAULT_PAGE_SIZE = 10;

const ALL = 'ALL';

export function BeneficiariesPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());

  const [category, setCategory] = useState<BeneficiaryCategory | typeof ALL>(ALL);
  const [status, setStatus] = useState<BeneficiaryStatus | typeof ALL>(ALL);

  const [filters, setFilters] = useState<BeneficiaryListParams>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const query = useBeneficiariesQuery({
    ...filters,
    search: debouncedSearch || undefined,
    category: category === ALL ? undefined : category,
    status: status === ALL ? undefined : status,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Beneficiary | null>(null);
  const [deleting, setDeleting] = useState<Beneficiary | null>(null);

  const deleteMutation = useDeleteBeneficiaryMutation(() => setDeleting(null));

  const hasFilters = Boolean(debouncedSearch) || category !== ALL || status !== ALL;

  const columns: TableColumn<Beneficiary>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (beneficiary) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{beneficiary.fullName}</p>
          {beneficiary.phone ? (
            <p className="truncate text-sm text-ink-subtle">{beneficiary.phone}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      mobileLabel: 'Category',
      render: (beneficiary) => <Badge tone="info">{CATEGORY_LABELS[beneficiary.category]}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      mobileLabel: 'Status',
      render: (beneficiary) => (
        <Badge tone={beneficiary.status === 'ACTIVE' ? 'success' : 'neutral'}>
          {STATUS_LABELS[beneficiary.status]}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Added',
      mobileLabel: 'Added',
      render: (beneficiary) => (
        <span className="text-ink-muted">{formatDate(beneficiary.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      headerClassName: 'text-right',
      className: 'text-right',
      render: (beneficiary) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing(beneficiary);
              setIsFormOpen(true);
            }}
            aria-label={`Edit ${beneficiary.fullName}`}
            title="Edit beneficiary"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleting(beneficiary)}
            aria-label={`Delete ${beneficiary.fullName}`}
            title="Delete beneficiary"
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
        title="Beneficiaries"
        description="People and families receiving support from the organisation."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New beneficiary
          </Button>
        }
      />

      <Card>
        <DataTable
          caption="Beneficiaries"
          columns={columns}
          rows={query.data?.data ?? []}
          rowKey={(beneficiary) => beneficiary.id}
          isLoading={query.isPending}
          toolbar={
            <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 sm:flex-row sm:items-center">
              <SearchInput
                value={search}
                onChange={(value) => {
                  setSearch(value);
                  setFilters((current) => ({ ...current, page: 1 }));
                }}
                placeholder="Search by name or phone"
                label="Search beneficiaries"
                className="sm:max-w-xs"
              />

              <div className="flex flex-col gap-3 sm:flex-row">
                <Select
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value as BeneficiaryCategory | typeof ALL);
                    setFilters((current) => ({ ...current, page: 1 }));
                  }}
                  aria-label="Filter by category"
                  className="sm:w-40"
                >
                  <option value={ALL}>All categories</option>
                  {BENEFICIARY_CATEGORIES.map((value) => (
                    <option key={value} value={value}>
                      {CATEGORY_LABELS[value]}
                    </option>
                  ))}
                </Select>

                <Select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as BeneficiaryStatus | typeof ALL);
                    setFilters((current) => ({ ...current, page: 1 }));
                  }}
                  aria-label="Filter by status"
                  className="sm:w-36"
                >
                  <option value={ALL}>All statuses</option>
                  {BENEFICIARY_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {STATUS_LABELS[value]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          }
          emptyState={
            <EmptyState
              title={hasFilters ? 'No beneficiaries match your filters' : 'No beneficiaries yet'}
              description={
                hasFilters
                  ? 'Try widening the search or clearing the filters.'
                  : 'Add your first beneficiary to start tracking support.'
              }
              icon={<UserPlus className="h-5 w-5" aria-hidden="true" />}
              action={
                hasFilters ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch('');
                      setCategory(ALL);
                      setStatus(ALL);
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setEditing(null);
                      setIsFormOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    New beneficiary
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
            itemLabel="beneficiaries"
          />
        ) : null}
      </Card>

      <BeneficiaryFormModal
        isOpen={isFormOpen}
        beneficiary={editing}
        onClose={() => {
          setIsFormOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        isOpen={deleting !== null}
        title="Delete beneficiary"
        confirmLabel="Delete beneficiary"
        isBusy={deleteMutation.isPending}
        message={
          <p>
            Delete <strong className="text-ink">{deleting?.fullName}</strong>? This removes the
            beneficiary record. This cannot be undone.
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
