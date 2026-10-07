import React, { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { MdCheckCircle, MdError, MdInfo, MdWarning } from 'react-icons/md';

// Every toast uses the same theme-aware surface (so it follows the light/dark
// toggle). The type is shown by the icon shape plus a small accent colour,
// and the accents all come from the site's indigo/blue palette.
const TYPE_STYLES = {
  success: { Icon: MdCheckCircle, accent: '#6366f1' },
  info:    { Icon: MdInfo,        accent: '#3b82f6' },
  warning: { Icon: MdWarning,     accent: '#818cf8' },
  error:   { Icon: MdError,       accent: 'var(--text-primary)' },
};

const Toast = ({ toasts, removeToast }) => {
  return (
    // FIX: on phones `right-4` + `w-full` pushed the stack off the left edge of
    // the screen. It now sits 16px from both edges on mobile and becomes a
    // fixed-width stack in the top-right from the `sm` breakpoint up.
    // pointer-events-none lets clicks pass through the gaps between toasts.
    <div
      aria-live="polite"
      className="fixed top-4 left-4 right-4 sm:left-auto sm:w-full sm:max-w-sm z-[9999] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, removeToast }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration || 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id, toast.duration]);

  const { Icon, accent } = TYPE_STYLES[toast.type] || TYPE_STYLES.info;

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className="pointer-events-auto bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-2xl p-4 flex items-start gap-3 animate-slide-in w-full"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <Icon className="flex-shrink-0" size={20} style={{ color: accent }} />

      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-sm text-[var(--text-primary)]">{toast.title}</p>
        )}
        <p className="text-[var(--text-secondary)] text-sm mt-0.5 break-words">{toast.message}</p>
      </div>

      <button
        onClick={() => removeToast(toast.id)}
        aria-label="Dismiss notification"
        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0"
      >
        <IoClose size={16} />
      </button>
    </div>
  );
};

export default Toast;