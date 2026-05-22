import { cn } from '../../lib/utils';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function Table<T extends { id: string }>({
  columns, data, loading, emptyTitle = 'No data', emptyDescription = 'No records found.', onRowClick, className,
}: TableProps<T>) {
  if (loading) {
    return <div className={cn('space-y-2', className)}>{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  }
  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            {columns.map((col) => (
              <th key={col.key} className={cn('px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}
              onClick={() => onRowClick?.(item)}
              className={cn('border-b border-neutral-100 dark:border-neutral-800/50 transition-colors', onRowClick && 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50')}>
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3', col.className)}>
                  {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
