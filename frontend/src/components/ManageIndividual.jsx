import React, { useState, useContext } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { SettingsContext } from "../Context/SettingsContext";
import { ChatContext } from "../Context/ChatContext";
import { RxAvatar } from "react-icons/rx";
import { MdBlock, MdReport, MdNotifications, MdDelete } from "react-icons/md";
import { BsShieldCheck } from "react-icons/bs";
import axiosInstance from "../utils/axiosInstance";
import { useToast } from "../Context/ToastContext";
import ReportModal from "./ReportModal";

// Same portal-modal shell used in IndividualChatOptions.jsx — portaled to
// document.body so it can't get trapped by an ancestor's backdrop-filter,
// and stops mousedown from bubbling so clicks inside it can't be
// misread as an outside click by some other dropdown-close listener.
const ModalPortal = ({ children, onBackdropClick }) => {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60] p-4"
      onClick={(e) => { if (e.target === e.currentTarget && onBackdropClick) onBackdropClick(); }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
};

const ManageIndividual = () => {
  const { selectedChat, userId, setChats, setSelectedChat } = useContext(ChatContext);
  const { setOpenGroupManager } = useContext(SettingsContext);
  const { toast } = useToast();
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [muteNotifications, setMuteNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  const otherParticipant = selectedChat?.participants?.find(p => p._id !== userId);

  // FIX: this was a stub — console.log plus a comment saying "Add your
  // API call here", no actual request. IndividualChatOptions.jsx already
  // does this exact job for the same kind of chat, with a real endpoint —
  // wired this one the same way instead of leaving it half-built.
  const handleBlockUser = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/api/block-user', { userIdToBlock: otherParticipant?._id });
      setChats(prev => prev.map(c =>
        c._id === selectedChat._id ? { ...c, isBlockedChat: true } : c
      ));
      setSelectedChat(prev => ({ ...prev, isBlockedChat: true }));
      toast.success('User blocked');
      setShowBlockConfirm(false);
      setOpenGroupManager(false);
    } catch (error) {
      console.error('Block user error:', error);
      toast.error('Failed to block user');
    } finally {
      setLoading(false);
    }
  };

  // FIX: same stub pattern — now actually deletes the chat and clears it
  // from state, matching IndividualChatOptions.jsx's handleDeleteChat.
  const handleDeleteChat = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/api/delete-chat', { chatId: selectedChat._id });
      setChats(prev => prev.filter(c => c._id !== selectedChat._id));
      setSelectedChat(null);
      toast.success('Chat deleted');
      setShowDeleteConfirm(false);
      setOpenGroupManager(false);
    } catch (error) {
      console.error('Delete chat error:', error);
      toast.error('Failed to delete chat');
    } finally {
      setLoading(false);
    }
  };

  // FIX: was a console.log + alert() claiming success without actually
  // submitting anything. The app already has a real, working ReportModal
  // (used the same way from PostSettings, GroupOptions,
  // IndividualChatOptions) — this now opens the same thing instead of
  // faking a submission.
  const handleReportUser = () => setShowReportModal(true);

  // NOTE: left as local-only state, matching IndividualChatOptions.jsx's
  // own handleMute — that one doesn't call an API either, so this mirrors
  // the existing precedent rather than being an isolated gap.
  const toggleMuteNotifications = () => {
    setMuteNotifications(!muteNotifications);
  };

  if (!otherParticipant) {
    return null;
  }

  return (
    <div className="fixed right-0 top-0 w-full h-full max-w-[806px] mx-auto flex flex-col items-center bg-[var(--bg-primary)] z-50">
      <span className="cursor-default flex justify-end w-full text-[var(--text-muted)] font-bold p-4">
        <IoClose
          onClick={(e) => {
            e.stopPropagation();
            setOpenGroupManager(false);
          }}
          className="cursor-pointer hover:text-[var(--text-primary)] transition-colors"
          size={28}
        />
      </span>

      <div className="w-full shadow-lg p-4 bg-[var(--bg-primary)] overflow-y-auto cursor-default">
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {otherParticipant.profilePicture ? (
              <img
                src={
                  otherParticipant.profilePicture.startsWith('/uploads/')
                    ? `${import.meta.env.VITE_BACKEND_URL}${otherParticipant.profilePicture}`
                    : `${import.meta.env.VITE_BACKEND_URL}/uploads/${otherParticipant.profilePicture}`
                }
                alt={otherParticipant.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-[var(--border)]"
              />
            ) : (
              <div className="w-24 h-24 bg-[var(--bg-card-hover)] rounded-full flex items-center justify-center ring-4 ring-[var(--border)]">
                <RxAvatar size={48} className="text-[var(--text-secondary)]" />
              </div>
            )}
            {/* Online status indicator */}
            <div className="absolute bottom-2 right-2 w-5 h-5 bg-[#22c55e] rounded-full border-4 border-[var(--bg-primary)]"></div>
          </div>

          <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-4">{otherParticipant.name}</h2>
          <p className="text-[var(--text-secondary)] text-sm">{otherParticipant.status || "Available"}</p>
        </div>

        {/* User Info Section */}
        <div className="bg-[var(--bg-card)] rounded-xl p-4 mb-4 border border-[var(--border)]">
          <h3 className="text-[var(--text-primary)] font-semibold mb-3 flex items-center gap-2">
            <BsShieldCheck className="text-[#3b82f6]" />
            Contact Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Email</span>
              <span className="text-[var(--text-primary)]">{otherParticipant.email || "Not available"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Phone</span>
              <span className="text-[var(--text-primary)]">{otherParticipant.phone || "Not available"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Member since</span>
              <span className="text-[var(--text-primary)]">
                {otherParticipant.createdAt
                  ? new Date(otherParticipant.createdAt).toLocaleDateString()
                  : "Recently"}
              </span>
            </div>
          </div>
        </div>

        {/* Privacy & Safety Section */}
        <div className="bg-[var(--bg-card)] rounded-xl p-4 mb-4 border border-[var(--border)]">
          <h3 className="text-[var(--text-primary)] font-semibold mb-3">Privacy & Safety</h3>

          {/* Mute Notifications Toggle */}
          <div className="flex items-center justify-between p-3 bg-[var(--bg-card-hover)] rounded-lg mb-3 transition-colors">
            <div className="flex items-center gap-3">
              <MdNotifications className="text-[var(--text-secondary)]" size={20} />
              <div>
                <p className="text-[var(--text-primary)] text-sm font-medium">Mute Notifications</p>
                <p className="text-[var(--text-muted)] text-xs">Turn off notifications for this chat</p>
              </div>
            </div>
            <button
              onClick={toggleMuteNotifications}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                muteNotifications ? 'bg-[#6366f1]' : 'bg-[var(--border)]'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  muteNotifications ? 'transform translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* Block User */}
          <button
            onClick={() => setShowBlockConfirm(true)}
            className="w-full flex items-center gap-3 p-3 bg-[var(--bg-card-hover)] rounded-lg mb-3 hover:bg-[#ef4444]/10 transition-colors text-left group"
          >
            <MdBlock className="text-[#f87171] group-hover:text-[#ef4444]" size={20} />
            <div>
              <p className="text-[var(--text-primary)] text-sm font-medium group-hover:text-[#f87171]">Block User</p>
              <p className="text-[var(--text-muted)] text-xs">They won't be able to message you</p>
            </div>
          </button>

          {/* Report User */}
          <button
            onClick={handleReportUser}
            className="w-full flex items-center gap-3 p-3 bg-[var(--bg-card-hover)] rounded-lg hover:bg-[#eab308]/10 transition-colors text-left group"
          >
            <MdReport className="text-[#eab308] group-hover:text-[#fbbf24]" size={20} />
            <div>
              <p className="text-[var(--text-primary)] text-sm font-medium group-hover:text-[#eab308]">Report User</p>
              <p className="text-[var(--text-muted)] text-xs">Report suspicious or harmful behavior</p>
            </div>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#ef4444]/5 rounded-xl p-4 border border-[#ef4444]/20">
          <h3 className="text-[#f87171] font-semibold mb-3">Danger Zone</h3>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 p-3 bg-[#ef4444]/10 rounded-lg hover:bg-[#ef4444]/15 transition-colors text-left group"
          >
            <MdDelete className="text-[#f87171]" size={20} />
            <div>
              <p className="text-[#f87171] text-sm font-medium">Delete Conversation</p>
              <p className="text-[var(--text-muted)] text-xs">This action cannot be undone</p>
            </div>
          </button>
        </div>
      </div>

      {/* Block Confirmation Modal */}
      {showBlockConfirm && (
        <ModalPortal onBackdropClick={() => setShowBlockConfirm(false)}>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 w-[90%] max-w-xs shadow-2xl">
            <h3 className="text-[var(--text-primary)] text-lg font-semibold mb-3">Block {otherParticipant.name}?</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              They won't be able to message you or see when you're online. You can unblock them later from settings.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="flex-1 px-4 py-2 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors border border-[var(--border)]"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#ef4444]/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Blocking...' : 'Block'}
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ModalPortal onBackdropClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 w-[90%] max-w-xs shadow-2xl">
            <h3 className="text-[var(--text-primary)] text-lg font-semibold mb-3">Delete Conversation?</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              This will permanently delete all messages in this conversation. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors border border-[var(--border)]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChat}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#ef4444]/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          type="user"
          id={otherParticipant._id}
          name={otherParticipant.name}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};

export default ManageIndividual;