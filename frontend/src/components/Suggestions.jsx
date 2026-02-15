import React, { useContext, useState } from "react";
import { RxAvatar } from "react-icons/rx";
import { BeatLoader } from "react-spinners";
import { SuggestionsContext } from "../Context/SuggestionsContext";
import axiosInstance from "../utils/axiosInstance";
import { ChatContext } from "../Context/ChatContext";

const Suggestions = () => {
  const { suggestedUsers, suggestedGroups, loading, handleConnectPrivateChat } = useContext(SuggestionsContext);
  const { setChats } = useContext(ChatContext);
  const [joiningGroupId, setJoiningGroupId] = useState(null);

  const handleJoinGroup = async (groupId) => {
    setJoiningGroupId(groupId);

    try {
      const response = await axiosInstance.post('/api/join-group', { groupId });

      if (response.data.success) {
        console.log('✅ Joined group:', response.data.message);

        // Add group to chats if not pending
        if (!response.data.isPending) {
          setChats(prevChats => {
            // Check if group already exists
            const exists = prevChats.some(chat => chat._id === groupId);
            if (!exists) {
              return [response.data.group, ...prevChats];
            }
            return prevChats;
          });
        }

        // Show success message
        alert(response.data.message);
      }
    } catch (error) {
      console.error('❌ Error joining group:', error);
      alert(error.response?.data?.message || 'Failed to join group');
    } finally {
      setJoiningGroupId(null);
    }
  };

  if (loading) {
    return <span className="ml-28"><BeatLoader color="white" size={10} /></span>;
  }

  return (
    <div className="p-2 w-full bg-black">
      {/* USERS */}
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
              <span className="font-semibold text-white truncate block w-32">{user.name}</span>
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

      {/* GROUPS */}
      {suggestedGroups.map((group) => {
        const isJoining = joiningGroupId === group._id;

        return (
          <div key={group._id} className="flex items-center justify-between p-1">
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
                <span className="font-semibold text-white truncate block w-32">
                  {group.groupName}
                </span>
                <span className="block text-gray-500 text-xs">
                  {group.members?.length || 0} members
                </span>
              </span>
            </div>
            <button
              onClick={() => handleJoinGroup(group._id)}
              disabled={isJoining}
              className="text-blue-500 text-sm hover:text-blue-400 transition disabled:opacity-50">
              {isJoining ? 'Joining...' : 'Join'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Suggestions;