import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

export const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const [dialogResolve, setDialogResolve] = useState(null);

  // ─────────────────────────────────────────
  // TOAST FUNCTIONS
  // ─────────────────────────────────────────
  const addToast = useCallback((type, message, title = '', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message, title, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Shorthand helpers
  const toast = {
    success: (message, title = 'Success') => addToast('success', message, title),
    error: (message, title = 'Error') => addToast('error', message, title),
    info: (message, title = '') => addToast('info', message, title),
    warning: (message, title = 'Warning') => addToast('warning', message, title),
  };

  // ─────────────────────────────────────────
  // CONFIRM DIALOG FUNCTION
  // ─────────────────────────────────────────
  const confirm = useCallback(({
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmStyle = 'danger' // 'danger' | 'warning' | 'primary'
  }) => {
    return new Promise((resolve) => {
      setDialog({ title, message, confirmText, cancelText, confirmStyle });
      setDialogResolve(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    if (dialogResolve) dialogResolve(true);
    setDialog(null);
    setDialogResolve(null);
  };

  const handleCancel = () => {
    if (dialogResolve) dialogResolve(false);
    setDialog(null);
    setDialogResolve(null);
  };

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Confirm Dialog */}
      <ConfirmDialog
        dialog={dialog}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ToastContext.Provider>
  );
};

export default ToastProvider;