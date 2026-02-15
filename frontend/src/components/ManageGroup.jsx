import React, { useState, useContext } from "react";
import { IoClose } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { FaCrown } from "react-icons/fa";
import { RxAvatar } from "react-icons/rx";
import { CiLink } from "react-icons/ci";
import { FiCopy, FiCheck } from "react-icons/fi";
import { SettingsContext } from "../Context/SettingsContext";
import GroupProfile from "./GroupProfile";
import { ChatContext } from "../Context/ChatContext";
import { GroupProfileContext } from "../Context/groupProfileContext";
import { SuggestionsContext } from "../Context/SuggestionsContext";
import axiosInstance from "../utils/axiosInstance";
import { BeatLoader } from "react-spinners";

const ManageGroup = () => {
  const { selectedChat, userId } = useContext(ChatContext);
  const [allowUpload, setAllowUploads] = useState(false);
  const [changePhoto, setChangePhoto] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [copied, setCopied] = useState(false);
  const { openGroupManager, setOpenGroupManager } = useContext(SettingsContext);
  const { setGroupId } = useContext(GroupProfileContext);
  const { handleConnectPrivateChat } = useContext(SuggestionsContext);

  const isAdmin = selectedChat?.groupAdmin?._id === userId || selectedChat?.groupAdmin === userId;
  const members = selectedChat?.members || [];
  const adminId = selectedChat?.groupAdmin?._id || selectedChat?.groupAdmin;

  // Generate invite link
  const inviteLink = selectedChat?.inviteCode 
    ? `${window.location.origin}/join/${selectedChat.inviteCode}`
    : '';

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy link');
    }
  };

  const handleChangePhotoClick = () => {
    setAllowUploads(true);
    setGroupId(selectedChat._id);
    setChangePhoto(false);
    document.getElementById("group-file-input").click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file);
    }
  };

  const handleRemovePhoto = () => {
    setAllowUploads(false);
    setChangePhoto(false);
    setGroupId(selectedChat._id);
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    setRemoving(memberId);
    try {
      const response = await axiosInstance.put('/api/groups/remove-member', {
        groupId: selectedChat._id,
        memberId
      });

      if (response.data.success) {
        alert('Member removed successfully');
      }
    } catch (error) {
      console.error('❌ Error removing member:', error);
      alert(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setRemoving(null);
    }
  };

  const handleMemberClick = (memberId) => {
    if (memberId === userId) return;
    setOpenGroupManager(false);
    handleConnectPrivateChat(memberId);
  };

  return (
    <div className="fixed right-0 top-0 w-full h-full max-w-[806px] mx-auto flex flex-col items-center bg-gray-950 z-50">
      <input
        type="file"
        id="group-file-input"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

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
        {/* Group Profile */}
        <div className="flex flex-col items-center mb-6">
          <div
            onClick={() => setChangePhoto(true)}
            className="flex items-center justify-center rounded cursor-pointer">
            <GroupProfile allowUpload={allowUpload} width="w-24" height="h-24" />
          </div>

          <span className="text-white font-semibold text-lg mt-2">{selectedChat.groupName}</span>
          <span className="text-gray-400 text-sm">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </span>

          {changePhoto && (
            <div className="bg-gray-800 absolute mt-32 p-3 w-64 flex flex-col items-center gap-3 shadow-lg border border-gray-700 rounded-lg z-10">
              <span
                onClick={handleChangePhotoClick}
                className="block text-blue-400 cursor-pointer hover:underline">
                Upload Photo
              </span>
              <span
                onClick={handleRemovePhoto}
                className="block text-red-500 cursor-pointer hover:underline">
                Remove Current Photo
              </span>
              <span
                onClick={() => setChangePhoto(false)}
                className="block text-gray-300 cursor-pointer hover:underline">
                Cancel
              </span>
            </div>
          )}
        </div>

        {/* ✅ UPDATED: Clickable Invite Link */}
        {inviteLink && (
          <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium text-sm">Group Invite Link</span>
              <CiLink size={20} className="text-gray-500" />
            </div>
                        
            <a href={inviteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-gray-800 text-blue-500 rounded-lg mb-3 text-sm hover:bg-gray-700 transition break-all border border-gray-700">
              {inviteLink}
            </a>

            <button
              onClick={handleCopyLink}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center gap-2">
              {copied ? (
                <>
                  <FiCheck size={18} />
                  <span className="font-medium">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <FiCopy size={18} />
                  <span className="font-medium">Copy Invite Link</span>
                </>
              )}
            </button>

            <p className="text-gray-500 text-xs mt-3 text-center">
              Click link to test • Copy to share with others
            </p>
          </div>
        )}

        {/* Members Section */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            Members
            <span className="text-gray-400 text-sm">({members.length})</span>
          </h3>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {members.map((member) => {
              const memberId = member._id || member;
              const isGroupAdmin = memberId === adminId;
              const isCurrentUser = memberId === userId;
              const isRemoving = removing === memberId;

              return (
                <div
                  key={memberId}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition border border-gray-700">
                  <div
                    onClick={() => !isCurrentUser && handleMemberClick(memberId)}
                    className={`flex-shrink-0 ${!isCurrentUser ? 'cursor-pointer' : ''}`}>
                    {member.profilePicture ? (
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}${member.profilePicture}`}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                        <RxAvatar size={24} />
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => !isCurrentUser && handleMemberClick(memberId)}
                    className={`flex-1 min-w-0 ${!isCurrentUser ? 'cursor-pointer' : ''}`}>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium truncate">
                        {member.name || 'Unknown'}
                      </p>
                      {isGroupAdmin && (
                        <FaCrown className="text-yellow-500" size={14} title="Admin" />
                      )}
                      {isCurrentUser && (
                        <span className="text-xs text-blue-400">(You)</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm truncate">
                      {member.email || ''}
                    </p>
                    {!isCurrentUser && (
                      <p className="text-gray-500 text-xs">Click to message</p>
                    )}
                  </div>

                  {isAdmin && !isGroupAdmin && !isCurrentUser && (
                    <button
                      onClick={() => handleRemoveMember(memberId)}
                      disabled={isRemoving}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
                      title="Remove member">
                      {isRemoving ? (
                        <BeatLoader color="white" size={8} />
                      ) : (
                        <MdDelete size={18} />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Group Settings */}
        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-semibold mb-3">Group Settings</h3>

          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">
              Group Subjects
            </label>
            <input
              type="text"
              placeholder="Math, Physics, Chemistry..."
              className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">Description</label>
            <textarea
              placeholder="About this group..."
              className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring focus:ring-blue-500"
              rows="3"
            />
          </div>

          {isAdmin && (
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition">
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageGroup;