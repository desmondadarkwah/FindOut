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
} from "react-icons/fi";
import { ChatContext } from "../Context/ChatContext";
import AddMembersModal from "./AddMembersModal";

const GroupOptions = () => {
  const { selectedChat, setShowChatOptions } = useContext(ChatContext);
  const [showAddMembers, setShowAddMembers] = useState(false);

  const HideGroupOptions = () => {
    setShowChatOptions(false);
  };

  const handleInviteMembers = () => {
    // ✅ FIXED: Don't hide options immediately
    setShowAddMembers(true);
  };

  return (
    <>
      <div className="absolute w-56 flex flex-col gap-1 right-0 top-10 bg-gray-950 p-3 shadow-lg rounded-md border border-gray-800 z-40">
        <h3 className="text-lg font-semibold text-gray-200 mb-1">Group Options</h3>
        
        <span
          onClick={handleInviteMembers}
          className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
          <FiUserPlus size={18} className="mr-2" /> Invite Members
        </span>

        <span
          onClick={HideGroupOptions}
          className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
          <FiSettings size={18} className="mr-2" /> Group Settings
        </span>
        
        <span
          onClick={HideGroupOptions}
          className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
          <FiBellOff size={18} className="mr-2" /> Mute Notifications
        </span>
        
        <span
          onClick={HideGroupOptions}
          className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
          <FiFileText size={18} className="mr-2" /> Media & Files
        </span>

        <div className="border-t border-gray-700 my-1"></div>
        
        <span
          onClick={HideGroupOptions}
          className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
          <FiArchive size={18} className="mr-2" /> Archive Group
        </span>
        
        <span
          onClick={HideGroupOptions}
          className="flex items-center cursor-pointer border border-orange-600 text-orange-400 p-2 rounded hover:bg-orange-700 hover:text-white transition">
          <IoMdPeople size={18} className="mr-2" /> Leave Group
        </span>
        
        <span
          onClick={HideGroupOptions}
          className="flex items-center cursor-pointer border border-yellow-600 text-yellow-400 p-2 rounded hover:bg-yellow-700 hover:text-white transition">
          <FiAlertTriangle size={18} className="mr-2" /> Report Group
        </span>
        
        <span
          onClick={HideGroupOptions}
          className="flex items-center cursor-pointer border border-red-600 text-red-500 p-2 rounded hover:bg-red-700 hover:text-white transition">
          <FiTrash2 size={18} className="mr-2" /> Delete Group
        </span>
      </div>

      {/* Add Members Modal */}
      <AddMembersModal
        isOpen={showAddMembers}
        onClose={() => {
          setShowAddMembers(false);
          HideGroupOptions(); // ✅ Hide options when modal closes
        }}
        groupId={selectedChat?._id}
        existingMembers={selectedChat?.members?.map(m => m._id) || []}
      />
    </>
  );
};

export default GroupOptions;