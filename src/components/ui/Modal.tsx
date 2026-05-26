import { useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal = ({ open, onClose, children, title, description, size = 'md', className }: ModalProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab' && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first) return;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true"
      />
      <div
        ref={contentRef}
        role="dialog" aria-modal="true" aria-label={title}
        className={cn(
          'relative bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full p-6 overflow-auto max-h-[85vh] border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150',
          sizeClasses[size], className,
        )}
      >
        {title ? (
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h2>
              {description && <p className="text-sm text-neutral-500 mt-1">{description}</p>}
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" aria-label="Close">
              <X className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
        ) : (
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" aria-label="Close">
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};
