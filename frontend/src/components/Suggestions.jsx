import React, { useContext, useState,useEffect } from "react";
import { RxAvatar } from "react-icons/rx";
import { BeatLoader } from "react-spinners";
import { MdLock } from "react-icons/md";
import { SuggestionsContext } from "../Context/SuggestionsContext";
import axiosInstance from "../utils/axiosInstance";
import { ChatContext } from "../Context/ChatContext";
import { useToast } from "../Context/ToastContext"; // ✅ NEW
import socket from '../socket/socket';

const Suggestions = () => {
  const {
    suggestedUsers,
    suggestedGroups,
    loading,
    handleConnectPrivateChat,
    handleOpenGroupChat
  } = useContext(SuggestionsContext);

  const { setChats, userId } = useContext(ChatContext);
  const { toast } = useToast(); // ✅ NEW
  const [joiningGroupId, setJoiningGroupId] = useState(null);
  const [requestedGroups, setRequestedGroups] = useState([]);

  // ✅ ADD THIS ENTIRE useEffect RIGHT AFTER const [requestedGroups, setRequestedGroups] = useState([]);

  useEffect(() => {
    if (!socket || !userId) return;

    const handleJoinRequestApproved = ({ groupId, groupName, group }) => {
      console.log(`✅ Join request approved for ${groupName}`);

      // ✅ Add group to chats immediately
      setChats(prevChats => {
        const exists = prevChats.some(chat => chat._id === groupId);
        if (!exists) return [group, ...prevChats];
        return prevChats;
      });

      // ✅ Remove from requested list
      setRequestedGroups(prev => prev.filter(id => id !== groupId));

      // ✅ Show success toast
      toast.success(`You've been added to ${groupName}!`, 'Request Approved');
    };

    const handleJoinRequestDenied = ({ groupId, groupName }) => {
      console.log(`❌ Join request denied for ${groupName}`);

      // ✅ Remove from requested list
      setRequestedGroups(prev => prev.filter(id => id !== groupId));

      // ✅ Show info toast
      toast.info(`Your request to join ${groupName} was declined`, 'Request Denied');
    };

    socket.on('join-request-approved', handleJoinRequestApproved);
    socket.on('join-request-denied', handleJoinRequestDenied);

    return () => {
      socket.off('join-request-approved', handleJoinRequestApproved);
      socket.off('join-request-denied', handleJoinRequestDenied);
    };
  }, [userId, setChats, toast, socket]);

  const handleJoinGroup = async (group) => {
    const groupId = group._id;
    const isAlreadyMember = group.members?.some(
      m => (m._id || m) === userId
    );

    if (isAlreadyMember) {
      handleOpenGroupChat(groupId);
      return;
    }

    setJoiningGroupId(groupId);

    try {
      const response = await axiosInstance.post('/api/join-group', { groupId });

      if (response.data.success) {
        if (response.data.isPending) {
          setRequestedGroups(prev => [...prev, groupId]);
          // ✅ Toast instead of alert
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
          handleOpenGroupChat(groupId);
        }
      }
    } catch (error) {
      console.error('❌ Error joining group:', error);
      const errData = error.response?.data;

      if (errData?.isPending) {
        setRequestedGroups(prev => [...prev, groupId]);
        toast.info('Your request has been sent to the group admin', 'Request Sent');
      } else {
        // ✅ Toast instead of alert
        toast.error(errData?.message || 'Failed to join group');
      }
    } finally {
      setJoiningGroupId(null);
    }
  };

  if (loading) {
    /* Skeleton rows rather than a spinner: the layout does not jump when the
       real content arrives. */
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading suggestions">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-full bg-surface-hover" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 w-24 rounded bg-surface-hover" />
              <div className="h-2 w-16 rounded bg-surface-hover/60" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const hasSuggestions = suggestedUsers.length > 0 || suggestedGroups.length > 0;

  if (!hasSuggestions) {
    return (
      <p className="py-6 text-center text-xs text-content-muted">
        No suggestions yet. Add subjects to your profile to get matched.
      </p>
    );
  }

  /* Availability drives the accent colour, so the same meaning is signalled
     identically here and in the profile panel. */
  const statusTone = (status) =>
    status === "Ready To Teach"
      ? "text-success-400"
      : status === "Ready To Learn"
      ? "text-primary-400"
      : "text-content-muted";

  return (
    <div className="space-y-1">

      {/* ─── USERS ─── */}
      {suggestedUsers.map((user) => (
        <div
          key={user._id}
          className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-hover"
        >
          {user.profilePicture ? (
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}${user.profilePicture}`}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-hover text-content-muted">
              <RxAvatar size={18} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-content-primary">
              {user.name}
            </span>
            <span className={`block truncate text-xs ${statusTone(user.status)}`}>
              {user.status}
            </span>
          </div>

          <button
            onClick={() => handleConnectPrivateChat(user._id)}
            className="shrink-0 cursor-pointer rounded-lg bg-primary-500/15 px-2.5 py-1.5 text-xs font-semibold text-primary-300 ring-1 ring-inset ring-primary-500/30 transition-all hover:bg-primary-500/25 hover:ring-primary-500/50 active:scale-95"
          >
            Connect
          </button>
        </div>
      ))}

      {suggestedUsers.length > 0 && suggestedGroups.length > 0 && (
        <p className="px-2 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-content-muted">
          Groups
        </p>
      )}

      {/* ─── GROUPS ─── */}
      {suggestedGroups.map((group) => {
        const groupId = group._id;
        const isJoining = joiningGroupId === groupId;
        const isRequested = requestedGroups.includes(groupId);
        const isAlreadyMember = group.members?.some(
          m => (m._id || m) === userId
        );

        const getButtonLabel = () => {
          if (isJoining) return <BeatLoader color="white" size={6} />;
          if (isAlreadyMember) return 'Open';
          if (isRequested) return null;
          if (group.isPrivate) return 'Request';
          return 'Join';
        };

        return (
          <div
            key={groupId}
            className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-hover"
          >
            {group.groupProfile ? (
              <img
                src={
                  group.groupProfile.startsWith('/uploads/')
                    ? `${import.meta.env.VITE_BACKEND_URL}${group.groupProfile}`
                    : `${import.meta.env.VITE_BACKEND_URL}/uploads/${group.groupProfile}`
                }
                alt=""
                className="h-9 w-9 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-content-muted">
                <RxAvatar size={18} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <span className="flex items-center gap-1 truncate text-sm font-medium text-content-primary">
                <span className="truncate">{group.groupName}</span>
                {group.isPrivate && (
                  <MdLock size={11} className="shrink-0 text-content-muted" aria-label="Private" />
                )}
              </span>
              <span className="block truncate text-xs text-content-muted">
                {group.members?.length || 0} members ·{' '}
                {group.isPrivate ? 'Private' : 'Public'}
              </span>
            </div>

            {isRequested ? (
              /* Not a control — a pending state. Styled flat and unclickable so
                 it is not mistaken for an action. */
              <span className="shrink-0 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-medium text-content-muted">
                Pending
              </span>
            ) : (
              <button
                onClick={() => handleJoinGroup(group)}
                disabled={isJoining}
                className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isAlreadyMember
                    ? 'bg-success-500/15 text-success-400 ring-success-500/30 hover:bg-success-500/25 hover:ring-success-500/50'
                    : group.isPrivate
                    ? 'bg-warning-500/15 text-warning-400 ring-warning-500/30 hover:bg-warning-500/25 hover:ring-warning-500/50'
                    : 'bg-primary-500/15 text-primary-300 ring-primary-500/30 hover:bg-primary-500/25 hover:ring-primary-500/50'
                }`}>
                {getButtonLabel()}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Suggestions;