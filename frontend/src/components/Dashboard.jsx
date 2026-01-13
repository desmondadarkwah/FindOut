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

const Dashboard = () => {
  const navigate = useNavigate()
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const { userData, loading } = useContext(ProfileContext)
  const { openManageUser } = useContext(SettingsContext);
  const { myGroups, fetchAllGroups } = useContext(FetchAllGroupsContext)
  const { handleDeleteGroup } = useDelete();
  const { setChats ,setSelectedChat} = useContext(ChatContext); 

  useEffect(() => {
    fetchAllGroups()
  }, []);

// In Dashboard.jsx, replace the handleConnectPrivateChat function with this:

const handleOpenGroupChat = async (groupId) => {
  try {
    console.log('Opening group chat for groupId:', groupId);
    
    // Fetch all chats (which includes all your group chats with populated data)
    const allChatsResponse = await axiosInstance.get("/api/chats");
    const allChats = allChatsResponse.data.chats;
    
    console.log('All chats fetched:', allChats);
    
    // Find the group chat by matching the groupId
    const groupChat = allChats.find(chat => chat._id === groupId);
    
    if (groupChat) {
      console.log('Found group chat:', groupChat);
      
      // Set this group as the selected chat
      setSelectedChat(groupChat);
      
      // Add to chats array if not already there
      setChats((prevChats) => {
        const chatExists = prevChats.some(chat => chat._id === groupChat._id);
        if (chatExists) {
          return prevChats; // Already in the list
        }
        return [...prevChats, groupChat]; // Add to the list
      });
      
      // Navigate to inbox
      navigate("/inbox");
    } else {
      console.error('Could not find the group chat with id:', groupId);
    }
  } catch (error) {
    console.error("Error opening group chat:", error);
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
                  <p className="text-2xl font-bold text-green-400">Y</p>
                  <p className="text-sm text-gray-300">Total Members</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-400">Z</p>
                  <p className="text-sm text-gray-300">Active Chats</p>
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
                      {myGroups.map(group => (
                        <div key={group._id} className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-gray-600/30 rounded-lg p-5 hover:shadow-lg transition-all duration-300 hover:border-blue-500/30">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white text-lg mb-2">{group.groupName || 'Study Group'}</h3>
                              <div className="flex flex-wrap gap-3 text-sm">
                                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                                  👥 {group.members.length} members
                                </span>
                                <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full border border-green-500/30">
                                  📚 {group.subjects.join(', ') || 'General'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => handleDeleteGroup(group._id)}
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

            {/* Recent Chats Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <span className="w-1 h-8 bg-gradient-to-b from-green-500 to-blue-600 rounded-full mr-3"></span>
                  Recent Chats
                </h2>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-900/60 to-gray-800/60 rounded-lg border border-gray-600/30 hover:border-blue-500/30 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">U</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">User/Group Name</h4>
                      <p className="text-sm text-gray-400">Last message preview...</p>
                    </div>
                  </div>
                  <button className="px-6 py-2 text-sm font-medium text-white bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 hover:border-blue-500/50 transition-all duration-200">
                    Continue Chat
                  </button>
                </div>
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
                    <span className="font-semibold text-white group-hover:text-blue-300">Create Group</span>
                  </div>
                  <p className="text-sm text-gray-400">Start a new study group</p>
                </button>

                <button className="group p-6 bg-gradient-to-r from-green-600/20 to-green-700/20 border border-green-500/30 rounded-xl hover:from-green-600/30 hover:to-green-700/30 hover:border-green-400/50 transition-all duration-300 text-left">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">🤝</span>
                    <span className="font-semibold text-white group-hover:text-green-300">Join Group</span>
                  </div>
                  <p className="text-sm text-gray-400">Find existing groups</p>
                </button>

                <button className="group p-6 bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-xl hover:from-purple-600/30 hover:to-purple-700/30 hover:border-purple-400/50 transition-all duration-300 text-left">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">🔍</span>
                    <span className="font-semibold text-white group-hover:text-purple-300">Explore Groups</span>
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
                  <span className="font-semibold text-white text-sm block">{userData.name}</span>
                  <span className="text-gray-400 text-xs">{userData.subjects}</span>
                </div>
              </div>
              <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">Switch</button>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-gray-300">Suggested for you</span>
              <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">See All</button>
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