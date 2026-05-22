import { cn } from '../../lib/utils';

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-md', className)} />
);

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-7 w-32" />
    <Skeleton className="h-2 w-full" />
    <Skeleton className="h-16 w-full" />
    <div className="flex gap-4">
      <Skeleton className="h-9 flex-1" />
      <Skeleton className="h-9 flex-1" />
    </div>
  </div>
);
