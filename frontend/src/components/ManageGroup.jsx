import React, { useState, useContext, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { SettingsContext } from "../Context/SettingsContext";
import GroupProfile from "./GroupProfile";
import UserProfile from "./UserProfile";
import { ChatContext } from "../Context/ChatContext";
import { CiLink } from "react-icons/ci";
import { GroupProfileContext } from "../Context/groupProfileContext";

const ManageGroup = () => {
  const { selectedChat } = useContext(ChatContext);
  const [allowUpload, setAllowUploads] = useState(false);
  const [changePhoto, setChangePhoto] = useState(false);
  const { openGroupManager, setOpenGroupManager } = useContext(SettingsContext);
  const { setGroupId } = useContext(GroupProfileContext);

  const handleChangePhotoClick = () => {
    setAllowUploads(true);
    setGroupId(selectedChat._id);
    setChangePhoto(false);

    const fileInputId = selectedChat.isGroup ? "group-file-input" : "file-input";
    document.getElementById(fileInputId).click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle the file upload here
      console.log("Selected file:", file);
      // You can upload it to your backend or update the group profile
      // Example:
      // const formData = new FormData();
      // formData.append('groupProfile', file);
      // formData.append('groupId', selectedChat._id);
      // await axiosInstance.post('/api/groups/update-profile', formData);
    }
  };

  const handleRemovePhoto = () => {
    setAllowUploads(false);
    setChangePhoto(false);
    setGroupId(selectedChat._id);
    // Here, you can set a default group image or update the backend to remove the existing one.
    // Example:
    // await axiosInstance.post('/api/groups/remove-profile', { groupId: selectedChat._id });
  };

  return (
    <div className="fixed right-0 top-0 w-full h-full max-w-[806px] mx-auto flex flex-col items-center bg-gray-950 z-50">
      {/* Hidden file input */}
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
            console.log("Close button clicked");
            setOpenGroupManager(false);
          }}
          className="cursor-pointer"
          size={28}
        />
      </span>

      <div className="w-full shadow-lg p-1 bg-gray-950 overflow-y-auto cursor-default">
        <div className="flex flex-col items-center mb-6">
          <div
            onClick={() => setChangePhoto(true)}
            className="flex items-center justify-center rounded cursor-pointer"
          >
            {selectedChat.isGroup ? (
              <GroupProfile allowUpload={allowUpload} width="w-24" height="h-24" />
            ) : (
              <UserProfile allowUpload={allowUpload} width="w-24" height="h-24" />
            )}
          </div>

          <span className="text-gray-500 cursor-default">{selectedChat.groupName}</span>

          {selectedChat.isGroup ? (
            <span className="font-bold text-gray-500 cursor-default">
              {selectedChat.members.length} member{selectedChat.members.length !== 1 ? 's' : ''}
            </span>
          ) : null}

          {changePhoto && (
            <div className="bg-gray-950 absolute mt-24 p-3 w-full flex flex-col items-center gap-3 shadow-lg border border-gray-700 rounded-lg z-10">
              <span
                onClick={handleChangePhotoClick}
                className="block text-blue-400 mb-2 cursor-pointer hover:underline"
              >
                Upload Photo
              </span>
              <span
                onClick={handleRemovePhoto}
                className="block text-red-500 mb-2 cursor-pointer hover:underline"
              >
                Remove Current Photo
              </span>
              <span
                onClick={() => setChangePhoto(false)}
                className="block text-gray-300 cursor-pointer hover:underline"
              >
                Cancel
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-5">
          <span className="cursor-default">link</span>
          <span className="text-blue-900 hover:underline cursor-pointer">
            the link will be here
          </span>
          <span className="cursor-default">
            <CiLink size={22} />
          </span>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-1">
            Change group Subjects
          </label>
          <input
            type="text"
            placeholder="Subjects"
            className="w-full p-3 bg-[#1c1e21] text-white rounded-md border border-gray-600 focus:outline-none focus:ring focus:ring-blue-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-1">Bio</label>
          <textarea
            placeholder="Bio"
            className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring focus:ring-blue-400"
            rows="3"
          />
          <p className="text-gray-400 text-xs mt-1">2/ 150</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-1">Status</label>
          <select className="w-full p-3 bg-[#1c1e21] text-white rounded-md border border-gray-600 focus:outline-none focus:ring focus:ring-blue-400">
            <option value="Later">Later</option>
            <option value="Ready To Teach">Ready To Teach</option>
            <option value="Ready To Learn">Ready To Learn</option>
          </select>
        </div>

        <button className="w-full text-white py-2 rounded-md ring ring-blue-600 focus:ring-blue-300">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ManageGroup;