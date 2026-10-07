import React, { useContext, useState, useEffect, useMemo } from "react";
import { RxAvatar } from "react-icons/rx";
import { BeatLoader } from "react-spinners";
import { MdLock } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";
import { SuggestionsContext } from "../Context/SuggestionsContext";
import axiosInstance from "../utils/axiosInstance";
import { ChatContext } from "../Context/ChatContext";
import { useToast } from "../Context/ToastContext";
import socket from '../socket/socket';

// Scrolling still works, the scrollbar itself is hidden
const scrollStyle = { scrollbarWidth: 'none', msOverflowStyle: 'none' };

// Height of the scrollable suggestions box (compact mode only).
// Adapts to the screen so the profile card, header and tip stay visible.
const compactBoxStyle = {
  ...scrollStyle,
  maxHeight: 'clamp(220px, calc(100vh - 460px), 420px)',
};

// Works whether the backend stores "/uploads/x.png", "x.png" or a full URL
const resolveImage = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `${import.meta.env.VITE_BACKEND_URL}${path}`;
  return `${import.meta.env.VITE_BACKEND_URL}/uploads/${path}`;
};

// Shows the picture, and falls back to the default avatar if the file is
// missing/broken instead of showing the browser's broken-image icon.
const Avatar = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="w-10 h-10 bg-[var(--bg-card-hover)] rounded-full flex items-center justify-center flex-shrink-0">
        <RxAvatar size={20} className="text-[var(--text-secondary)]" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
    />
  );
};

/**
 * Props (all optional, so existing usages like the mobile view behave exactly as before):
 *  - compact    : puts ONLY the suggestion list inside a fixed-height scrollable box
 *  - showAll    : opens the "See All" popup
 *  - onCloseAll : called when the popup should close
 */
const Suggestions = ({ compact = false, showAll = false, onCloseAll }) => {
  const {
    suggestedUsers,
    suggestedGroups,
    loading,
    handleConnectPrivateChat,
    handleOpenGroupChat
  } = useContext(SuggestionsContext);

  const { setChats, userId } = useContext(ChatContext);
  const { toast } = useToast();
  const [joiningGroupId, setJoiningGroupId] = useState(null);
  const [requestedGroups, setRequestedGroups] = useState([]);

  // "See All" popup state
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all'); // all | people | groups

  useEffect(() => {
    if (!socket || !userId) return;

    const handleJoinRequestApproved = ({ groupId, groupName, group }) => {
      setChats(prevChats => {
        const exists = prevChats.some(chat => chat._id === groupId);
        if (!exists) return [group, ...prevChats];
        return prevChats;
      });

      setRequestedGroups(prev => prev.filter(id => id !== groupId));
      toast.success(`You've been added to ${groupName}!`, 'Request Approved');
    };

    const handleJoinRequestDenied = ({ groupId, groupName }) => {
      setRequestedGroups(prev => prev.filter(id => id !== groupId));
      toast.info(`Your request to join ${groupName} was declined`, 'Request Denied');
    };

    socket.on('join-request-approved', handleJoinRequestApproved);
    socket.on('join-request-denied', handleJoinRequestDenied);

    return () => {
      socket.off('join-request-approved', handleJoinRequestApproved);
      socket.off('join-request-denied', handleJoinRequestDenied);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Escape closes the popup; filters reset whenever it closes
  useEffect(() => {
    if (!showAll) {
      setQuery('');
      setTab('all');
      return;
    }
    const onKeyDown = (e) => { if (e.key === 'Escape') onCloseAll?.(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showAll, onCloseAll]);

  const users = suggestedUsers || [];
  const groups = suggestedGroups || [];

  const { filteredUsers, filteredGroups } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fu = users.filter(u =>
      !q || u.name?.toLowerCase().includes(q) || u.status?.toLowerCase().includes(q)
    );
    const fg = groups.filter(g =>
      !q || g.groupName?.toLowerCase().includes(q)
    );
    return {
      filteredUsers: tab === 'groups' ? [] : fu,
      filteredGroups: tab === 'people' ? [] : fg
    };
  }, [users, groups, query, tab]);

  const handleJoinGroup = async (group) => {
    const groupId = group._id;
    const isAlreadyMember = group.members?.some(
      m => (m._id || m) === userId
    );

    if (isAlreadyMember) {
      onCloseAll?.();
      handleOpenGroupChat(groupId);
      return;
    }

    setJoiningGroupId(groupId);

    try {
      const response = await axiosInstance.post('/api/join-group', { groupId });

      if (response.data.success) {
        if (response.data.isPending) {
          setRequestedGroups(prev => [...prev, groupId]);
          toast.info(
            'Your request has been sent to the group admin',
            'Request Sent'
          );
        } else {
          setChats(prevChats => {
            const exists = prevChats.some(chat => chat._id === groupId);
            if (!exists) return [response.data.group, ...prevChats];
            return prevChats;
          });
          toast.success(`You joined ${group.groupName}!`, 'Joined Group');
          onCloseAll?.();
          handleOpenGroupChat(groupId);
        }
      }
    } catch (error) {
      console.error('Error joining group:', error);
      const errData = error.response?.data;

      if (errData?.isPending) {
        setRequestedGroups(prev => [...prev, groupId]);
        toast.info('Your request has been sent to the group admin', 'Request Sent');
      } else {
        toast.error(errData?.message || 'Failed to join group');
      }
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handleConnect = (id) => {
    onCloseAll?.();
    handleConnectPrivateChat(id);
  };

  // ─── ROW RENDERERS (shared by the list and the popup) ───
  const renderUser = (user, wide = false) => (
    <div key={user._id} className={`flex items-center justify-between ${wide ? 'gap-2 p-3 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors' : 'p-1'}`}>
      <div className="flex items-center gap-2 min-w-0">
        <Avatar src={resolveImage(user.profilePicture)} alt={user.name} />
        <span className="flex flex-col min-w-0">
          <span className={`font-semibold text-[var(--text-primary)] truncate block ${wide ? '' : 'w-32'}`}>
            {user.name}
          </span>
          <span className={`block text-[var(--text-muted)] text-sm ${wide ? 'truncate' : ''}`}>{user.status}</span>
        </span>
      </div>
      <button
        onClick={() => handleConnect(user._id)}
        className={`text-[#818cf8] text-sm hover:opacity-80 transition-opacity ${wide ? 'flex-shrink-0 px-3 py-1 rounded-lg border border-[#6366f1]/30 hover:bg-[#6366f1]/10' : ''}`}>
        Connect
      </button>
    </div>
  );

  const renderGroup = (group, wide = false) => {
    const groupId = group._id;
    const isJoining = joiningGroupId === groupId;
    const isRequested = requestedGroups.includes(groupId);
    const isAlreadyMember = group.members?.some(
      m => (m._id || m) === userId
    );

    const getButtonLabel = () => {
      if (isJoining) return <BeatLoader color="#fff" size={6} />;
      if (isAlreadyMember) return 'Open';
      if (group.privacy === 'private') return 'Request';
      return 'Join';
    };

    return (
      <div key={groupId} className={`flex items-center justify-between ${wide ? 'gap-2 p-3 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors' : 'p-1'}`}>
        <div className="flex items-center gap-2 min-w-0">
          <Avatar src={resolveImage(group.groupProfile)} alt={group.groupName} />

          <span className="flex flex-col min-w-0">
            <span className={`font-semibold text-[var(--text-primary)] truncate block ${wide ? '' : 'w-28'}`}>
              {group.groupName}
              {group.privacy === 'private' && (
                <MdLock size={12} className="text-[var(--text-muted)] inline ml-1" />
              )}
            </span>
            <span className="block text-[var(--text-muted)] text-xs">
              {group.members?.length || 0} members ·{' '}
              {group.privacy === 'private' ? 'Private' : 'Public'}
            </span>
          </span>
        </div>

        {isRequested ? (
          <span className="text-[var(--text-muted)] text-xs">Requested</span>
        ) : (
          <button
            onClick={() => handleJoinGroup(group)}
            disabled={isJoining}
            className={`text-sm transition-opacity disabled:opacity-50 hover:opacity-80 ${
              isAlreadyMember ? 'text-[#22c55e]' : 'text-[#818cf8]'
            } ${wide ? 'flex-shrink-0 px-3 py-1 rounded-lg border border-[var(--border)] hover:bg-[#6366f1]/10' : ''}`}>
            {getButtonLabel()}
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <BeatLoader color="var(--text-secondary)" size={10} />
      </div>
    );
  }

  const total = users.length + groups.length;
  const modalResults = filteredUsers.length + filteredGroups.length;

  const tabs = [
    { id: 'all', label: 'All', count: total },
    { id: 'people', label: 'People', count: users.length },
    { id: 'groups', label: 'Groups', count: groups.length },
  ];

  // The list itself, identical in content to the original
  const list = (
    <>
      {users.map((user) => renderUser(user))}
      {groups.map((group) => renderGroup(group))}
    </>
  );

  return (
    <div className="p-2 w-full bg-[var(--bg-primary)]">

      {/* ─── LIST ───
          compact  → only this box scrolls (desktop sidebar)
          default  → renders exactly as before (mobile view etc.) */}
      {compact ? (
        total === 0 ? (
          <p className="text-[var(--text-muted)] text-sm text-center py-4">
            No suggestions right now
          </p>
        ) : (
          <div className="no-scrollbar overflow-y-auto space-y-1" style={compactBoxStyle}>
            {list}
          </div>
        )
      ) : (
        list
      )}

      {/* ─── SEE ALL POPUP ─── */}
      {showAll && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onCloseAll}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="All suggestions"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[80vh] flex flex-col bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">

            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div>
                <h3 className="text-[var(--text-primary)] font-semibold text-base">Suggested for you</h3>
                <p className="text-[var(--text-muted)] text-xs mt-0.5">
                  {total} {total === 1 ? 'suggestion' : 'suggestions'}
                </p>
              </div>
              <button
                onClick={onCloseAll}
                aria-label="Close"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <IoClose size={24} />
              </button>
            </div>

            <div className="px-5 pt-4">
              <div className="relative">
                <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-lg" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search people and groups..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border)] outline-none focus:border-[#6366f1]/50 focus:ring-2 focus:ring-[#6366f1]/20 transition-all text-sm"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm">
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2 px-5 py-3">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    tab === t.id
                      ? 'bg-[#6366f1]/10 border-[#6366f1]/40 text-[#818cf8]'
                      : 'bg-transparent border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                  }`}>
                  {t.label} <span className="opacity-70">{t.count}</span>
                </button>
              ))}
            </div>

            <div className="no-scrollbar flex-1 overflow-y-auto px-3 pb-4 space-y-1" style={scrollStyle}>
              {modalResults === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-[var(--text-secondary)] font-medium mb-1">
                    {query ? 'No results found' : 'No suggestions right now'}
                  </p>
                  <p className="text-[var(--text-muted)] text-sm">
                    {query ? 'Try a different name or clear the filter' : 'Update your status to get better matches'}
                  </p>
                </div>
              ) : (
                <>
                  {filteredUsers.length > 0 && tab === 'all' && (
                    <p className="px-3 pt-1 pb-1 text-xs font-medium text-[var(--text-muted)]">People</p>
                  )}
                  {filteredUsers.map((user) => renderUser(user, true))}

                  {filteredGroups.length > 0 && tab === 'all' && (
                    <p className="px-3 pt-3 pb-1 text-xs font-medium text-[var(--text-muted)]">Groups</p>
                  )}
                  {filteredGroups.map((group) => renderGroup(group, true))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suggestions;