/**
 * Confirmation Dialog Component
 * Used for destructive actions requiring user confirmation
 */

import Button from './Button';

export default function ConfirmDialog({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title, 
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
      onClick={onCancel}
    >
      <div 
        className="rounded-xl shadow-2xl max-w-md w-full p-6"
        style={{ backgroundColor: 'var(--card-color)', color: 'var(--text-color)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="mb-6" style={{ color: 'var(--text-dim-color)' }}>{message}</p>
        
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

