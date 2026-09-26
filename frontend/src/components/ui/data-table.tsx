import { cn } from '@/lib/cn';

export interface TableColumn<T> {
  /** Stable key; also the header label when `header` is omitted. */
  key: string;
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
  /** Extra classes for the cell, e.g. `text-right` for numbers. */
  className?: string;
  headerClassName?: string;
  /**
   * Label shown instead of the header on narrow screens, where each row
   * becomes a stacked card and the column header is not visible.
   */
  mobileLabel?: string;
}

export interface DataTableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption: string;
  /** Number of placeholder rows rendered while loading. */
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  /** Renders under the header row, e.g. a toolbar with filters. */
  toolbar?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  isLoading = false,
  emptyState,
  toolbar,
}: DataTableProps<T>) {
  if (!isLoading && rows.length === 0 && emptyState) {
    return (
      <div>
        {toolbar}
        {emptyState}
      </div>
    );
  }

  return (
    <div>
      {toolbar}

      {/* Desktop: a real table. Mobile: each row becomes a labelled card, so
          the data stays readable without horizontal scrolling. */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>

          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold tracking-wide text-ink-muted uppercase',
                    column.headerClassName ?? column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100">
            {isLoading
              ? Array.from({ length: 5 }, (_, rowIndex) => (
                  <tr key={`skeleton-${rowIndex}`}>
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3.5">
                        <span className="skeleton block h-4 w-full max-w-32" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr key={rowKey(row)} className="transition-colors hover:bg-neutral-50">
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn('px-4 py-3.5 align-middle', column.className)}
                      >
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-neutral-100 sm:hidden">
        <caption className="sr-only">{caption}</caption>

        {isLoading
          ? Array.from({ length: 5 }, (_, index) => (
              <li key={`skeleton-${index}`} className="space-y-2 p-4">
                <span className="skeleton block h-4 w-2/3" />
                <span className="skeleton block h-3 w-1/3" />
              </li>
            ))
          : rows.map((row) => (
              <li key={rowKey(row)} className="space-y-2.5 p-4">
                {columns.map((column, columnIndex) => (
                  <div
                    key={column.key}
                    className={cn(
                      'flex items-start justify-between gap-4',
                      // The first column is the record's identity, so it is
                      // shown full width as the card heading.
                      columnIndex === 0 && 'flex-col items-stretch gap-1',
                    )}
                  >
                    {columnIndex === 0 ? null : (
                      <span className="shrink-0 text-xs font-medium tracking-wide text-ink-subtle uppercase">
                        {column.mobileLabel ?? column.key}
                      </span>
                    )}
                    <div className={cn('min-w-0 text-right', columnIndex === 0 && 'text-left')}>
                      {column.render(row)}
                    </div>
                  </div>
                ))}
              </li>
            ))}
      </ul>
    </div>
  );
}
