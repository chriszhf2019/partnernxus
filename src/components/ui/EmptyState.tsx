import { PackageOpen } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({ icon, title, description, actionLabel, onAction, className }: EmptyStateProps) => (
  <div className={cn('flex flex-col items-center justify-center py-16 px-8 text-center', className)}>
    <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center mb-4">
      {icon || <PackageOpen className="w-7 h-7 text-neutral-400" />}
    </div>
    <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">{title}</h3>
    {description && <p className="text-sm text-neutral-500 mb-6 max-w-sm">{description}</p>}
    {actionLabel && onAction && (
      <Button variant="primary" size="sm" onClick={onAction}>{actionLabel}</Button>
    )}
  </div>
);
