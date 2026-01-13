import React, { useState, useContext } from "react";
import { IoClose } from "react-icons/io5";
import { SettingsContext } from "../Context/SettingsContext";
import { ChatContext } from "../Context/ChatContext";
import { RxAvatar } from "react-icons/rx";
import { MdBlock, MdReport, MdNotifications, MdDelete } from "react-icons/md";
import { BsShieldCheck } from "react-icons/bs";

const ManageIndividual = () => {
  const { selectedChat, userId } = useContext(ChatContext);
  const { openGroupManager, setOpenGroupManager } = useContext(SettingsContext);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [muteNotifications, setMuteNotifications] = useState(false);

  // Get the other participant (not the current user)
  const otherParticipant = selectedChat?.participants?.find(p => p._id !== userId);

  const handleBlockUser = () => {
    // Implement block user logic
    console.log("Blocking user:", otherParticipant?._id);
    setShowBlockConfirm(false);
    setOpenGroupManager(false);
    // Add your API call here
  };

  const handleDeleteChat = () => {
    // Implement delete chat logic
    console.log("Deleting chat:", selectedChat?._id);
    setShowDeleteConfirm(false);
    setOpenGroupManager(false);
    // Add your API call here
  };

  const handleReportUser = () => {
    // Implement report user logic
    console.log("Reporting user:", otherParticipant?._id);
    alert("Report submitted successfully!");
    // Add your API call here
  };

  const toggleMuteNotifications = () => {
    setMuteNotifications(!muteNotifications);
    // Add your API call here to update notification preferences
  };

  if (!otherParticipant) {
    return null;
  }

  return (
    <div className="fixed right-0 top-0 w-full h-full max-w-[806px] mx-auto flex flex-col items-center bg-gray-950 z-50">
      <span className="cursor-default flex justify-end w-full text-red-500 font-bold">
        <IoClose
          onClick={(e) => {
            e.stopPropagation();
            setOpenGroupManager(false);
          }}
          className="cursor-pointer"
          size={28}
        />
      </span>

      <div className="w-full shadow-lg p-4 bg-gray-950 overflow-y-auto cursor-default">
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {otherParticipant.profilePicture ? (
              <img
                src={
                  otherParticipant.profilePicture.startsWith('/uploads/')
                    ? `${import.meta.env.VITE_BACKEND_URL}${otherParticipant.profilePicture}`
                    : `${import.meta.env.VITE_BACKEND_URL}/uploads/${otherParticipant.profilePicture}`
                }
                alt={otherParticipant.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-700"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center ring-4 ring-gray-700">
                <RxAvatar size={48} className="text-gray-400" />
              </div>
            )}
            {/* Online status indicator */}
            <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-gray-950"></div>
          </div>

          <h2 className="text-white text-xl font-bold mt-4">{otherParticipant.name}</h2>
          <p className="text-gray-400 text-sm">{otherParticipant.status || "Available"}</p>
        </div>

        {/* User Info Section */}
        <div className="bg-gray-900/50 rounded-xl p-4 mb-4 border border-gray-800">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <BsShieldCheck className="text-blue-400" />
            Contact Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Email</span>
              <span className="text-white">{otherParticipant.email || "Not available"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Phone</span>
              <span className="text-white">{otherParticipant.phone || "Not available"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Member since</span>
              <span className="text-white">
                {otherParticipant.createdAt 
                  ? new Date(otherParticipant.createdAt).toLocaleDateString()
                  : "Recently"}
              </span>
            </div>
          </div>
        </div>

        {/* Privacy & Safety Section */}
        <div className="bg-gray-900/50 rounded-xl p-4 mb-4 border border-gray-800">
          <h3 className="text-white font-semibold mb-3">Privacy & Safety</h3>
          
          {/* Mute Notifications Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg mb-3 hover:bg-gray-800/70 transition-colors">
            <div className="flex items-center gap-3">
              <MdNotifications className="text-gray-400" size={20} />
              <div>
                <p className="text-white text-sm font-medium">Mute Notifications</p>
                <p className="text-gray-500 text-xs">Turn off notifications for this chat</p>
              </div>
            </div>
            <button
              onClick={toggleMuteNotifications}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                muteNotifications ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  muteNotifications ? 'transform translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* Block User */}
          <button
            onClick={() => setShowBlockConfirm(true)}
            className="w-full flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg mb-3 hover:bg-red-900/20 transition-colors text-left group"
          >
            <MdBlock className="text-red-400 group-hover:text-red-300" size={20} />
            <div>
              <p className="text-white text-sm font-medium group-hover:text-red-300">Block User</p>
              <p className="text-gray-500 text-xs">They won't be able to message you</p>
            </div>
          </button>

          {/* Report User */}
          <button
            onClick={handleReportUser}
            className="w-full flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-yellow-900/20 transition-colors text-left group"
          >
            <MdReport className="text-yellow-400 group-hover:text-yellow-300" size={20} />
            <div>
              <p className="text-white text-sm font-medium group-hover:text-yellow-300">Report User</p>
              <p className="text-gray-500 text-xs">Report suspicious or harmful behavior</p>
            </div>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-900/10 rounded-xl p-4 border border-red-900/30">
          <h3 className="text-red-400 font-semibold mb-3">Danger Zone</h3>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 p-3 bg-red-900/20 rounded-lg hover:bg-red-900/30 transition-colors text-left group"
          >
            <MdDelete className="text-red-400" size={20} />
            <div>
              <p className="text-red-400 text-sm font-medium">Delete Conversation</p>
              <p className="text-gray-500 text-xs">This action cannot be undone</p>
            </div>
          </button>
        </div>
      </div>

      {/* Block Confirmation Modal */}
      {showBlockConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60]">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-white text-lg font-semibold mb-3">Block {otherParticipant.name}?</h3>
            <p className="text-gray-400 text-sm mb-6">
              They won't be able to message you or see when you're online. You can unblock them later from settings.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition duration-200 border border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60]">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-white text-lg font-semibold mb-3">Delete Conversation?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This will permanently delete all messages in this conversation. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition duration-200 border border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChat}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageIndividual;