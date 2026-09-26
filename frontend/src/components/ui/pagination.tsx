import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import type { PaginationMeta } from '@/types/api';

export interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** Labels the entity, e.g. "donations". */
  itemLabel?: string;
}

const PAGE_SIZES = [10, 20, 50];

export function Pagination({
  meta,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'records',
}: PaginationProps) {
  const { page, pageSize, total, totalPages, hasNextPage, hasPreviousPage } = meta;

  // The last page can shrink when records are deleted; clamp so the controls
  // never show a page number that no longer exists.
  const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);
  const firstRecord = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastRecord = Math.min(currentPage * pageSize, total);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-neutral-200 px-4 py-3',
        'sm:flex-row sm:items-center sm:justify-between',
      )}
    >
      <div className="flex items-center gap-4">
        <p className="text-sm text-ink-subtle">
          {total === 0 ? (
            `No ${itemLabel}`
          ) : (
            <>
              Showing <span className="font-medium text-ink">{formatNumber(firstRecord)}</span>–
              <span className="font-medium text-ink">{formatNumber(lastRecord)}</span> of{' '}
              <span className="font-medium text-ink">{formatNumber(total)}</span> {itemLabel}
            </>
          )}
        </p>

        <label className="flex items-center gap-2 text-sm text-ink-subtle">
          <span className="hidden sm:inline">Per page</span>
          <Select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            aria-label={`${itemLabel} per page`}
            className="h-8 w-20"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-ink-subtle">
          Page {formatNumber(currentPage)} of {formatNumber(Math.max(totalPages, 1))}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
