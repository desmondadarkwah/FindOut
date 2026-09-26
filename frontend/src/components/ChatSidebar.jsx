import React, { useContext, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { RxAvatar } from "react-icons/rx";
import { ChatContext } from "../Context/ChatContext";
import { IoIosSearch } from "react-icons/io";
import { HiDotsVertical } from "react-icons/hi";
import { RxDashboard } from "react-icons/rx";
import { BeatLoader } from 'react-spinners';
import { MdOutlineKeyboardVoice, MdBlock } from "react-icons/md";
import moment from 'moment';
import socket from '../socket/socket';

const ChatSidebar = ({ showChatSidebar }) => {
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const { chats, setChats, setSelectedChat, userId, setUserId, barsToHidden, setBarsToHidden, showChatOptions, setShowChatOptions } = useContext(ChatContext);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axiosInstance.get("/api/chats");
        const { chats, userId } = response.data;
        setChats(chats);
        setUserId(userId);
        setLoading(false);
        localStorage.setItem('userId', userId);
      } catch (error) {
        console.error("Error fetching chats:", error);
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (!socket || !userId) return;

    const handleChatUpdated = (updatedChat) => {
      setChats(prevChats =>
        prevChats.map(chat => {
          if (chat._id === updatedChat._id) {
            const userUnread = updatedChat.unreadCount?.find(
              u => u.userId?.toString() === userId?.toString()
            );
            return { ...updatedChat, unreadCount: userUnread ? userUnread.count : 0 };
          }
          return chat;
        })
      );
    };

    socket.on('chat-updated', handleChatUpdated);
    return () => socket.off('chat-updated', handleChatUpdated);
  }, [socket, userId, setChats]);

  useEffect(() => {
    if (!socket || !userId) return;

    socket.emit('user-online', userId);

    const handleUserStatusChanged = ({ userId: changedUserId, isOnline, lastSeen }) => {
      setOnlineUsers(prev => ({
        ...prev,
        [changedUserId]: { isOnline, lastSeen }
      }));
    };

    socket.on('user-status-changed', handleUserStatusChanged);
    return () => socket.off('user-status-changed', handleUserStatusChanged);
  }, [socket, userId]);

  useEffect(() => {
    if (!socket || !userId) return;

    const handleMembersAdded = ({ groupId, newMembers, group }) => {
      setChats(prevChats =>
        prevChats.map(chat =>
          chat._id === groupId ? { ...chat, members: group.members } : chat
        )
      );
    };

    const handleMemberJoined = ({ groupId, newMember, group }) => {
      setChats(prevChats =>
        prevChats.map(chat =>
          chat._id === groupId ? { ...chat, members: group.members } : chat
        )
      );
    };

    const handleAddedToGroup = ({ groupId, groupName, addedBy }) => {
      axiosInstance.get("/api/chats").then(response => {
        setChats(response.data.chats);
      }).catch(error => {
        console.error('❌ Error fetching updated chats:', error);
      });
    };

    socket.on('members-added', handleMembersAdded);
    socket.on('member-joined', handleMemberJoined);
    socket.on('added-to-group', handleAddedToGroup);

    return () => {
      socket.off('members-added', handleMembersAdded);
      socket.off('member-joined', handleMemberJoined);
      socket.off('added-to-group', handleAddedToGroup);
    };
  }, [socket, userId, setChats]);

  useEffect(() => {
    if (!socket || !userId) return;

    const handleForceRemoveChat = ({ groupId, groupName, reason }) => {
      setChats(prevChats => prevChats.filter(chat => chat._id !== groupId));
      setSelectedChat(prev => prev?._id === groupId ? null : prev);
    };

    socket.on('force-remove-chat', handleForceRemoveChat);
    return () => socket.off('force-remove-chat', handleForceRemoveChat);
  }, [socket, userId, setChats, setSelectedChat]);

  const handleChatClick = (chat) => {
    if (socket) {
      socket.emit('mark-chat-read', { chatId: chat._id, userId });
    }
    setChats(prevChats =>
      prevChats.map(c => c._id === chat._id ? { ...c, unreadCount: 0 } : c)
    );
    setSelectedChat(chat);
    setBarsToHidden(false);
  };

  const filteredChats = chats.filter(chat => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    if (chat.isGroup) return chat.groupName?.toLowerCase().includes(query);
    const otherUser = chat.participants?.find(p => p._id !== userId);
    return otherUser?.name?.toLowerCase().includes(query);
  });

  if (loading) {
    return (
      <div className="w-full md:w-auto lg:min-w-[33%] flex items-center justify-center text-[var(--text-secondary)] bg-[var(--bg-primary)] h-screen p-4 gap-3">
        <div className="flex flex-col items-center gap-3">
          <BeatLoader color="#6366f1" size={8} />
          <span className="text-sm font-medium">Loading chats...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        bg-[var(--bg-primary)] text-[var(--text-primary)] h-screen overflow-hidden 
        flex flex-col border-r border-[var(--border)] shadow-2xl
        transition-all duration-300
        ${barsToHidden ? 'w-full fixed inset-0 z-50' : 'hidden'} 
        ${showChatSidebar ? 'md:flex md:relative md:w-auto lg:min-w-[33%]' : 'md:hidden'}
      `}
      onClick={() => setShowChatOptions(false)}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between md:block border-b border-[var(--border)] text-center bg-[var(--bg-secondary)] backdrop-blur-sm">
        <RxDashboard className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" />
        <h4 className="text-lg font-semibold text-[var(--text-primary)]">
          Your Chats
        </h4>
        <HiDotsVertical className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" />
      </div>

      {/* Search */}
      <div className="flex items-center justify-center relative p-4">
        <div className="relative w-full max-w-sm">
          <IoIosSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] text-lg z-10" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[var(--bg-card-hover)] backdrop-blur-sm text-[var(--text-primary)] border border-[var(--border)] outline-none focus:border-[#6366f1]/50 focus:ring-2 focus:ring-[#6366f1]/20 transition-all duration-300 placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(31,41,55,0.3); }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.5); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.7); }
        `}</style>

        {filteredChats.length > 0 ? (
          <div className="space-y-1 p-2">
            {filteredChats.map((chat) => {
              const otherUser = !chat.isGroup && chat.participants.find(p => p._id !== userId);
              const isUserOnline = otherUser && onlineUsers[otherUser._id]?.isOnline;
              const isBlocked = chat.isBlockedChat; // ✅ blocked flag from backend

              return (
                <div
                  key={chat._id}
                  className="group flex items-center px-4 py-4 cursor-pointer rounded-2xl transition-colors duration-200 hover:bg-[var(--bg-card-hover)] mx-2"
                  onClick={() => {
                    setSelectedChat(chat);
                    setBarsToHidden(false);
                    handleChatClick(chat);
                  }}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={`flex items-center justify-center w-12 h-12 text-[var(--text-primary)] rounded-2xl shadow-lg transition-all duration-300 ${
                      isBlocked
                        ? 'bg-[#ef4444]/10'
                        : 'bg-[var(--bg-card-hover)]'
                    }`}>
                      {chat.isGroup ? (
                        chat.groupProfile ? (
                          <img
                            src={
                              chat.groupProfile.startsWith('/uploads/')
                                ? `${import.meta.env.VITE_BACKEND_URL}${chat.groupProfile}`
                                : `${import.meta.env.VITE_BACKEND_URL}/uploads/${chat.groupProfile}`
                            }
                            alt={chat.groupName || 'Group'}
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[var(--border)] group-hover:ring-[#6366f1]/30 transition-all duration-300"
                          />
                        ) : (
                          <RxAvatar className="text-[var(--text-secondary)] text-xl" />
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
                            className={`w-12 h-12 rounded-2xl object-cover ring-2 transition-all duration-300 ${
                              isBlocked ? 'ring-[#ef4444]/40 opacity-60' : 'ring-[var(--border)] group-hover:ring-[#6366f1]/30'
                            }`}
                          />
                        ) : (
                          <RxAvatar className="w-6 h-6 text-[var(--text-secondary)]" />
                        )
                      )}
                    </div>

                    {/* Online indicator - hide if blocked */}
                    {!chat.isGroup && isUserOnline && !isBlocked && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#22c55e] rounded-full border-2 border-[var(--bg-primary)] shadow-sm"></div>
                    )}

                    {/* Blocked indicator */}
                    {isBlocked && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#ef4444]/80 rounded-full border-2 border-[var(--bg-primary)] flex items-center justify-center">
                        <MdBlock size={8} color="#fff" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 ml-4 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-semibold truncate transition-colors ${
                        isBlocked ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)] group-hover:text-[#818cf8]'
                      }`}>
                        {chat.isGroup
                          ? chat.groupName
                          : chat.participants.find(p => p._id !== userId)?.name || "Unknown User"}
                      </span>

                      {/* ✅ Blocked badge OR timestamp */}
                      {isBlocked ? (
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          color: 'rgba(248,113,113,0.7)',
                          flexShrink: 0, marginLeft: 6,
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.15)',
                          padding: '1px 6px', borderRadius: 99,
                        }}>
                          Blocked
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--text-secondary)] font-medium flex-shrink-0 ml-2">
                          {chat.lastMessage?.createdAt
                            ? moment(chat.lastMessage.createdAt).fromNow()
                            : ''}
                        </span>
                      )}
                    </div>

                    {/* Message preview */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs truncate flex-1 transition-colors">
                        {/* ✅ Show "Tap to unblock" for blocked chats */}
                        {isBlocked ? (
                          <span style={{ color: 'rgba(248,113,113,0.5)', fontStyle: 'italic' }}>
                            Tap to unblock or delete
                          </span>
                        ) : chat.lastMessage?.senderId?._id === userId ? (
                          <>
                            {chat.lastMessage.type === 'audio' ? (
                              <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                                <MdOutlineKeyboardVoice size={14} />
                                You: Voice message
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                                You: {chat.lastMessage.content}
                              </span>
                            )}
                          </>
                        ) : chat.lastMessage?.content ? (
                          <>
                            {chat.lastMessage.type === 'audio' ? (
                              <span className="flex items-center gap-1 text-[var(--text-primary)]">
                                <MdOutlineKeyboardVoice size={14} />
                                {chat.isGroup && chat.lastMessage?.senderId?.name
                                  ? `${chat.lastMessage.senderId.name}: ` : ''}
                                Voice message
                              </span>
                            ) : (
                              <span className="flex gap-1 text-[var(--text-primary)] font-bold">
                                {chat.isGroup && chat.lastMessage?.senderId?.name && (
                                  <span className="text-[var(--text-secondary)] font-normal">
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
                          <span className="text-[var(--text-muted)]">No recent messages</span>
                        )}
                      </div>

                      {/* Unread badge - hide for blocked */}
                      {!isBlocked && chat.unreadCount > 0 && (
                        <div className="ml-2 flex-shrink-0">
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-[#6366f1] text-white text-xs font-bold rounded-full shadow-lg">
                            {chat.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="w-16 h-16 bg-[var(--bg-card-hover)] rounded-2xl flex items-center justify-center mb-4">
              <RxAvatar className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            {searchQuery ? (
              <>
                <h3 className="text-[var(--text-secondary)] font-medium mb-2">No results found</h3>
                <p className="text-[var(--text-muted)] text-sm">Try searching with a different name</p>
              </>
            ) : (
              <>
                <h3 className="text-[var(--text-secondary)] font-medium mb-2">No conversations yet</h3>
                <p className="text-[var(--text-muted)] text-sm">Start a new chat to begin messaging</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="h-4 bg-gradient-to-t from-[var(--bg-primary)] to-transparent pointer-events-none"></div>
    </div>
  );
};

export default ChatSidebar;