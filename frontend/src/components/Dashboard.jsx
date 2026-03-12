import React, { useContext, useEffect, useState } from "react";
import UserProfile from "./UserProfile";
import { useNavigate } from "react-router-dom";
import CreateGroup from "./CreateGroup";
import MobileViewIcons from "./MobileViewIcons";
import MobileViewBar from "./MobileViewBar";
import Suggestions from "./Suggestions";
import StatusUpdate from "./StatusUpdate";
import DashSidebar from "./DashSidebar";
import SettingsMenu from "./SettingsMenu";
import { ProfileContext } from "../Context/ProfileContext";
import ManageUser from "./ManageUser";
import { SettingsContext } from "../Context/SettingsContext";
import MobileViewSuggest from "./MobileViewSuggest";
import axiosInstance from "../utils/axiosInstance";
import { FetchAllGroupsContext } from "../Context/fetchAllGroupsContext";
import { useDelete } from "../Context/DeleteGroupContext";
import { ChatContext } from "../Context/ChatContext";
import { RxAvatar } from "react-icons/rx";
import moment from "moment";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const { userData, loading } = useContext(ProfileContext);
  const { openManageUser } = useContext(SettingsContext);
  const { myGroups, fetchAllGroups } = useContext(FetchAllGroupsContext);
  const { handleDeleteGroup } = useDelete();
  const { chats, setChats, setSelectedChat, userId } = useContext(ChatContext);

  // ✅ Fetch groups
  useEffect(() => {
    fetchAllGroups();
  }, []);

  // ✅ Fetch chats for Dashboard
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axiosInstance.get("/api/chats");
        setChats(response.data.chats);
        console.log('✅ Dashboard fetched chats:', response.data.chats.length);
      } catch (error) {
        console.error("❌ Error fetching chats in Dashboard:", error);
      }
    };

    fetchChats();
  }, [setChats]);

  const groupsCreated = myGroups.filter(
    (group) => group.groupAdmin === userData._id
  ).length;

  // ─────────────────────────────────────────
  // OPEN GROUP CHAT
  // ─────────────────────────────────────────
  const handleOpenGroupChat = async (groupId) => {
    try {
      const allChatsResponse = await axiosInstance.get("/api/chats");
      const allChats = allChatsResponse.data.chats;

      const groupChat = allChats.find((chat) => chat._id === groupId);

      if (groupChat) {
        setSelectedChat(groupChat);

        setChats((prevChats) => {
          const chatExists = prevChats.some((chat) => chat._id === groupChat._id);
          if (chatExists) return prevChats;
          return [...prevChats, groupChat];
        });

        navigate("/inbox");
      } else {
        console.error("Could not find the group chat with id:", groupId);
      }
    } catch (error) {
      console.error("Error opening group chat:", error);
    }
  };

  // ─────────────────────────────────────────
  // ✅ OPEN ANY CHAT (DM or Group)
  // ─────────────────────────────────────────
  const handleOpenChat = (chat) => {
    setSelectedChat(chat);
    navigate("/inbox");
  };

  // ─────────────────────────────────────────
  // ✅ HYBRID: Last 48 Hours + Unread Priority
  // ─────────────────────────────────────────
  const recentChats = chats
    .filter((chat) => {
      if (!chat.lastMessage) return false;

      // Only show chats from last 48 hours
      const messageTime = new Date(chat.lastMessage.createdAt);
      const now = new Date();
      const hoursDiff = (now - messageTime) / (1000 * 60 * 60);

      return hoursDiff <= 48;
    })
    .sort((a, b) => {
      // 1. Unread chats first
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (b.unreadCount > 0 && a.unreadCount === 0) return 1;

      // 2. Then by most recent
      const aTime = a.lastMessage?.createdAt || a.createdAt;
      const bTime = b.lastMessage?.createdAt || b.createdAt;
      return new Date(bTime) - new Date(aTime);
    })
    .slice(0, 5); // Max 5

  // ─────────────────────────────────────────
  // ✅ GET CHAT DISPLAY INFO
  // ─────────────────────────────────────────
  const getChatInfo = (chat) => {
    if (chat.isGroup) {
      return {
        name: chat.groupName,
        avatar: chat.groupProfile,
        isOnline: false,
      };
    } else {
      const otherUser = chat.participants?.find((p) => p._id !== userId);
      return {
        name: otherUser?.name || "Unknown User",
        avatar: otherUser?.profilePicture,
        isOnline: false,
      };
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen">
      <MobileViewSuggest />

      <div>
        <MobileViewBar />
      </div>

      <div className="flex">
        <SettingsMenu />
        <DashSidebar />

        {/* Main Content Section */}
        <main className="flex-1 p-4 md:p-6 bg-gradient-to-b from-gray-900/50 to-transparent text-white mb-5 sm:mb-0 ml-0 md:ml-60">
          {/* Welcome Section */}
          <section className="p-6 mb-8 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {userData.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Welcome back, {userData.name}!
                </h1>
                <p className="text-gray-400">Ready to continue your learning journey?</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-400">{myGroups.length}</p>
                <p className="text-sm text-gray-300">Groups Joined</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-400">{groupsCreated}</p>
                <p className="text-sm text-gray-300">Groups Created</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-purple-400">{chats.length}</p>
                <p className="text-sm text-gray-300">Total Chats</p>
              </div>
            </div>
          </section>

          <StatusUpdate />

          {/* My Groups Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-3"></span>
                My Groups
              </h2>
              <span className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                {myGroups.length} groups
              </span>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-xl">
              <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {myGroups.length > 0 ? (
                  <div className="space-y-4">
                    {myGroups.map((group) => (
                      <div
                        key={group._id}
                        className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-gray-600/30 rounded-lg p-5 hover:shadow-lg transition-all duration-300 hover:border-blue-500/30">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-lg mb-2">
                              {group.groupName || "Study Group"}
                            </h3>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                                👥 {group.members?.length || 0} members
                              </span>
                              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full border border-green-500/30">
                                📚 {group.subjects?.length > 0 ? group.subjects.join(", ") : "General"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDeleteGroup(group._id, group.groupName)}
                            className="px-4 py-2 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200 flex items-center gap-2">
                            🗑️ Delete
                          </button>
                          <button
                            onClick={() => handleOpenGroupChat(group._id)}
                            className="px-4 py-2 text-sm text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-200 flex items-center gap-2">
                            💬 Go to Chat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📝</span>
                    </div>
                    <p className="text-gray-400 mb-2">No groups created yet</p>
                    <p className="text-sm text-gray-500">Groups you create will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ✅ HYBRID: Recent Chats Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <span className="w-1 h-8 bg-gradient-to-b from-green-500 to-blue-600 rounded-full mr-3"></span>
                Recent Chats
              </h2>
              <span className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                {recentChats.length} active
              </span>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-xl">
              {recentChats.length > 0 ? (
                <div className="space-y-3">
                  {recentChats.map((chat) => {
                    const chatInfo = getChatInfo(chat);
                    const lastMessage = chat.lastMessage;
                    const timeAgo = lastMessage?.createdAt
                      ? moment(lastMessage.createdAt).fromNow()
                      : "";

                    let messagePreview = "";
                    if (lastMessage) {
                      if (lastMessage.type === "audio") {
                        messagePreview = "🎤 Voice message";
                      } else if (lastMessage.type === "system") {
                        messagePreview = `${lastMessage.senderId?.name || "Someone"} ${lastMessage.content}`;
                      } else {
                        messagePreview = lastMessage.content || "";
                      }
                    }

                    if (messagePreview && messagePreview.length > 50) {
                      messagePreview = messagePreview.substring(0, 50) + "...";
                    }

                    return (
                      <div
                        key={chat._id}
                        onClick={() => handleOpenChat(chat)}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/60 to-gray-800/60 rounded-lg border border-gray-600/30 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            {chatInfo.avatar ? (
                              <img
                                src={`${import.meta.env.VITE_BACKEND_URL}${chatInfo.avatar}`}
                                alt={chatInfo.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-700 group-hover:border-blue-500 transition"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-gray-700 group-hover:border-blue-500 transition">
                                {chat.isGroup ? (
                                  <span className="text-white font-bold text-lg">
                                    {chatInfo.name?.charAt(0).toUpperCase()}
                                  </span>
                                ) : (
                                  <RxAvatar size={24} className="text-white" />
                                )}
                              </div>
                            )}

                            {/* Unread indicator */}
                            {chat.unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-gray-900">
                                <span className="text-white text-xs font-bold">
                                  {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Chat Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-white truncate group-hover:text-blue-300 transition">
                                {chatInfo.name}
                              </h4>
                              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                {timeAgo}
                              </span>
                            </div>
                            <p
                              className={`text-sm truncate ${chat.unreadCount > 0
                                  ? "text-white font-medium"
                                  : "text-gray-400"
                                }`}>
                              {messagePreview || "No messages yet"}
                            </p>
                          </div>
                        </div>

                        {/* Arrow Icon */}
                        <div className="ml-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                          <svg
                            className="w-5 h-5 text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <p className="text-gray-400 mb-2">No recent activity</p>
                  <p className="text-sm text-gray-500">
                    Chats from the last 48 hours will appear here
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mb-8">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <span className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-3"></span>
                Quick Actions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowCreateGroup(true)}
                className="group p-6 bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-xl hover:from-blue-600/30 hover:to-blue-700/30 hover:border-blue-400/50 transition-all duration-300 text-left">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">➕</span>
                  <span className="font-semibold text-white group-hover:text-blue-300">
                    Create Group
                  </span>
                </div>
                <p className="text-sm text-gray-400">Start a new study group</p>
              </button>

              <button className="group p-6 bg-gradient-to-r from-green-600/20 to-green-700/20 border border-green-500/30 rounded-xl hover:from-green-600/30 hover:to-green-700/30 hover:border-green-400/50 transition-all duration-300 text-left">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">🤝</span>
                  <span className="font-semibold text-white group-hover:text-green-300">
                    Join Group
                  </span>
                </div>
                <p className="text-sm text-gray-400">Find existing groups</p>
              </button>

              <button
                onClick={() => navigate('/explore-groups')}
                className="group p-6 bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-xl hover:from-purple-600/30 hover:to-purple-700/30 hover:border-purple-400/50 transition-all duration-300 text-left">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">🔍</span>
                  <span className="font-semibold text-white group-hover:text-purple-300">
                    Explore Groups
                  </span>
                </div>
                <p className="text-sm text-gray-400">Discover new communities</p>
              </button>
            </div>
          </section>
        </main>

        {/* Suggested Users Section */}
        <div className="p-6 w-80 hidden md:block bg-gray-900/30 backdrop-blur-sm border-l border-gray-700/50">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <UserProfile currentImage={userData.profilePicture} />
                <div>
                  <span className="font-semibold text-white text-sm block">
                    {userData.name}
                  </span>
                  <span className="text-gray-400 text-xs">{userData.subjects}</span>
                </div>
              </div>
              <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                Switch
              </button>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-gray-300">Suggested for you</span>
              <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                See All
              </button>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
              <Suggestions />
            </div>

            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-amber-200/80 text-xs leading-relaxed">
                💡 Not satisfied with suggestions? Update your status for better matches.
              </p>
            </div>
          </div>
        </div>
      </div>

      {openManageUser && <ManageUser />}

      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <CreateGroup
            showCreateGroup={showCreateGroup}
            setShowCreateGroup={setShowCreateGroup}
          />
        </div>
      )}

      <div>
        <MobileViewIcons />
      </div>
    </div>
  );
};

export default Dashboard;