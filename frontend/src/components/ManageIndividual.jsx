import React, { useState, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { SettingsContext } from "../Context/SettingsContext";
import { ChatContext } from "../Context/ChatContext";
import { RxAvatar } from "react-icons/rx";
import { MdBlock, MdOutlineReportProblem, MdNotifications, MdDelete } from "react-icons/md";
import { BsShieldCheck } from "react-icons/bs";
import { FiMail, FiCalendar, FiBook, FiAward } from "react-icons/fi";
import axiosInstance from "../utils/axiosInstance";
import { useToast } from "../Context/ToastContext";
import ReportModal from "./ReportModal";
import moment from "moment";
import { BeatLoader } from "react-spinners";

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
  const [fullProfile, setFullProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const otherParticipant = selectedChat?.participants?.find(p => p._id !== userId);

  // ✅ Fetch full profile when opened
  useEffect(() => {
    if (!otherParticipant?._id) return;

    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const response = await axiosInstance.get(`/api/user/${otherParticipant._id}/profile`);
        if (response.data.success) {
          setFullProfile(response.data.user);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [otherParticipant?._id]);

  // ✅ Use fullProfile if available, fallback to otherParticipant
  const profile = fullProfile || otherParticipant;

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
      toast.error('Failed to block user');
    } finally {
      setLoading(false);
    }
  };

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
      toast.error('Failed to delete chat');
    } finally {
      setLoading(false);
    }
  };

  if (!otherParticipant) return null;

  // ✅ Only show contact fields that have actual values
  const contactInfo = [
    profile?.email && {
      icon: <FiMail size={15} className="text-[#3b82f6]" />,
      label: 'Email',
      value: profile.email
    },
    profile?.createdAt && {
      icon: <FiCalendar size={15} className="text-[#6366f1]" />,
      label: 'Member since',
      value: moment(profile.createdAt).format('MMM YYYY')
    },
  ].filter(Boolean);

  // ✅ Only show learning fields that have actual values
  const learningInfo = [
    profile?.subjects?.length > 0 && {
      icon: <FiBook size={15} className="text-[#22c55e]" />,
      label: 'Subjects',
      value: profile.subjects.join(', ')
    },
    profile?.reputation > 0 && {
      icon: <FiAward size={15} className="text-[#eab308]" />,
      label: 'Reputation',
      value: `⭐ ${profile.reputation} points`
    },
    profile?.bio && {
      icon: null,
      label: 'Bio',
      value: profile.bio
    },
  ].filter(Boolean);

  return (
    <div className="fixed right-0 top-0 w-full h-full max-w-[806px] mx-auto flex flex-col items-center bg-[var(--bg-primary)] z-50">
      <span className="cursor-default flex justify-end w-full text-[var(--text-muted)] font-bold p-4">
        <IoClose
          onClick={(e) => { e.stopPropagation(); setOpenGroupManager(false); }}
          className="cursor-pointer hover:text-[var(--text-primary)] transition-colors"
          size={28}
        />
      </span>

      <div className="w-full shadow-lg p-4 bg-[var(--bg-primary)] overflow-y-auto cursor-default">

        {/* ── PROFILE SECTION ── */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {profileLoading ? (
              <div className="w-24 h-24 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center ring-4 ring-[var(--border)]">
                <BeatLoader color="#6366f1" size={8} />
              </div>
            ) : profile?.profilePicture ? (
              <img
                src={
                  profile.profilePicture.startsWith('/uploads/')
                    ? `${import.meta.env.VITE_BACKEND_URL}${profile.profilePicture}`
                    : `${import.meta.env.VITE_BACKEND_URL}/uploads/${profile.profilePicture}`
                }
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-[var(--border)]"
              />
            ) : (
              <div className="w-24 h-24 bg-[var(--bg-card-hover)] rounded-full flex items-center justify-center ring-4 ring-[var(--border)]">
                <RxAvatar size={48} className="text-[var(--text-secondary)]" />
              </div>
            )}
            {/* Online indicator */}
            {profile?.isOnline && (
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-[#22c55e] rounded-full border-4 border-[var(--bg-primary)]"></div>
            )}
          </div>

          <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-4">
            {profile?.name || otherParticipant.name}
          </h2>

          {/* Last seen if offline */}
          {!profile?.isOnline && profile?.lastSeen && (
            <p className="text-[var(--text-muted)] text-xs mt-1">
              Last seen {moment(profile.lastSeen).fromNow()}
            </p>
          )}

          {/* Status badge */}
          {profile?.status && profile.status !== 'Later' && (
            <span style={{
              marginTop: 8, padding: '3px 12px', borderRadius: 99,
              fontSize: 12, fontWeight: 600,
              background: profile.status === 'Ready To Teach'
                ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)',
              color: profile.status === 'Ready To Teach' ? '#4ade80' : '#60a5fa',
              border: `1px solid ${profile.status === 'Ready To Teach'
                ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.2)'}`,
            }}>
              {profile.status === 'Ready To Teach' ? '👨‍🏫' : '📖'} {profile.status}
            </span>
          )}

          {/* Verified badge */}
          {profile?.isVerified && (
            <span style={{
              marginTop: 6, padding: '3px 12px', borderRadius: 99,
              fontSize: 11, fontWeight: 700,
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.25)',
              color: '#a5b4fc',
            }}>
              ✅ Verified Teacher
            </span>
          )}
        </div>

        {/* ── CONTACT INFO - only if data exists ── */}
        {contactInfo.length > 0 && (
          <div className="bg-[var(--bg-card)] rounded-xl p-4 mb-4 border border-[var(--border)]">
            <h3 className="text-[var(--text-primary)] font-semibold mb-3 flex items-center gap-2 text-sm">
              <BsShieldCheck className="text-[#3b82f6]" size={16} />
              Contact Information
            </h3>
            <div className="space-y-3">
              {contactInfo.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                    {item.icon} {item.label}
                  </span>
                  <span className="text-[var(--text-primary)] text-sm font-medium">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LEARNING INFO - only if data exists ── */}
        {learningInfo.length > 0 && (
          <div className="bg-[var(--bg-card)] rounded-xl p-4 mb-4 border border-[var(--border)]">
            <h3 className="text-[var(--text-primary)] font-semibold mb-3 text-sm">
              Learning Profile
            </h3>
            <div className="space-y-3">
              {learningInfo.map((item, i) => (
                <div key={i}>
                  {item.label === 'Bio' ? (
                    <div>
                      <p className="text-[var(--text-secondary)] text-xs mb-1">Bio</p>
                      <p className="text-[var(--text-primary)] text-sm leading-relaxed">
                        {item.value}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                        {item.icon} {item.label}
                      </span>
                      <span className="text-[var(--text-primary)] text-sm font-medium max-w-[60%] text-right">
                        {item.value}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PRIVACY & SAFETY ── */}
        <div className="bg-[var(--bg-card)] rounded-xl p-4 mb-4 border border-[var(--border)]">
          <h3 className="text-[var(--text-primary)] font-semibold mb-3 text-sm">
            Privacy & Safety
          </h3>

          {/* Mute toggle */}
          <div className="flex items-center justify-between p-3 bg-[var(--bg-card-hover)] rounded-lg mb-3">
            <div className="flex items-center gap-3">
              <MdNotifications className="text-[var(--text-secondary)]" size={20} />
              <div>
                <p className="text-[var(--text-primary)] text-sm font-medium">Mute Notifications</p>
                <p className="text-[var(--text-muted)] text-xs">Turn off alerts for this chat</p>
              </div>
            </div>
            <button
              onClick={() => setMuteNotifications(!muteNotifications)}
              style={{
                width: 44, height: 24, borderRadius: 99,
                background: muteNotifications ? '#6366f1' : 'var(--border)',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.2s', flexShrink: 0,
              }}>
              <div style={{
                position: 'absolute', top: 3,
                left: muteNotifications ? 22 : 3,
                width: 18, height: 18, borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
              }} />
            </button>
          </div>

          {/* Block */}
          <button
            onClick={() => setShowBlockConfirm(true)}
            className="w-full flex items-center gap-3 p-3 bg-[var(--bg-card-hover)] rounded-lg mb-3 hover:bg-[#ef4444]/10 transition-colors text-left group">
            <MdBlock className="text-[var(--text-secondary)] group-hover:text-[#ef4444]" size={20} />
            <div>
              <p className="text-[var(--text-primary)] text-sm font-medium group-hover:text-[#f87171]">
                Block User
              </p>
              <p className="text-[var(--text-muted)] text-xs">They won't be able to message you</p>
            </div>
          </button>

          {/* Report */}
          <button
            onClick={() => setShowReportModal(true)}
            className="w-full flex items-center gap-3 p-3 bg-[var(--bg-card-hover)] rounded-lg hover:bg-[#eab308]/10 transition-colors text-left group">
            <MdOutlineReportProblem className="text-[var(--text-secondary)] group-hover:text-[#fbbf24]" size={20} />
            <div>
              <p className="text-[var(--text-primary)] text-sm font-medium group-hover:text-[#eab308]">
                Report User
              </p>
              <p className="text-[var(--text-muted)] text-xs">Report suspicious behavior</p>
            </div>
          </button>
        </div>

        {/* ── DANGER ZONE ── */}
        <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)]">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 p-3 bg-[var(--bg-card-hover)] rounded-lg hover:bg-[#ef4444]/15 transition-colors text-left">
            <MdDelete size={20} className="text-[#f87171]" />
            <div>
              <p className="text-[#f87171] text-sm font-medium">Delete Conversation</p>
              <p className="text-[var(--text-muted)] text-xs">This action cannot be undone</p>
            </div>
          </button>
        </div>
      </div>

      {/* Block Modal */}
      {showBlockConfirm && (
        <ModalPortal onBackdropClick={() => setShowBlockConfirm(false)}>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 w-[90%] max-w-xs shadow-2xl">
            <h3 className="text-[var(--text-primary)] text-lg font-semibold mb-3">
              Block {otherParticipant.name}?
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              They won't be able to message you or see when you're online. You can unblock them later.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="flex-1 px-4 py-2 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-lg border border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors">
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#ef4444]/90 transition-colors disabled:opacity-50">
                {loading ? 'Blocking...' : 'Block'}
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <ModalPortal onBackdropClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 w-[90%] max-w-xs shadow-2xl">
            <h3 className="text-[var(--text-primary)] text-lg font-semibold mb-3">
              Delete Conversation?
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              This will permanently delete all messages. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-lg border border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors">
                Cancel
              </button>
              <button
                onClick={handleDeleteChat}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#ef4444]/90 transition-colors disabled:opacity-50">
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