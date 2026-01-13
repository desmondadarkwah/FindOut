import React, { useState, useContext } from "react";
import UserProfile from "./UserProfile";
import { useEditUser } from "../Context/EditUserContext";
import { IoClose } from "react-icons/io5";
import { SettingsContext } from "../Context/SettingsContext";

const ManageUser = () => {
  const { userData, editUserDetails, fetchUserDetails } = useEditUser();
  const { setOpenManageUser } = useContext(SettingsContext);

  const [subject, setSubject] = useState(userData.subject);
  const [status, setStatus] = useState(userData.status);
  const [allowUpload, setAllowUploads] = useState(false);
  const [changePhoto, setChangePhoto] = useState(false);

  const handleChangePhotoClick = () => {
    setAllowUploads(true);
    document.getElementById("file-input").click();
  };

  const handleSaveChanges = async () => {
    const updates = {
      subjects: subject,
      status: status
    };

    await editUserDetails(updates);
    fetchUserDetails();
    alert("Profile updated successfully!");
    setOpenManageUser(false);
  };

  return (
    <div className="fixed right-0 top-0 w-full h-full md:w-1/3 md:h-full flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800 backdrop-blur-xl border-l border-gray-700/50 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Manage Profile
        </h1>
        <button
          onClick={() => setOpenManageUser(false)}
          className="p-2 rounded-full bg-gray-800/50 border border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50 transition-all duration-200 group"
        >
          <IoClose className="text-gray-400 group-hover:text-white transition-colors" size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto">
          {/* Profile Section */}
          <div className="relative mb-8">
            <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <UserProfile allowUpload={allowUpload} />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-gray-900 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{userData.name}</h2>
                    <p className="text-gray-400 text-sm">{status}</p>
                  </div>
                </div>
                <button
                  onClick={() => setChangePhoto(true)}
                  className="px-4 py-2 text-sm font-medium text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-200"
                >
                  Change Photo
                </button>
              </div>

              {/* Change Photo Menu */}
              {changePhoto && (
                <div className="absolute top-full left-6 right-6 mt-2 bg-gray-900/95 backdrop-blur-lg border border-gray-600/50 rounded-xl p-4 shadow-2xl z-10">
                  <div className="space-y-3">
                    <button
                      onClick={handleChangePhotoClick}
                      className="w-full text-left px-4 py-3 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200 flex items-center space-x-3"
                    >
                      <span>📁</span>
                      <span>Upload Photo</span>
                    </button>
                    <button className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 flex items-center space-x-3">
                      <span>🗑️</span>
                      <span>Remove Current Photo</span>
                    </button>
                    <button
                      onClick={() => setChangePhoto(false)}
                      className="w-full text-left px-4 py-3 text-gray-400 hover:bg-gray-500/10 rounded-lg transition-all duration-200 flex items-center space-x-3"
                    >
                      <span>❌</span>
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Subject Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 flex items-center space-x-2">
                <span>📚</span>
                <span>Subject</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter your subjects"
                  className="w-full p-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 placeholder-gray-400"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity duration-200"></div>
              </div>
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 flex items-center space-x-2">
                <span>✏️</span>
                <span>Bio</span>
              </label>
              <div className="relative">
                <textarea
                  placeholder="Tell us about yourself..."
                  className="w-full p-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 placeholder-gray-400 resize-none"
                  rows="4"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/5 to-blue-500/5 pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity duration-200"></div>
              </div>
              <p className="text-gray-500 text-xs flex justify-between">
                <span>Share your interests and goals</span>
                <span>2/150</span>
              </p>
            </div>

            {/* Status Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 flex items-center space-x-2">
                <span>🎯</span>
                <span>Status</span>
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="Later">📅 Later</option>
                  <option value="Ready To Teach">👨‍🏫 Ready To Teach</option>
                  <option value="Ready To Learn">🎓 Ready To Learn</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity duration-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
        <button
          onClick={handleSaveChanges}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
        >
          <span>💾</span>
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

export default ManageUser;