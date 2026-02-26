import React, { useContext, useState } from "react";
import { IoMdPeople } from "react-icons/io";
import {
  FiAlertTriangle,
  FiUserPlus,
  FiSettings,
  FiBellOff,
  FiFileText,
  FiArchive,
  FiTrash2,
  FiLogOut,
} from "react-icons/fi";
import { ChatContext } from "../Context/ChatContext";
import { SettingsContext } from "../Context/SettingsContext";
import AddMembersModal from "./AddMembersModal";
import { useToast } from "../Context/ToastContext";

const GroupOptions = () => {
  const { selectedChat, setShowChatOptions, userId } = useContext(ChatContext);
  const { setOpenGroupManager } = useContext(SettingsContext);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const { toast, confirm } = useToast();

  // ✅ Check if current user is admin
  const isAdmin = selectedChat?.groupAdmin?._id === userId || selectedChat?.groupAdmin === userId;

  const hideOptions = () => {
    setShowChatOptions(false);
  };

  const handleManageGroup = () => {
    setShowChatOptions(false);
    setOpenGroupManager(true);
  };

  const handleInviteMembers = () => {
    setShowAddMembers(true);
  };

  const handleLeaveGroup = async () => {
    const confirmed = await confirm({
      title: 'Leave Group',
      message: `Are you sure you want to leave ${selectedChat.groupName}?`,
      confirmText: 'Leave',
      cancelText: 'Cancel',
      confirmStyle: 'warning'
    });

    if (!confirmed) return;

    // Add leave group logic here
    toast.info('Leave group functionality coming soon');
    hideOptions();
  };

  const handleDeleteGroup = async () => {
    const confirmed = await confirm({
      title: 'Delete Group',
      message: `Are you sure you want to delete ${selectedChat.groupName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmStyle: 'danger'
    });

    if (!confirmed) return;

    // Add delete group logic here
    toast.info('Delete group functionality coming soon');
    hideOptions();
  };

  return (
    <>
      <div className="absolute w-56 flex flex-col gap-1 right-0 top-10 bg-gray-950 p-3 shadow-lg rounded-md border border-gray-800 z-40">
        <h3 className="text-lg font-semibold text-gray-200 mb-1">
          {isAdmin ? 'Admin Options' : 'Group Options'}
        </h3>
        
        {/* ✅ ADMIN-ONLY OPTIONS */}
        {isAdmin && (
          <>
            <span
              onClick={handleInviteMembers}
              className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
              <FiUserPlus size={18} className="mr-2" /> Add Members
            </span>

            <span
              onClick={handleManageGroup}
              className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
              <FiSettings size={18} className="mr-2" /> Manage Group
            </span>
          </>
        )}

        {/* ✅ COMMON OPTIONS (Both Admin & Members) */}
        <span
          onClick={hideOptions}
          className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
          <FiBellOff size={18} className="mr-2" /> Mute Notifications
        </span>
        
        <span
          onClick={hideOptions}
          className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
          <FiFileText size={18} className="mr-2" /> Media & Files
        </span>

        {/* ✅ MEMBER-ONLY: View Group Info */}
        {!isAdmin && (
          <span
            onClick={handleManageGroup}
            className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
            <IoMdPeople size={18} className="mr-2" /> Group Info
          </span>
        )}

        <div className="border-t border-gray-700 my-1"></div>
        
        {/* ✅ ADMIN-ONLY: Delete Group */}
        {isAdmin ? (
          <span
            onClick={handleDeleteGroup}
            className="flex items-center cursor-pointer border border-red-600 text-red-500 p-2 rounded hover:bg-red-700 hover:text-white transition">
            <FiTrash2 size={18} className="mr-2" /> Delete Group
          </span>
        ) : (
          /* ✅ MEMBER-ONLY: Leave Group */
          <span
            onClick={handleLeaveGroup}
            className="flex items-center cursor-pointer border border-orange-600 text-orange-400 p-2 rounded hover:bg-orange-700 hover:text-white transition">
            <FiLogOut size={18} className="mr-2" /> Leave Group
          </span>
        )}

        {/* ✅ COMMON: Report Group */}
        <span
          onClick={hideOptions}
          className="flex items-center cursor-pointer border border-yellow-600 text-yellow-400 p-2 rounded hover:bg-yellow-700 hover:text-white transition">
          <FiAlertTriangle size={18} className="mr-2" /> Report Group
        </span>
      </div>

      {/* ✅ Add Members Modal (Admin Only) */}
      {isAdmin && (
        <AddMembersModal
          isOpen={showAddMembers}
          onClose={() => {
            setShowAddMembers(false);
            hideOptions();
          }}
          groupId={selectedChat?._id}
          existingMembers={selectedChat?.members?.map(m => m._id) || []}
        />
      )}
    </>
  );
};

export default GroupOptions;