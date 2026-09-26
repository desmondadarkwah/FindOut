import React, { useContext, useState, useEffect } from "react";
import { RxAvatar } from "react-icons/rx";
import { BeatLoader } from "react-spinners";
import { MdLock } from "react-icons/md";
import { SuggestionsContext } from "../Context/SuggestionsContext";
import axiosInstance from "../utils/axiosInstance";
import { ChatContext } from "../Context/ChatContext";
import { useToast } from "../Context/ToastContext";
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
  const { toast } = useToast();
  const [joiningGroupId, setJoiningGroupId] = useState(null);
  const [requestedGroups, setRequestedGroups] = useState([]);

  // FIX: `toast` was in this effect's dependency array. If ToastContext
  // doesn't memoize the value it provides (useMemo/useCallback), a new
  // `toast` reference on every render would tear down and re-subscribe
  // these socket listeners constantly instead of once per userId — the
  // same bug pattern fixed earlier in ManageGroup.jsx. `socket` is a
  // stable module-level import so it's harmless in deps, but excluded
  // here too since it never changes.
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

  if (loading) {
    // FIX: was a magic `ml-28` push, a fragile guess at centering rather
    // than actually centering — swapped for a real flex-centered container.
    return (
      <div className="flex justify-center py-4">
        <BeatLoader color="var(--text-secondary)" size={10} />
      </div>
    );
  }

  return (
    <div className="p-2 w-full bg-[var(--bg-primary)]">

      {/* ─── USERS ─── */}
      {suggestedUsers.map((user) => (
        <div key={user._id} className="flex items-center justify-between p-1">
          <div className="flex items-center gap-2">
            {user.profilePicture ? (
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}${user.profilePicture}`}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-[var(--bg-card-hover)] rounded-full flex items-center justify-center">
                <RxAvatar size={20} className="text-[var(--text-secondary)]" />
              </div>
            )}
            <span className="flex flex-col">
              <span className="font-semibold text-[var(--text-primary)] truncate block w-32">
                {user.name}
              </span>
              <span className="block text-[var(--text-muted)] text-sm">{user.status}</span>
            </span>
          </div>
          <button
            onClick={() => handleConnectPrivateChat(user._id)}
            className="text-[#818cf8] text-sm hover:opacity-80 transition-opacity">
            Connect
          </button>
        </div>
      ))}

      {/* ─── GROUPS ─── */}
      {suggestedGroups.map((group) => {
        const groupId = group._id;
        const isJoining = joiningGroupId === groupId;
        const isRequested = requestedGroups.includes(groupId);
        const isAlreadyMember = group.members?.some(
          m => (m._id || m) === userId
        );

        // FIX: the `isRequested` branch here was dead code — the render
        // below already swaps the whole button out for a "Requested" label
        // before this function is ever called in that case. Removed the
        // unreachable branch rather than leave it implying behavior it
        // doesn't have.
        const getButtonLabel = () => {
          if (isJoining) return <BeatLoader color="#fff" size={6} />;
          if (isAlreadyMember) return 'Open';
          if (group.privacy === 'private') return 'Request';
          return 'Join';
        };

        return (
          <div key={groupId} className="flex items-center justify-between p-1">
            <div className="flex items-center gap-2">
              {group.groupProfile ? (
                <img
                  src={
                    group.groupProfile.startsWith('/uploads/')
                      ? `${import.meta.env.VITE_BACKEND_URL}${group.groupProfile}`
                      : `${import.meta.env.VITE_BACKEND_URL}/uploads/${group.groupProfile}`
                  }
                  alt={group.groupName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-[var(--bg-card-hover)] rounded-full flex items-center justify-center">
                  <RxAvatar size={20} className="text-[var(--text-secondary)]" />
                </div>
              )}

              <span className="flex flex-col">
                <span className="font-semibold text-[var(--text-primary)] truncate block w-28">
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