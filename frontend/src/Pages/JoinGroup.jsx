import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatContext } from '../Context/ChatContext';
import axiosInstance from '../utils/axiosInstance';
import { BeatLoader } from 'react-spinners';

const JoinGroup = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { setSelectedChat, setChats } = useContext(ChatContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const joinGroup = async () => {
      try {
        const response = await axiosInstance.get(`/api/join/${inviteCode}`);
        
        if (response.data.success) {
          const { group, alreadyMember } = response.data;

          // ✅ Add/update group in chat list
          setChats(prevChats => {
            const exists = prevChats.some(chat => chat._id === group._id);
            if (exists) {
              // Update existing group
              return prevChats.map(chat =>
                chat._id === group._id ? group : chat
              );
            } else {
              // Add new group
              return [group, ...prevChats];
            }
          });

          // ✅ Set as selected chat
          setSelectedChat(group);

          // ✅ Navigate immediately (no success screen)
          navigate('/inbox');
        }
      } catch (error) {
        console.error('❌ Error joining group:', error);
        setError(error.response?.data?.message || 'Failed to join group');
        setLoading(false);
      }
    };

    joinGroup();
  }, [inviteCode, navigate, setSelectedChat, setChats]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-semibold text-red-500 mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/inbox')}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded border border-gray-700 transition">
            Go to Inbox
          </button>
        </div>
      </div>
    );
  }

  // ✅ Only show loading (no success screen)
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black">
      <BeatLoader color="white" size={10} />
      <p className="text-white mt-4 text-sm">Opening group...</p>
    </div>
  );
};

export default JoinGroup;