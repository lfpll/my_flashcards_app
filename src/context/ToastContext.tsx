/**
 * Global Toast Context
 * Provides toast notifications throughout the app
 * Eliminates need to render <Toast /> in every component
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast from '../components/ui/Toast';
import { ToastContextType, ToastState } from '../types/contexts';
import { ToastType } from '../types/models';

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const value: ToastContextType = { showToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

