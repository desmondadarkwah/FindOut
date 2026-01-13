import React, { useContext, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { RxAvatar } from "react-icons/rx";
import { ChatContext } from "../Context/ChatContext";
import { IoIosSearch } from "react-icons/io";
import { HiDotsVertical } from "react-icons/hi";
import { RxDashboard } from "react-icons/rx";
import { BeatLoader } from 'react-spinners';
import { MdOutlineKeyboardVoice } from "react-icons/md";
import moment from 'moment';

const ChatSidebar = () => {
  const [loading, setLoading] = useState(true);
  const { chats, setChats, setSelectedChat, userId, setUserId, barsToHidden, setBarsToHidden, showChatOptions, setShowChatOptions } = useContext(ChatContext);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axiosInstance.get("/api/chats");
        const { chats, userId } = response.data;
        setChats(chats);
        console.log('sidebar selected-chats:', response.data);
        console.log('userId : ', userId);
        setUserId(userId);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chats:", error);
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  if (loading) {
    return (
      <div className="min-w-[100%] flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 h-screen p-4 lg:min-w-[33%] gap-3">
        <div className="flex flex-col items-center gap-3">
          <BeatLoader color="#6366f1" size={8} />
          <span className="text-sm font-medium">Loading chats...</span>
        </div>
      </div>
    );
  }



  return (
    <div
      className={`bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 backdrop-blur-xl text-white h-screen overflow-hidden flex flex-col border-r border-gray-800/50 lg:min-w-[33%] shadow-2xl
    ${barsToHidden ? 'block absolute z-50' : 'hidden'} md:block md:static md:z-auto`}
      onClick={() => setShowChatOptions(false)}
    >

      {/* Header with glassmorphism effect */}
      <div className="p-4 flex items-center justify-between md:block border-b border-gray-700/30 text-center bg-gray-900/20 backdrop-blur-sm">
        <RxDashboard className="lg:hidden text-gray-300 hover:text-white transition-colors cursor-pointer" />
        <h4 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Your Chats
        </h4>
        <HiDotsVertical className="lg:hidden text-gray-300 hover:text-white transition-colors cursor-pointer" />
      </div>

      {/* Enhanced search bar */}
      <div className="flex items-center justify-center relative p-4">
        <div className="relative w-full max-w-sm">
          <IoIosSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg z-10" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-800/40 backdrop-blur-sm text-white border border-gray-700/30 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Chat list with custom scrollbar */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(31, 41, 55, 0.3);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(99, 102, 241, 0.5);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(99, 102, 241, 0.7);
          }
        `}</style>

        {chats.length > 0 ? (
          <div className="space-y-1 p-2">
            {chats.map((chat) => (
              <div
                key={chat._id}
                className="group flex items-center px-4 py-4 cursor-pointer rounded-2xl transition-all duration-300 hover:bg-gray-800/50 hover:backdrop-blur-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] mx-2"
                onClick={() => {
                  setSelectedChat(chat);
                  setBarsToHidden(false);
                }}>

                {/* Enhanced avatar with online status indicator */}
                <div className="relative flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                    {chat.isGroup ? (
                      chat.groupProfile ? (
                        <img
                          src={
                            chat.groupProfile.startsWith('/uploads/')
                              ? `${import.meta.env.VITE_BACKEND_URL}${chat.groupProfile}`
                              : `${import.meta.env.VITE_BACKEND_URL}/uploads/${chat.groupProfile}`
                          }
                          alt={chat.groupName || 'Group'}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-gray-600 group-hover:ring-indigo-500/30 transition-all duration-300"
                        />
                      ) : (
                        <RxAvatar className="text-gray-300 text-xl" />
                      )
                    ) : (
                      chat.participants.length > 0 && chat.participants[0].profilePicture ? (
                        <img
                          src={
                            chat.participants[0].profilePicture.startsWith('/uploads/')
                              ? `${import.meta.env.VITE_BACKEND_URL}${chat.participants[0].profilePicture}`
                              : `${import.meta.env.VITE_BACKEND_URL}/uploads/${chat.participants[0].profilePicture}`
                          }
                          alt={chat.participants[0]?.name || 'User'}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-gray-600 group-hover:ring-indigo-500/30 transition-all duration-300"
                        />
                      ) : (
                        <RxAvatar className="w-6 h-6 text-gray-300" />
                      )
                    )}
                  </div>
                  {/* Online status dot for individual chats */}
                  {!chat.isGroup && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 shadow-sm"></div>
                  )}
                </div>

                {/* Chat info with better typography */}
                <div className="flex-1 ml-4 min-w-0">
                  <div className="flex items-center gap-16 mb-1">
                    <span className="text-sm font-semibold text-white truncate group-hover:text-indigo-200 transition-colors">
                      {chat.isGroup
                        ? chat.groupName
                        : chat.participants.find(p => p._id !== userId)?.name || "Unknown User"}
                    </span>
                    {/* <span className="text-xs text-gray-400 font-medium">12:30</span> */}
                    <span className="text-xxs text-gray-400 font-medium">
                      {chat.lastMessage?.createdAt
                        ? moment(chat.lastMessage.createdAt).fromNow()
                        : ''}
                    </span>
                  </div>


                  <div className="flex items-center justify-between">
                    <div className="text-xs truncate flex-1 group-hover:text-gray-300 transition-colors">
                      {
                        chat.lastMessage?.senderId?._id === userId ? (
                          // When YOU sent the last message - lighter/dimmer color
                          <>
                            {chat.lastMessage.type === 'audio' ? (
                              <span className="flex items-center gap-1 text-gray-400">
                                <MdOutlineKeyboardVoice size={14} />
                                You: Voice message
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-gray-400">
                                You: {chat.lastMessage.content}
                              </span>
                            )}
                          </>
                        ) : chat.lastMessage?.content ? (
                          // When SOMEONE ELSE sent the last message - brighter color
                          <>
                            {chat.lastMessage.type === 'audio' ? (
                              <span className="flex items-center gap-1 text-gray-200">
                                <MdOutlineKeyboardVoice size={14} />
                                {chat.isGroup && chat.lastMessage?.senderId?.name
                                  ? `${chat.lastMessage.senderId.name}: ` : ''}
                                Voice message
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-white font-bold">
                                {/* Show sender name in groups */}
                                {chat.isGroup && chat.lastMessage?.senderId?.name && (
                                  <span className="text-gray-300 font-normal">
                                    {chat.lastMessage.senderId.name}:
                                  </span>
                                )}
                                {chat.lastMessage.content.length > 30
                                  ? `${chat.lastMessage.content.substring(0, 30)}...`
                                  : chat.lastMessage.content}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-500">No recent messages</span>
                        )
                      }
                    </div>

                    {/* Unread message count badge */}
                    {chat.lastMessage?.senderId?._id !== userId && chat.unreadCount > 0 && (
                      <div className="ml-2 flex-shrink-0 bg-red-200">
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-indigo-500 text-white text-xs font-bold rounded-full">
                          {chat.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mb-4">
              <RxAvatar className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-gray-300 font-medium mb-2">No conversations yet</h3>
            <p className="text-gray-500 text-sm">Start a new chat to begin messaging</p>
          </div>
        )}
      </div>

      {/* Add a subtle gradient overlay at the bottom */}
      <div className="h-4 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default ChatSidebar;