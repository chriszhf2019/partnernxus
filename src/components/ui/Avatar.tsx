import { cn } from '../../lib/utils';

const sizeClasses = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm' };

const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar = ({ src, alt = '', name, size = 'md', className }: AvatarProps) => {
  if (src) {
    return <img src={src} alt={alt || name || ''} className={cn('rounded-full object-cover ring-2 ring-white dark:ring-neutral-800', sizeClasses[size], className)} />;
  }
  if (name) {
    return <div className={cn('rounded-full bg-brand text-white flex items-center justify-center font-semibold', sizeClasses[size], className)} aria-label={name}>{getInitials(name)}</div>;
  }
  return <div className={cn('rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center', sizeClasses[size], className)} />;
};
