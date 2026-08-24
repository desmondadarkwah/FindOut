import React, { useContext, useState } from "react";
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

const IndividualChatOptions = ({ otherUser, chatId, isBlockedChat }) => {
  const { setShowChatOptions, setSelectedChat, setChats } = useContext(ChatContext);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm]   = useState(false);
  const [showReportModal, setShowReportModal]     = useState(false);
  const [showMediaModal, setShowMediaModal]       = useState(false);
  const [reportReason, setReportReason]           = useState('');
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

  // ── MUTE ──
  const handleMute = () => {
    setIsMuted(!isMuted);
    setShowChatOptions(false);
    showToast(isMuted ? 'Chat unmuted' : 'Chat muted');
  };

  // ── DELETE CHAT ──
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

  // ── BLOCK USER ──
  const handleBlockUser = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/api/block-user', { userIdToBlock: otherUser?._id });
      // ✅ Don't remove from list - flag as blocked instead
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

  // ── UNBLOCK USER ✅ NEW ──
  const handleUnblockUser = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/api/unblock-user', { userIdToUnblock: otherUser?._id });
      // ✅ Remove blocked flag
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

  // ── REPORT USER ──
  const handleReportUser = async () => {
    if (!reportReason.trim()) {
      showToast('Please select a reason', 'error');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/api/report-user', {
        reportedUserId: otherUser?._id,
        reason: reportReason,
        chatId
      });
      closeAll();
      showToast('Report submitted. Thank you.');
    } catch (e) {
      console.error('Report error:', e);
      showToast('Failed to submit report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const reportReasons = [
    'Harassment or bullying',
    'Spam or scam',
    'Inappropriate content',
    'Fake account',
    'Other',
  ];

  // ✅ BLOCKED MENU - only Unblock and Delete
  if (isBlockedChat) {
    return (
      <>
        <div className="absolute w-52 flex flex-col gap-1 right-0 top-10 bg-gray-900 p-3 shadow-2xl rounded-xl border border-gray-700/50 z-50">
          <h3 className="text-sm font-semibold text-gray-400 mb-2 px-1 uppercase tracking-wider">
            Blocked User
          </h3>

          {/* Unblock */}
          <button
            onClick={handleUnblockUser}
            disabled={loading}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-green-900/20 transition text-green-400 text-sm font-medium w-full text-left disabled:opacity-50"
          >
            <FiUnlock size={16} />
            {loading ? 'Unblocking...' : 'Unblock User'}
          </button>

          <div className="border-t border-gray-700/50 my-1" />

          {/* Delete Chat */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-900/20 transition text-red-400 text-sm font-medium w-full text-left"
          >
            <FiTrash2 size={16} />
            Delete Chat
          </button>
        </div>

        {/* Delete Confirm Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60]">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-80 shadow-2xl">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 size={22} className="text-red-400" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-2 text-center">Delete Chat?</h3>
              <p className="text-gray-400 text-sm mb-6 text-center leading-relaxed">
                This will permanently delete this conversation for you.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition border border-gray-600 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteChat}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-xl text-sm font-medium shadow-2xl ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white border border-gray-700'
          }`}>
            {toast.message}
          </div>
        )}
      </>
    );
  }

  // ✅ NORMAL MENU
  return (
    <>
      <div className="absolute w-56 flex flex-col gap-1 right-0 top-10 bg-gray-900 p-3 shadow-2xl rounded-xl border border-gray-700/50 z-50">
        <h3 className="text-sm font-semibold text-gray-400 mb-2 px-1 uppercase tracking-wider">
          Chat Options
        </h3>

        {/* Mute */}
        <button
          onClick={handleMute}
          className="flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg hover:bg-gray-800 transition text-gray-200 text-sm font-medium w-full text-left"
        >
          {isMuted
            ? <FiBell size={16} className="text-indigo-400" />
            : <FiBellOff size={16} className="text-indigo-400" />
          }
          {isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
        </button>

        {/* Media & Files */}
        <button
          onClick={() => { setShowMediaModal(true); setShowChatOptions(false); }}
          className="flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg hover:bg-gray-800 transition text-gray-200 text-sm font-medium w-full text-left"
        >
          <FiImage size={16} className="text-indigo-400" />
          Media & Files
        </button>

        <div className="border-t border-gray-700/50 my-1" />

        {/* Report User */}
        <button
          onClick={() => { setShowReportModal(true); setShowChatOptions(false); }}
          className="flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg hover:bg-red-900/10 transition text-red-400 text-sm font-medium w-full text-left"
        >
          <FiAlertTriangle size={16} />
          Report User
        </button>

        {/* Block User */}
        <button
          onClick={() => setShowBlockConfirm(true)}
          className="flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg hover:bg-red-900/10 transition text-red-400 text-sm font-medium w-full text-left"
        >
          <FiUserX size={16} />
          Block User
        </button>

        {/* Delete Chat */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg hover:bg-red-900/10 transition text-red-400 text-sm font-medium w-full text-left"
        >
          <FiTrash2 size={16} />
          Delete Chat
        </button>
      </div>

      {/* ── BLOCK CONFIRM MODAL ── */}
      {showBlockConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60]">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-80 shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUserX size={22} className="text-red-400" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2 text-center">
              Block {otherUser?.name || 'User'}?
            </h3>
            <p className="text-gray-400 text-sm mb-6 text-center leading-relaxed">
              They won't be able to message you. The chat stays visible so you can unblock later.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition border border-gray-600 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Blocking...' : 'Block'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60]">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-80 shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 size={22} className="text-red-400" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2 text-center">Delete Chat?</h3>
            <p className="text-gray-400 text-sm mb-6 text-center leading-relaxed">
              This will permanently delete all messages for you. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition border border-gray-600 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChat}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REPORT MODAL ── */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60]">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-80 shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle size={22} className="text-red-400" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2 text-center">
              Report {otherUser?.name || 'User'}
            </h3>
            <p className="text-gray-400 text-sm mb-4 text-center">
              Select a reason for reporting
            </p>
            <div className="flex flex-col gap-2 mb-4">
              {reportReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition ${
                    reportReason === reason
                      ? 'bg-red-500/15 border border-red-500/40 text-red-300'
                      : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition border border-gray-600 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReportUser}
                disabled={loading || !reportReason}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Reporting...' : 'Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MEDIA & FILES MODAL ── */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60]">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-96 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Media & Files</h3>
              <button
                onClick={() => setShowMediaModal(false)}
                className="text-gray-400 hover:text-white transition text-lg"
              >✕</button>
            </div>
            <div className="text-center py-12 text-gray-500">
              <FiImage size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No media shared yet</p>
              <p className="text-xs mt-1 text-gray-600">
                Images and files shared in this chat will appear here
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-xl text-sm font-medium shadow-2xl ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white border border-gray-700'
        }`}>
          {toast.message}
        </div>
      )}
    </>
  );
};

export default IndividualChatOptions;