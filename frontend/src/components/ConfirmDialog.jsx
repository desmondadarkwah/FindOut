import React from 'react';
import { MdWarning } from 'react-icons/md';
import { IoClose } from 'react-icons/io5';

const ConfirmDialog = ({ dialog, onConfirm, onCancel }) => {
  if (!dialog) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9998]">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <MdWarning className="text-yellow-500" size={20} />
            <h3 className="text-white font-semibold text-base">
              {dialog.title || 'Are you sure?'}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-white transition">
            <IoClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-gray-400 text-sm leading-relaxed">
            {dialog.message || 'This action cannot be undone.'}
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-700">
          {/* Cancel */}
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm font-medium rounded-lg border border-gray-600 transition">
            {dialog.cancelText || 'Cancel'}
          </button>

          {/* Confirm */}
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 text-white text-sm font-medium rounded-lg transition ${
              dialog.confirmStyle === 'danger'
                ? 'bg-red-600 hover:bg-red-700 border border-red-500'
                : dialog.confirmStyle === 'warning'
                ? 'bg-yellow-600 hover:bg-yellow-700 border border-yellow-500'
                : 'bg-blue-600 hover:bg-blue-700 border border-blue-500'
            }`}>
            {dialog.confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;