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
import socket from '../socket/socket';
import { BellOff, ImageIcon, FileText } from 'lucide-react';
import { isMuted, mutedChatIds } from '../utils/chatPrefs';

const ChatSidebar = ({ showChatSidebar }) => {
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState(''); // ✅ NEW: Search state

  const { chats, setChats, selectedChat, setSelectedChat, userId, setUserId, barsToHidden, setBarsToHidden, showChatOptions, setShowChatOptions } = useContext(ChatContext);

  /* Re-read on every render of the list rather than holding a copy: the
     preference is changed from the chat window, which is a different subtree,
     and a stale copy here would leave the bell icon disagreeing with the menu. */
  const mutedIds = mutedChatIds();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axiosInstance.get("/api/chats");
        const { chats, userId } = response.data;
        setChats(chats);
        console.log('userId : ', userId);
        console.log('chats : ', chats);

        setUserId(userId);
        setLoading(false);

        setUserId(userId);
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
      console.log('📨 Chat updated in sidebar:', updatedChat._id);

      setChats(prevChats =>
        prevChats.map(chat => {
          if (chat._id === updatedChat._id) {
            const userUnread = updatedChat.unreadCount?.find(
              u => u.userId?.toString() === userId?.toString()
            );

            return {
              ...updatedChat,
              unreadCount: userUnread ? userUnread.count : 0
            };
          }
          return chat;
        })
      );
    };

    socket.on('chat-updated', handleChatUpdated);

    return () => {
      socket.off('chat-updated', handleChatUpdated);
    };
  }, [socket, userId, setChats]);

  useEffect(() => {
    if (!socket || !userId) return;

    socket.emit('user-online', userId);

    const handleUserStatusChanged = ({ userId: changedUserId, isOnline, lastSeen }) => {
      console.log(`👤 User ${changedUserId} status: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);

      setOnlineUsers(prev => ({
        ...prev,
        [changedUserId]: { isOnline, lastSeen }
      }));
    };

    socket.on('user-status-changed', handleUserStatusChanged);

    return () => {
      socket.off('user-status-changed', handleUserStatusChanged);
    };
  }, [socket, userId]);

  useEffect(() => {
    if (!socket || !userId) return;

    const handleMembersAdded = ({ groupId, newMembers, group }) => {
      console.log('👥 Members added to group:', groupId);

      setChats(prevChats =>
        prevChats.map(chat =>
          chat._id === groupId ? { ...chat, members: group.members } : chat
        )
      );
    };

    const handleMemberJoined = ({ groupId, newMember, group }) => {
      console.log('👤 New member joined group:', groupId);

      setChats(prevChats =>
        prevChats.map(chat =>
          chat._id === groupId ? { ...chat, members: group.members } : chat
        )
      );
    };

    const handleAddedToGroup = ({ groupId, groupName, addedBy }) => {
      console.log('✅ You were added to group:', groupName);

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
      console.log(`❌ FORCE REMOVING chat ${groupName} - Reason: ${reason}`);

      setChats(prevChats => prevChats.filter(chat => chat._id !== groupId));

      setSelectedChat(prev => {
        if (prev?._id === groupId) {
          return null;
        }
        return prev;
      });

      if (reason === 'removed') {
        console.log(`You were removed from ${groupName}`);
      } else if (reason === 'left') {
        console.log(`You left ${groupName}`);
      }
    };

    socket.on('force-remove-chat', handleForceRemoveChat);

    return () => {
      socket.off('force-remove-chat', handleForceRemoveChat);
    };
  }, [socket, userId, setChats, setSelectedChat]);

  const handleChatClick = (chat) => {
    if (socket) {
      socket.emit('mark-chat-read', {
        chatId: chat._id,
        userId: userId
      });
    }

    setChats(prevChats =>
      prevChats.map(c =>
        c._id === chat._id ? { ...c, unreadCount: 0 } : c
      )
    );

    setSelectedChat(chat);
    setBarsToHidden(false);
  };

  // ✅ NEW: Filter chats based on search query
  const filteredChats = chats.filter(chat => {
    if (!searchQuery.trim()) return true; // Show all if no search

    const query = searchQuery.toLowerCase();

    // Search in group name
    if (chat.isGroup) {
      return chat.groupName?.toLowerCase().includes(query);
    }

    // Search in participant names (for 1-on-1 chats)
    const otherUser = chat.participants?.find(p => p._id !== userId);
    return otherUser?.name?.toLowerCase().includes(query);
  });

  if (loading) {
    return (
      <div className="w-full md:w-auto lg:min-w-[33%] flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 h-screen p-4 gap-3">
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
  bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 
  backdrop-blur-xl text-white h-screen overflow-hidden 
  flex flex-col border-r border-gray-800/50 shadow-2xl
  transition-all duration-300
  ${barsToHidden ? 'w-full fixed inset-0 z-50' : 'hidden'} 
  ${showChatSidebar ? 'md:flex md:relative md:w-auto lg:min-w-[33%]' : 'md:hidden'}
`}
      onClick={() => setShowChatOptions(false)}
    >

      <div className="flex items-center justify-between border-b border-edge-subtle px-4 py-4 md:block">
        <RxDashboard className="cursor-pointer text-content-muted transition-colors hover:text-content-primary lg:hidden" />
        <h4 className="text-[15px] font-semibold tracking-tight text-content-primary">
          Chats
          {chats.length > 0 && (
            <span className="ml-2 text-[13px] font-normal tabular-nums text-content-muted">
              {chats.length}
            </span>
          )}
        </h4>
        <HiDotsVertical className="cursor-pointer text-content-muted transition-colors hover:text-content-primary lg:hidden" />
      </div>

      {/* ✅ UPDATED: Search input with functionality */}
      <div className="relative px-3 py-3">
        <div className="relative w-full">
          <IoIosSearch className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-lg text-content-muted" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-edge bg-surface-input py-2.5 pl-11 pr-9 text-[14px] text-content-primary outline-none transition-colors placeholder:text-content-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25"
          />
          {/* ✅ Clear button when searching */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted transition-colors hover:text-content-primary"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* ✅ UPDATED: Use filteredChats instead of chats */}
        {filteredChats.length > 0 ? (
          <div className="space-y-0.5 px-2 pb-2">
            {filteredChats.map((chat) => {
              const otherUser = !chat.isGroup && chat.participants.find(p => p._id !== userId);
              const isUserOnline = otherUser && onlineUsers[otherUser._id]?.isOnline;
              const isActive = selectedChat?._id === chat._id;
              const chatMuted = mutedIds.includes(String(chat._id));

              return (
                <div
                  key={chat._id}
                  role="button"
                  tabIndex={0}
                  aria-current={isActive ? 'true' : undefined}
                  className={`group flex cursor-pointer items-center rounded-lg px-3 py-3 transition-colors ${
                    isActive
                      ? 'bg-primary-500/12 ring-1 ring-inset ring-primary-500/30'
                      : 'hover:bg-surface-hover'
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedChat(chat);
                      setBarsToHidden(false);
                      handleChatClick(chat);
                    }
                  }}
                  onClick={() => {
                    setSelectedChat(chat);
                    setBarsToHidden(false);
                    handleChatClick(chat);
                  }}>

                  <div className="relative flex-shrink-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-overlay text-content-secondary">
                      {chat.isGroup ? (
                        chat.groupProfile ? (
                          <img
                            src={
                              chat.groupProfile.startsWith('/uploads/')
                                ? `${import.meta.env.VITE_BACKEND_URL}${chat.groupProfile}`
                                : `${import.meta.env.VITE_BACKEND_URL}/uploads/${chat.groupProfile}`
                            }
                            alt={chat.groupName || 'Group'}
                            className="h-11 w-11 rounded-xl object-cover"
                          />
                        ) : (
                          <RxAvatar className="text-xl text-content-muted" />
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
                            className="h-11 w-11 rounded-xl object-cover"
                          />
                        ) : (
                          <RxAvatar className="h-6 w-6 text-content-muted" />
                        )
                      )}
                    </div>

                    {!chat.isGroup && isUserOnline && (
                      <span
                        title="Online"
                        className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface-base bg-success-400"
                      />
                    )}
                  </div>

                  <div className="flex-1 ml-4 min-w-0">
                    <div className="mb-0.5 flex items-baseline justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-[14px] font-semibold text-content-primary">
                          {chat.isGroup
                            ? chat.groupName
                            : chat.participants.find(p => p._id !== userId)?.name || "Unknown User"}
                        </span>
                        {chatMuted && (
                          <BellOff size={12} className="shrink-0 text-content-muted" aria-label="Muted" />
                        )}
                      </span>
                      <span className="shrink-0 text-[11px] font-medium text-content-muted">
                        {chat.lastMessage?.createdAt
                          ? moment(chat.lastMessage.createdAt).fromNow()
                          : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1 truncate text-[12.5px] text-content-secondary">
                        {
                          chat.lastMessage?.type === 'image' || chat.lastMessage?.type === 'file' ? (
                            /* content holds a URL for these, so printing it raw
                               filled the row with a localhost path. */
                            <span className="flex items-center gap-1.5 text-content-muted">
                              {chat.lastMessage.type === 'image'
                                ? <ImageIcon size={13} />
                                : <FileText size={13} />}
                              {chat.lastMessage?.senderId?._id === userId
                                ? 'You: '
                                : (chat.isGroup && chat.lastMessage?.senderId?.name
                                    ? `${chat.lastMessage.senderId.name}: ` : '')}
                              {chat.lastMessage.type === 'image' ? 'Photo' : 'File'}
                            </span>
                          ) : chat.lastMessage?.senderId?._id === userId ? (
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
                            <>
                              {chat.lastMessage.type === 'audio' ? (
                                <span className="flex items-center gap-1 text-gray-200">
                                  <MdOutlineKeyboardVoice size={14} />
                                  {chat.isGroup && chat.lastMessage?.senderId?.name
                                    ? `${chat.lastMessage.senderId.name}: ` : ''}
                                  Voice message
                                </span>
                              ) : (
                                <span className="flex  gap-1 text-white font-bold ">
                                  {chat.isGroup && chat.lastMessage?.senderId?.name && (
                                    <span className="text-gray-300 font-normal ">
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

                      {chat.unreadCount > 0 && (
                        <div className="ml-2 flex-shrink-0">
                          {chatMuted ? (
                            /* Muted means the conversation stops demanding
                               attention, not that it stops being tracked: a
                               quiet dot instead of a count. */
                            <span
                              title={`${chat.unreadCount} unread, muted`}
                              className="block h-2 w-2 rounded-full bg-content-muted"
                            />
                          ) : (
                            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-500 px-1.5 text-[11px] font-bold tabular-nums text-white">
                              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ✅ UPDATED: Different message when searching vs no chats */
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-overlay">
              <RxAvatar className="h-7 w-7 text-content-muted" />
            </div>
            {searchQuery ? (
              <>
                <h3 className="mb-1.5 text-[14px] font-semibold text-content-primary">No results found</h3>
                <p className="text-[13px] text-content-muted">Try searching with a different name</p>
              </>
            ) : (
              <>
                <h3 className="mb-1.5 text-[14px] font-semibold text-content-primary">No conversations yet</h3>
                <p className="text-[13px] text-content-muted">Start a new chat to begin messaging</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="h-4 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default ChatSidebar;