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
    return <span className="ml-28"><BeatLoader color="white" size={10} /></span>;
  }

  return (
    <div className="p-2 w-full bg-black">

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
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                <RxAvatar size={20} />
              </div>
            )}
            <span className="flex flex-col">
              <span className="font-semibold text-white truncate block w-32">
                {user.name}
              </span>
              <span className="block text-gray-500 text-sm">{user.status}</span>
            </span>
          </div>
          <button
            onClick={() => handleConnectPrivateChat(user._id)}
            className="text-blue-500 text-sm hover:text-blue-400 transition">
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

        const getButtonLabel = () => {
          if (isJoining) return <BeatLoader color="white" size={6} />;
          if (isAlreadyMember) return 'Open';
          if (isRequested) return null;
          if (group.isPrivate) return 'Request';
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
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                  <RxAvatar size={20} />
                </div>
              )}

              <span className="flex flex-col">
                <span className="font-semibold text-white truncate block w-28">
                  {group.groupName}
                  {group.isPrivate && (
                    <MdLock size={12} className="text-gray-400 inline ml-1" />
                  )}
                </span>
                <span className="block text-gray-500 text-xs">
                  {group.members?.length || 0} members •{' '}
                  {group.isPrivate ? 'Private' : 'Public'}
                </span>
              </span>
            </div>

            {isRequested ? (
              <span className="text-gray-500 text-xs">Requested</span>
            ) : (
              <button
                onClick={() => handleJoinGroup(group)}
                disabled={isJoining}
                className={`text-sm transition disabled:opacity-50 ${isAlreadyMember
                  ? 'text-green-500 hover:text-green-400'
                  : 'text-blue-500 hover:text-blue-400'
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