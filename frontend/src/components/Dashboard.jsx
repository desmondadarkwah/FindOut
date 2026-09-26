import React, { useContext, useEffect, useState } from "react";
import UserProfile from "./UserProfile";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiUserCheck, FiCompass, FiTrash2, FiMessageCircle, FiChevronRight } from "react-icons/fi";
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

  // Fetch groups
  useEffect(() => {
    fetchAllGroups();
  }, []);

  // Fetch chats for Dashboard
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axiosInstance.get("/api/chats");
        setChats(response.data.chats);
      } catch (error) {
        console.error("Error fetching chats in Dashboard:", error);
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
  // OPEN ANY CHAT (DM or Group)
  // ─────────────────────────────────────────
  const handleOpenChat = (chat) => {
    setSelectedChat(chat);
    navigate("/inbox");
  };

  // ─────────────────────────────────────────
  // HYBRID: Last 48 Hours + Unread Priority
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
  // GET CHAT DISPLAY INFO
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

  const quickActions = [
    {
      label: 'Create Group',
      description: 'Start a new study group',
      icon: FiPlus,
      onClick: () => setShowCreateGroup(true),
    },
    {
      label: 'Get Verified',
      description: 'Take quick quizzes to verify your subjects and stand out',
      icon: FiUserCheck,
      onClick: () => navigate('/verification'),
    },
    {
      label: 'Explore Groups',
      description: 'Discover new communities',
      icon: FiCompass,
      onClick: () => navigate('/explore-groups'),
    },
  ];

  return (
    <div className="relative bg-[var(--bg-primary)] min-h-screen">
      <MobileViewSuggest />

      <div>
        <MobileViewBar />
      </div>

      <div className="flex">
        <SettingsMenu />
        <DashSidebar />

        {/* Main Content Section */}
        <main className="flex-1 p-4 md:p-6 md:pt-20 text-[var(--text-primary)] mb-5 sm:mb-0">
          {/* Welcome Section */}
          <section className="p-6 mb-8 bg-[var(--bg-card)] rounded-xl border border-[var(--border)]">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-[#6366f1] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-semibold text-white">
                  {userData.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
                  Welcome back, {userData.name}!
                </h1>
                <p className="text-[var(--text-secondary)]">Ready to continue your learning journey?</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg p-4 text-center">
                <p className="text-2xl font-semibold text-[var(--text-primary)]">{myGroups.length}</p>
                <p className="text-sm text-[var(--text-secondary)]">Groups Joined</p>
              </div>
              <div className="bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg p-4 text-center">
                <p className="text-2xl font-semibold text-[var(--text-primary)]">{groupsCreated}</p>
                <p className="text-sm text-[var(--text-secondary)]">Groups Created</p>
              </div>
              <div className="bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg p-4 text-center">
                <p className="text-2xl font-semibold text-[var(--text-primary)]">{chats.length}</p>
                <p className="text-sm text-[var(--text-secondary)]">Total Chats</p>
              </div>
            </div>
          </section>

          <StatusUpdate />

          {/* My Groups Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                My Groups
              </h2>
              <span className="text-sm text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border)] px-3 py-1 rounded-full">
                {myGroups.length} groups
              </span>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
              <div className="max-h-80 overflow-y-auto">
                {myGroups.length > 0 ? (
                  <div className="space-y-3">
                    {myGroups.map((group) => (
                      <div
                        key={group._id}
                        className="bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg p-5 hover:border-[var(--border-hover)] transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-[var(--text-primary)] text-base mb-2">
                              {group.groupName || "Study Group"}
                            </h3>
                            <div className="flex flex-wrap gap-2 text-sm">
                              <span className="bg-[var(--bg-card)] text-[var(--text-secondary)] px-3 py-1 rounded-full border border-[var(--border)]">
                                {group.members?.length || 0} members
                              </span>
                              <span className="bg-[var(--bg-card)] text-[var(--text-secondary)] px-3 py-1 rounded-full border border-[var(--border)]">
                                {group.subjects?.length > 0 ? group.subjects.join(", ") : "General"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDeleteGroup(group._id, group.groupName)}
                            className="px-4 py-2 text-sm text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg hover:bg-[#ef4444]/20 transition-colors flex items-center gap-2">
                            <FiTrash2 size={14} />
                            Delete
                          </button>
                          <button
                            onClick={() => handleOpenGroupChat(group._id)}
                            className="px-4 py-2 text-sm text-[#818cf8] bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-lg hover:bg-[#6366f1]/20 transition-colors flex items-center gap-2">
                            <FiMessageCircle size={14} />
                            Go to Chat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-[var(--text-secondary)] mb-1">No groups created yet</p>
                    <p className="text-sm text-[var(--text-muted)]">Groups you create will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Recent Chats Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Recent Chats
              </h2>
              <span className="text-sm text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border)] px-3 py-1 rounded-full">
                {recentChats.length} active
              </span>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
              {recentChats.length > 0 ? (
                <div className="space-y-2">
                  {recentChats.map((chat) => {
                    const chatInfo = getChatInfo(chat);
                    const lastMessage = chat.lastMessage;
                    const timeAgo = lastMessage?.createdAt
                      ? moment(lastMessage.createdAt).fromNow()
                      : "";

                    let messagePreview = "";
                    if (lastMessage) {
                      if (lastMessage.type === "audio") {
                        messagePreview = "Voice message";
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
                        className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer group">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            {chatInfo.avatar ? (
                              <img
                                src={`${import.meta.env.VITE_BACKEND_URL}${chatInfo.avatar}`}
                                alt={chatInfo.name}
                                className="w-11 h-11 rounded-full object-cover border border-[var(--border)]"
                              />
                            ) : (
                              <div className="w-11 h-11 bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-full flex items-center justify-center">
                                {chat.isGroup ? (
                                  <span className="text-[var(--text-primary)] font-semibold">
                                    {chatInfo.name?.charAt(0).toUpperCase()}
                                  </span>
                                ) : (
                                  <RxAvatar size={20} className="text-[var(--text-secondary)]" />
                                )}
                              </div>
                            )}

                            {/* Unread indicator */}
                            {chat.unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#6366f1] rounded-full flex items-center justify-center border-2 border-[var(--bg-card)]">
                                <span className="text-white text-xs font-semibold">
                                  {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Chat Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <h4 className="font-medium text-[var(--text-primary)] truncate">
                                {chatInfo.name}
                              </h4>
                              <span className="text-xs text-[var(--text-muted)] flex-shrink-0 ml-2">
                                {timeAgo}
                              </span>
                            </div>
                            <p className={`text-sm truncate ${
                              chat.unreadCount > 0 ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-secondary)]"
                            }`}>
                              {messagePreview || "No messages yet"}
                            </p>
                          </div>
                        </div>

                        <FiChevronRight size={16} className="ml-3 flex-shrink-0 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-[var(--text-secondary)] mb-1">No recent activity</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Chats from the last 48 hours will appear here
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className="p-5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] transition-colors text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon size={18} className="text-[#818cf8]" />
                      <span className="font-medium text-[var(--text-primary)]">
                        {action.label}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{action.description}</p>
                  </button>
                );
              })}
            </div>
          </section>
        </main>

        {/* Suggested Users Section */}
        <div className="p-6 w-80 hidden md:block bg-[var(--bg-secondary)] border-l border-[var(--border)]">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-6 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)]">
              <div className="flex items-center space-x-3">
                <UserProfile currentImage={userData.profilePicture} />
                <div>
                  <span className="font-semibold text-[var(--text-primary)] text-sm block">
                    {userData.name}
                  </span>
                  <span className="text-[var(--text-muted)] text-xs">{userData.subjects}</span>
                </div>
              </div>
              <button className="text-[#818cf8] text-sm hover:opacity-80 transition-opacity">
                Switch
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Suggested for you</span>
              <button className="text-[#818cf8] text-sm hover:opacity-80 transition-opacity">
                See All
              </button>
            </div>

            <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)]">
              <Suggestions />
            </div>

            <div className="mt-6 p-4 bg-[#eab308]/10 border border-[#eab308]/20 rounded-lg">
              <p className="text-[#eab308] text-xs leading-relaxed">
                Not satisfied with suggestions? Update your status for better matches.
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