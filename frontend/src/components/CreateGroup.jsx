import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";

const CreateGroup = ({ setShowCreateGroup }) => {
  const [groupData, setGroupData] = useState({
    groupName: '',
    subjects: '',
    description: '',
    groupProfile: ''
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);

  const handleImageChange = (newImage) => {
    setImage(newImage);
  };

  const handleClose = () => {
    setShowCreateGroup(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroupData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    console.log('Form submitted:', groupData);
    setSuccess('Group created successfully!');
    setTimeout(() => {
      setShowCreateGroup(false);
    }, 2000);
  };

  return (
    <div className="relative w-full max-w-md mx-auto max-h-[90vh] bg-gradient-to-br from-gray-900 via-black to-gray-800 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      {/* Header - Fixed */}
      <div className="relative bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-6 border-b border-gray-700/50 flex-shrink-0">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/50 border border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50 transition-all duration-200 group z-10"
        >
          <IoClose className="text-gray-400 group-hover:text-white transition-colors" size={20} />
        </button>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-3">
            <span className="text-xl">👥</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Create a Group
          </h2>
          <p className="text-gray-400 text-sm mt-1">Start building your learning community</p>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <div className="p-6">
          {/* Status Messages */}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm text-center">✅ {success}</p>
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm text-center">❌ {error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Group Profile Image */}
            <div className="flex flex-col items-center space-y-3">
              <label htmlFor="group-file-input" className="cursor-pointer group">
                <div className="relative">
                  {image ? (
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Group Profile"
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-600/50 group-hover:border-blue-500/50 transition-all duration-200"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-700/50 to-gray-800/50 backdrop-blur-sm border-4 border-gray-600/50 group-hover:border-blue-500/50 rounded-full flex items-center justify-center transition-all duration-200">
                      <RxAvatar size={32} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 border-2 border-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">+</span>
                  </div>
                </div>
              </label>
              <p className="text-gray-400 text-xs text-center">Click to upload group photo</p>
            </div>

            <input
              type="file"
              id="group-file-input"
              hidden
              onChange={(e) => handleImageChange(e.target.files[0])}
            />

            {/* Group Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 flex items-center space-x-2">
                <span>👥</span>
                <span>Group Name</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="groupName"
                  value={groupData.groupName}
                  onChange={handleChange}
                  placeholder="Enter group name"
                  className="w-full p-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 placeholder-gray-400"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity duration-200"></div>
              </div>
            </div>

            {/* Subjects */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 flex items-center space-x-2">
                <span>📚</span>
                <span>Subjects</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="subjects"
                  value={groupData.subjects}
                  onChange={handleChange}
                  placeholder="Enter subjects (comma-separated)"
                  className="w-full p-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 placeholder-gray-400"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/5 to-blue-500/5 pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity duration-200"></div>
              </div>
              <p className="text-gray-500 text-xs">Example: Math, Physics, Chemistry</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 flex items-center space-x-2">
                <span>📝</span>
                <span>Description</span>
              </label>
              <div className="relative">
                <textarea
                  name="description"
                  value={groupData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your group..."
                  className="w-full p-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 placeholder-gray-400 resize-none"
                  rows="3"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity duration-200"></div>
              </div>
              <p className="text-gray-500 text-xs">Optional: Share the group's purpose and goals</p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <span>✨</span>
              <span>Create Group</span>
            </button>
          </div>

          {/* Info Card */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-200/80 text-xs leading-relaxed text-center">
              💡 Your group will be visible to others once created. You'll become the group admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;