/**
 * Toast Notification Component
 * Shows temporary success/error messages
 * Note: Use useToast() from ToastContext, not from this file
 */

import { useEffect } from 'react';
import { ToastProps } from '../../types/components';

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-success' : 'bg-error';

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 z-50 flex justify-center animate-slideUp"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-md`}>
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-white hover:opacity-80 font-bold min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
