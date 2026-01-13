import React, { useContext } from "react";
import { IoMdPeople } from "react-icons/io";
import {
  FiEdit,
  FiAlertTriangle,
  FiUserPlus,
  FiSettings,
  FiBellOff,
  FiFileText,
  FiLock,
  FiArchive,
  FiTrash2,
} from "react-icons/fi";
import { ChatContext } from "../Context/ChatContext";

const GroupOptions = () => {
  const { HideGroupOptions } = useContext(ChatContext);

  return (
    <div className="absolute w-56 flex flex-col gap-1 right-0 top-10 bg-gray-950 p-3 shadow-lg rounded-md">
      <h3 className="text-lg font-semibold text-gray-200 mb-1">Group Options</h3>

      <span
        onClick={HideGroupOptions}
        className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
        <IoMdPeople size={20} className="mr-2" /> Leave Group
      </span>

      <span
        onClick={HideGroupOptions}
        className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
        <FiEdit size={20} className="mr-2" /> Update Profile
      </span>

      <span
        onClick={HideGroupOptions}
        className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
        <FiAlertTriangle size={20} className="mr-2" /> Report
      </span>

      <span
        onClick={HideGroupOptions}
        className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
        <FiUserPlus size={20} className="mr-2" /> Invite Members
      </span>

      <span
        onClick={HideGroupOptions}
        className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
        <FiSettings size={20} className="mr-2" /> Group Settings
      </span>

      <span
        onClick={HideGroupOptions}
        className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
        <FiBellOff size={20} className="mr-2" /> Mute Notifications
      </span>

      <span
        onClick={HideGroupOptions}
        className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
        <FiFileText size={20} className="mr-2" /> Media & Files
      </span>

      <span
        onClick={HideGroupOptions}
        className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
        <FiLock size={20} className="mr-2" /> Privacy Settings
      </span>

      <span
        onClick={HideGroupOptions}
        className="flex items-center cursor-pointer border border-gray-800 p-2 rounded hover:bg-gray-700 transition">
        <FiArchive size={20} className="mr-2" /> Archive Group
      </span>

      <span
        onClick={HideGroupOptions}
        className="flex items-center cursor-pointer border border-red-600 text-red-500 p-2 rounded hover:bg-red-700 transition">
        <FiTrash2 size={20} className="mr-2" /> Delete Group
      </span>
    </div>
  );
};

export default GroupOptions;
