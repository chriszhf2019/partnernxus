import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
}

export const ConfirmDialog = ({
  open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'default', loading,
}: ConfirmDialogProps) => (
  <Modal open={open} onClose={onClose} size="sm">
    <div className="text-center space-y-5">
      {variant === 'danger' && (
        <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
      )}
      <div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
      <div className="flex gap-3 justify-center">
        <Button variant="secondary" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
        <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </div>
  </Modal>
);
