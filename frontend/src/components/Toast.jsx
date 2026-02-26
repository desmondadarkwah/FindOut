import React, { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { MdCheckCircle, MdError, MdInfo, MdWarning } from 'react-icons/md';

const Toast = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
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
  }, [toast.id]);

  const styles = {
    success: {
      container: 'bg-gray-900 border border-green-700',
      icon: <MdCheckCircle className="text-green-500 flex-shrink-0" size={20} />,
      title: 'text-green-400',
    },
    error: {
      container: 'bg-gray-900 border border-red-700',
      icon: <MdError className="text-red-500 flex-shrink-0" size={20} />,
      title: 'text-red-400',
    },
    info: {
      container: 'bg-gray-900 border border-blue-700',
      icon: <MdInfo className="text-blue-500 flex-shrink-0" size={20} />,
      title: 'text-blue-400',
    },
    warning: {
      container: 'bg-gray-900 border border-yellow-700',
      icon: <MdWarning className="text-yellow-500 flex-shrink-0" size={20} />,
      title: 'text-yellow-400',
    },
  };

  const style = styles[toast.type] || styles.info;

  return (
    <div className={`
      ${style.container}
      rounded-lg shadow-2xl p-4 flex items-start gap-3
      animate-slide-in w-full
    `}>
      {style.icon}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`font-semibold text-sm ${style.title}`}>{toast.title}</p>
        )}
        <p className="text-gray-300 text-sm mt-0.5">{toast.message}</p>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-gray-500 hover:text-white transition flex-shrink-0">
        <IoClose size={16} />
      </button>
    </div>
  );
};

export default Toast;