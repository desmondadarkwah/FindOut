import React, { useContext, useState } from "react";
import {
  FiBellOff,
  FiFileText,
  FiLock,
  FiArchive,
  FiTrash2,
  FiUserX,
  FiAlertTriangle,
  FiSearch,
  FiStar,
} from "react-icons/fi";
import { ChatContext } from "../Context/ChatContext";

const IndividualChatOptions = () => {
  const { setShowGroupOptions } = useContext(ChatContext);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  const handleDeleteChat = () => {
    // Implement delete chat logic
    console.log("Deleting chat");
    setShowDeleteConfirm(false);
    setShowGroupOptions(false);
    // Add your API call here
  };

  const handleBlockUser = () => {
    // Implement block user logic
    console.log("Blocking user");
    setShowBlockConfirm(false);
    setShowGroupOptions(false);
    // Add your API call here
  };

  const handleAction = (action) => {
    console.log(`Action: ${action}`);
    setShowGroupOptions(false);
    // Implement each action here
  };

  return (
    <>
      <div className="absolute w-56 flex flex-col gap-1 right-0 top-10 bg-gray-950 p-3 shadow-lg rounded-md border border-gray-800 z-50">
        <h3 className="text-lg font-semibold text-gray-200 mb-1">Chat Options</h3>

        <span
          onClick={() => handleAction('view-profile')}
          className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition text-gray-200">
          <FiSearch size={18} className="mr-2" /> View Profile
        </span>

        <span
          onClick={() => handleAction('search-messages')}
          className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition text-gray-200">
          <FiSearch size={18} className="mr-2" /> Search Messages
        </span>

        <span
          onClick={() => handleAction('mute-notifications')}
          className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition text-gray-200">
          <FiBellOff size={18} className="mr-2" /> Mute Notifications
        </span>

        <span
          onClick={() => handleAction('media-files')}
          className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition text-gray-200">
          <FiFileText size={18} className="mr-2" /> Media & Files
        </span>

        <span
          onClick={() => handleAction('starred-messages')}
          className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition text-gray-200">
          <FiStar size={18} className="mr-2" /> Starred Messages
        </span>

        <span
          onClick={() => handleAction('privacy-settings')}
          className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition text-gray-200">
          <FiLock size={18} className="mr-2" /> Privacy Settings
        </span>

        <span
          onClick={() => handleAction('archive-chat')}
          className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition text-gray-200">
          <FiArchive size={18} className="mr-2" /> Archive Chat
        </span>

        {/* Divider */}
        <div className="border-t border-gray-700 my-1"></div>

        <span
          onClick={() => handleAction('report')}
          className="flex items-center cursor-pointer border border-yellow-600 text-yellow-500 p-2 rounded hover:bg-yellow-900/20 transition">
          <FiAlertTriangle size={18} className="mr-2" /> Report User
        </span>

        <span
          onClick={() => setShowBlockConfirm(true)}
          className="flex items-center cursor-pointer border border-orange-600 text-orange-500 p-2 rounded hover:bg-orange-900/20 transition">
          <FiUserX size={18} className="mr-2" /> Block User
        </span>

        <span
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center cursor-pointer border border-red-600 text-red-500 p-2 rounded hover:bg-red-700/20 transition">
          <FiTrash2 size={18} className="mr-2" /> Delete Chat
        </span>
      </div>

      {/* Block User Confirmation Modal */}
      {showBlockConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60]">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-white text-lg font-semibold mb-3">Block User?</h3>
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
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-200"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Chat Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60]">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-white text-lg font-semibold mb-3">Delete Chat?</h3>
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
    </>
  );
};

export default IndividualChatOptions;