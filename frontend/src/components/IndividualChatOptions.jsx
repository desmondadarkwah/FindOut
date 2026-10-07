import React, { useContext, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiBellOff, FiBell,
  FiTrash2,
  FiUserX,
  FiAlertTriangle,
  FiImage,
  FiUnlock,
} from "react-icons/fi";
import { ChatContext } from "../Context/ChatContext";
import axiosInstance from "../utils/axiosInstance";
import ReportModal from "./ReportModal";

const ModalPortal = ({ children, onBackdropClick }) => {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && onBackdropClick) onBackdropClick();
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
};

const Toast = ({ toast }) => {
  if (typeof document === "undefined" || !toast) return null;
  return createPortal(
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-xl text-sm font-medium shadow-2xl max-w-[90vw] text-center ${
        toast.type === "error"
          ? "bg-[#ef4444] text-white"
          : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)]"
      }`}
    >
      {toast.message}
    </div>,
    document.body
  );
};

const IndividualChatOptions = ({ otherUser, chatId, isBlockedChat }) => {
  const { setShowChatOptions, setSelectedChat, setChats } = useContext(ChatContext);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm]   = useState(false);
  const [showReportModal, setShowReportModal]     = useState(false);
  const [showMediaModal, setShowMediaModal]       = useState(false);
  const [isMuted, setIsMuted]                     = useState(false);
  const [loading, setLoading]                     = useState(false);
  const [toast, setToast]                         = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const closeAll = () => {
    setShowChatOptions(false);
    setShowDeleteConfirm(false);
    setShowBlockConfirm(false);
    setShowReportModal(false);
    setShowMediaModal(false);
  };

  // MUTE
  const handleMute = () => {
    setIsMuted(!isMuted);
    setShowChatOptions(false);
    showToast(isMuted ? 'Chat unmuted' : 'Chat muted');
  };

  // DELETE CHAT
  const handleDeleteChat = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/api/delete-chat', { chatId });
      setChats(prev => prev.filter(c => c._id !== chatId));
      setSelectedChat(null);
      closeAll();
      showToast('Chat deleted');
    } catch (e) {
      console.error('Delete chat error:', e);
      showToast('Failed to delete chat', 'error');
    } finally {
      setLoading(false);
    }
  };

  // BLOCK USER
  const handleBlockUser = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/api/block-user', { userIdToBlock: otherUser?._id });
      setChats(prev => prev.map(c =>
        c._id === chatId ? { ...c, isBlockedChat: true } : c
      ));
      setSelectedChat(prev => ({ ...prev, isBlockedChat: true }));
      closeAll();
      showToast('User blocked');
    } catch (e) {
      console.error('Block user error:', e);
      showToast('Failed to block user', 'error');
    } finally {
      setLoading(false);
    }
  };

  // UNBLOCK USER
  const handleUnblockUser = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/api/unblock-user', { userIdToUnblock: otherUser?._id });
      setChats(prev => prev.map(c =>
        c._id === chatId ? { ...c, isBlockedChat: false } : c
      ));
      setSelectedChat(prev => ({ ...prev, isBlockedChat: false }));
      closeAll();
      showToast('User unblocked');
    } catch (e) {
      console.error('Unblock error:', e);
      showToast('Failed to unblock user', 'error');
    } finally {
      setLoading(false);
    }
  };

  // BLOCKED MENU - only Unblock and Delete
  if (isBlockedChat) {
    return (
      <>
        <div className="absolute w-52 flex flex-col gap-1 right-0 top-10 bg-[var(--bg-secondary)] p-3 shadow-2xl rounded-xl border border-[var(--border)] z-50">
          <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-2 px-1 uppercase tracking-wider">
            Blocked User
          </h3>

          {/* Unblock → success */}
          <button
            onClick={handleUnblockUser}
            disabled={loading}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#22c55e]/10 transition text-[#4ade80] text-sm font-medium w-full text-left disabled:opacity-50"
          >
            <FiUnlock size={16} />
            {loading ? 'Unblocking...' : 'Unblock User'}
          </button>

          <div className="border-t border-[var(--border)] my-1" />

          {/* Delete Chat → error */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#ef4444]/10 transition text-[#f87171] text-sm font-medium w-full text-left"
          >
            <FiTrash2 size={16} />
            Delete Chat
          </button>
        </div>

        {/* Delete Confirm Modal */}
        {showDeleteConfirm && (
          <ModalPortal onBackdropClick={() => setShowDeleteConfirm(false)}>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 w-[90%] max-w-xs sm:max-w-sm shadow-2xl">
              <div className="w-12 h-12 bg-[#ef4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 size={22} className="text-[#f87171]" />
              </div>
              <h3 className="text-[var(--text-primary)] text-lg font-semibold mb-2 text-center">Delete Chat?</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6 text-center leading-relaxed">
                This will permanently delete this conversation for you.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-card-hover)] transition border border-[var(--border)] text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteChat}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-[#ef4444] text-white rounded-xl hover:bg-[#ef4444]/90 transition text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </ModalPortal>
        )}

        <Toast toast={toast} />
      </>
    );
  }

  // NORMAL MENU
  return (
    <>
      <div className="absolute w-56 flex flex-col gap-1 right-0 top-10 bg-[var(--bg-secondary)] p-3 shadow-2xl rounded-xl border border-[var(--border)] z-50">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-2 px-1 uppercase tracking-wider">
          Chat Options
        </h3>

        {/* Mute */}
        <button
          onClick={handleMute}
          className="flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg hover:bg-[var(--bg-card-hover)] transition text-[var(--text-secondary)] text-sm font-medium w-full text-left"
        >
          {isMuted
            ? <FiBell size={16} className="text-[#6366f1]" />
            : <FiBellOff size={16} className="text-[#6366f1]" />
          }
          {isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
        </button>

        {/* Media & Files */}
        <button
          onClick={() => setShowMediaModal(true)}
          className="flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg hover:bg-[var(--bg-card-hover)] transition text-[var(--text-secondary)] text-sm font-medium w-full text-left"
        >
          <FiImage size={16} className="text-[#6366f1]" />
          Media & Files
        </button>

        <div className="border-t border-[var(--border)] my-1" />

        {/* Report User → warning (pending review, not destructive) */}
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg hover:bg-[#eab308]/10 transition text-[#eab308] text-sm font-medium w-full text-left"
        >
          <FiAlertTriangle size={16} />
          Report User
        </button>

        {/* Block User → error */}
        <button
          onClick={() => setShowBlockConfirm(true)}
          className="flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg hover:bg-[#ef4444]/10 transition text-[#f87171] text-sm font-medium w-full text-left"
        >
          <FiUserX size={16} />
          Block User
        </button>

        {/* Delete Chat → error */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg hover:bg-[#ef4444]/10 transition text-[#f87171] text-sm font-medium w-full text-left"
        >
          <FiTrash2 size={16} />
          Delete Chat
        </button>
      </div>

      {/* BLOCK CONFIRM MODAL */}
      {showBlockConfirm && (
        <ModalPortal onBackdropClick={() => setShowBlockConfirm(false)}>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 w-[90%] max-w-xs sm:max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-[#ef4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUserX size={22} className="text-[#f87171]" />
            </div>
            <h3 className="text-[var(--text-primary)] text-lg font-semibold mb-2 text-center">
              Block {otherUser?.name || 'User'}?
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6 text-center leading-relaxed">
              They won't be able to message you. The chat stays visible so you can unblock later.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-card-hover)] transition border border-[var(--border)] text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-[#ef4444] text-white rounded-xl hover:bg-[#ef4444]/90 transition text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Blocking...' : 'Block'}
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* DELETE CONFIRM MODAL */}
      {showDeleteConfirm && (
        <ModalPortal onBackdropClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 w-[90%] max-w-xs sm:max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-[#ef4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 size={22} className="text-[#f87171]" />
            </div>
            <h3 className="text-[var(--text-primary)] text-lg font-semibold mb-2 text-center">Delete Chat?</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6 text-center leading-relaxed">
              This will permanently delete all messages for you. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-card-hover)] transition border border-[var(--border)] text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChat}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-[#ef4444] text-white rounded-xl hover:bg-[#ef4444]/90 transition text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* REPORT MODAL */}
      {showReportModal && (
        <ReportModal
          type="user"
          id={otherUser?._id}
          name={otherUser?.name}
          onClose={() => { setShowReportModal(false); setShowChatOptions(false); }}
        />
      )}

      {/* MEDIA & FILES MODAL */}
      {showMediaModal && (
        <ModalPortal onBackdropClick={() => { setShowMediaModal(false); setShowChatOptions(false); }}>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 w-[92%] max-w-sm sm:max-w-md shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[var(--text-primary)] text-lg font-semibold">Media & Files</h3>
              <button
                onClick={() => { setShowMediaModal(false); setShowChatOptions(false); }}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition text-lg"
              >✕</button>
            </div>
            <div className="text-center py-12 text-[var(--text-muted)]">
              <FiImage size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No media shared yet</p>
              <p className="text-xs mt-1">
                Images and files shared in this chat will appear here
              </p>
            </div>
          </div>
        </ModalPortal>
      )}

      <Toast toast={toast} />
    </>
  );
};

export default IndividualChatOptions;