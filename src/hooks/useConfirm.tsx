/**
 * useConfirm Hook
 * Simplifies confirmation dialog pattern
 * Eliminates boilerplate in components
 */

import { useState } from 'react';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export function useConfirm() {
  const [config, setConfig] = useState(null);

  const confirm = (title, message, onConfirm, options = {}) => {
    setConfig({
      title,
      message,
      onConfirm,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      danger: options.danger !== undefined ? options.danger : true,
    });
  };

  const handleConfirm = () => {
    if (config?.onConfirm) {
      config.onConfirm();
    }
    setConfig(null);
  };

  const handleCancel = () => {
    setConfig(null);
  };

  const ConfirmationDialog = () => (
    <ConfirmDialog
      isOpen={!!config}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      title={config?.title || ''}
      message={config?.message || ''}
      confirmText={config?.confirmText}
      cancelText={config?.cancelText}
      danger={config?.danger}
    />
  );

  return { confirm, ConfirmationDialog };
}

