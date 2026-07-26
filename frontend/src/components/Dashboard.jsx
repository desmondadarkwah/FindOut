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
import { FetchAllGroupsContext } from "../Context/FetchAllGroupsContext";
import { useDelete } from "../Context/DeleteGroupContext";
import { ChatContext } from "../Context/ChatContext";
import { RxAvatar } from "react-icons/rx";
import {
  Users,
  Sparkles,
  MessageCircle,
  TrendingUp,
  Plus,
  ShieldCheck,
  Compass,
  ChevronRight,
  Trash2,
} from "lucide-react";
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
    <div className="relative min-h-screen bg-surface-base">
      <MobileViewSuggest />

      <div>
        <MobileViewBar />
      </div>

      <div className="flex">
        <SettingsMenu />
        <DashSidebar />

        {/* Main Content Section */}
        <main className="pb-mobile-nav ml-0 flex-1 p-4 md:ml-60 md:p-8">
          {/* Welcome Section */}
          <section className="card-glass mb-4 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#6366f1] text-lg font-bold text-white">
                {userData.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-extrabold tracking-tight text-content-primary">
                  Welcome back, {userData.name}
                </h1>
                <p className="mt-0.5 text-xs font-medium text-content-muted">
                  Ready to continue your learning journey?
                </p>
              </div>
            </div>

            {/* Metrics. Each tile carries its own icon colour so the numbers are
                scannable at a glance rather than reading as a block of text. */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
              {[
                { value: myGroups.length, label: "Groups joined", Icon: Users, color: "#60a5fa" },
                { value: groupsCreated, label: "Groups created", Icon: Sparkles, color: "#a78bfa" },
                { value: chats.length, label: "Total chats", Icon: MessageCircle, color: "#818cf8" },
                { value: recentChats.length, label: "Active now", Icon: TrendingUp, color: "#4ade80" },
              ].map(({ value, label, Icon, color }) => (
                <div key={label} className="tile-accent px-3.5 py-3">
                  <Icon size={15} style={{ color }} className="mb-1.5" aria-hidden="true" />
                  <div className="text-xl font-extrabold leading-none tabular-nums text-white">
                    {value}
                  </div>
                  <div className="mt-1 text-[11px] font-medium text-content-muted">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <StatusUpdate />

          {/* My Groups Section */}
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <Users size={16} style={{ color: "#818cf8" }} aria-hidden="true" />
              <h2 className="text-[13px] font-bold tracking-tight text-content-primary">
                My groups
              </h2>
              <span className="ml-auto text-xs text-content-muted">
                {myGroups.length} {myGroups.length === 1 ? "group" : "groups"}
              </span>
            </div>

            <div className="card-glass scrollbar-slim max-h-[26rem] overflow-y-auto">
              {myGroups.length > 0 ? (
                <ul className="divide-y divide-white/5">
                  {myGroups.map((group) => (
                    <li
                      key={group._id}
                      className="flex flex-wrap items-center gap-4 px-4 py-3.5 transition-colors hover:bg-white/[0.03]"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-medium text-content-primary">
                          {group.groupName || "Study Group"}
                        </h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-content-muted">
                          <span>{group.members?.length || 0} members</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">
                            {group.subjects?.length > 0
                              ? group.subjects.join(", ")
                              : "General"}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => handleOpenGroupChat(group._id)}
                          className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary-500/15 px-3 py-1.5 text-xs font-semibold text-primary-300 ring-1 ring-inset ring-primary-500/30 transition-all hover:bg-primary-500/25 hover:ring-primary-500/50 active:scale-95"
                        >
                          <MessageCircle size={13} aria-hidden="true" />
                          Open chat
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group._id, group.groupName)}
                          className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-danger-500/10 px-3 py-1.5 text-xs font-semibold text-danger-400 ring-1 ring-inset ring-danger-500/25 transition-all hover:bg-danger-500/20 hover:ring-danger-500/50 active:scale-95"
                        >
                          <Trash2 size={13} aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-6 py-14 text-center">
                  <p className="text-sm text-content-secondary">No groups yet</p>
                  <p className="mt-1 text-xs text-content-muted">
                    Groups you create or join will appear here
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ✅ HYBRID: Recent Chats Section */}
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <MessageCircle size={16} style={{ color: "#60a5fa" }} aria-hidden="true" />
              <h2 className="text-[13px] font-bold tracking-tight text-content-primary">
                Recent chats
              </h2>
              <span className="ml-auto text-xs text-content-muted">
                {recentChats.length} active
              </span>
            </div>

            <div className="card-glass overflow-hidden">
              {recentChats.length > 0 ? (
                <div className="divide-y divide-white/5">
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
                        className="group flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-white/[0.03]">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          {chatInfo.avatar ? (
                            <img
                              src={`${import.meta.env.VITE_BACKEND_URL}${chatInfo.avatar}`}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#6366f1] text-sm font-bold text-white">
                              {chat.isGroup ? (
                                chatInfo.name?.charAt(0).toUpperCase()
                              ) : (
                                <RxAvatar size={20} />
                              )}
                            </div>
                          )}

                          {/* Unread indicator */}
                          {chat.unreadCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#6366f1] px-1 text-[10px] font-bold text-white ring-2 ring-surface-base">
                              {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                            </span>
                          )}
                        </div>

                        {/* Chat Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <h4 className="truncate text-sm font-medium text-content-primary">
                              {chatInfo.name}
                            </h4>
                            <span className="shrink-0 text-xs text-content-muted">
                              {timeAgo}
                            </span>
                          </div>
                          <p
                            className={`mt-0.5 truncate text-xs ${
                              chat.unreadCount > 0
                                ? "font-medium text-content-secondary"
                                : "text-content-muted"
                            }`}>
                            {messagePreview || "No messages yet"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-6 py-14 text-center">
                  <p className="text-sm text-content-secondary">No recent activity</p>
                  <p className="mt-1 text-xs text-content-muted">
                    Chats from the last 48 hours will appear here
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={16} style={{ color: "#a78bfa" }} aria-hidden="true" />
              <h2 className="text-[13px] font-bold tracking-tight text-content-primary">
                Quick actions
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                {
                  label: "Create group",
                  description: "Start a new study group",
                  onClick: () => setShowCreateGroup(true),
                  Icon: Plus,
                  color: "#60a5fa",
                },
                {
                  label: "Get verified",
                  description: "Prove a subject and earn a badge",
                  onClick: () => navigate("/verification"),
                  Icon: ShieldCheck,
                  color: "#4ade80",
                },
                {
                  label: "Explore groups",
                  description: "Discover new communities",
                  onClick: () => navigate("/explore-groups"),
                  Icon: Compass,
                  color: "#a78bfa",
                },
              ].map(({ label, description, onClick, Icon, color }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="card-glass card-glass-hover group flex items-center gap-3.5 p-4 text-left"
                >
                  <span className="tile-accent flex h-10 w-10 shrink-0 items-center justify-center">
                    <Icon size={18} style={{ color }} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-content-primary">
                      {label}
                    </span>
                    <span className="mt-0.5 block text-xs text-content-muted">
                      {description}
                    </span>
                  </span>
                  <ChevronRight
                    size={16}
                    className="shrink-0 text-content-muted opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </section>
        </main>

        {/* Suggested Users Section.

            `backdrop-blur` was removed from this container deliberately. A
            non-none backdrop-filter creates a stacking context, which trapped
            the rail's children in their own layer and let them paint over the
            profile panel. A solid surface achieves the same separation without
            the side effect. */}
        <aside className="hidden w-80 shrink-0 p-5 md:block">
          <div className="sticky top-5">
            <div className="card-glass flex items-center gap-3 p-3.5">
              <UserProfile currentImage={userData.profilePicture} />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-content-primary">
                  {userData.name}
                </span>
                <span className="block truncate text-xs text-content-muted">
                  {Array.isArray(userData.subjects)
                    ? userData.subjects.join(", ")
                    : userData.subjects}
                </span>
              </div>
            </div>

            <div className="card-glass mt-4 p-4">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp size={16} style={{ color: "#818cf8" }} aria-hidden="true" />
                <h2 className="text-[13px] font-bold tracking-tight text-content-primary">
                  Suggested for you
                </h2>
              </div>
              <Suggestions />
            </div>

            <p className="tile-accent mt-4 p-3 text-[11px] leading-relaxed text-content-muted">
              Not seeing the right people? Update your subjects and availability
              to improve matches.
            </p>
          </div>
        </aside>
      </div>

      {openManageUser && <ManageUser />}

      {showCreateGroup && (
        <div className="fixed inset-0 z-dialog flex items-center justify-center bg-surface-sunken/80 p-4 backdrop-blur-sm">
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