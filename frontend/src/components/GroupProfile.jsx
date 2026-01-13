import React, { useContext, useEffect, useState } from 'react';
import { RxAvatar } from 'react-icons/rx';
import { ChatContext } from '../Context/ChatContext';
import { GroupProfileContext } from '../Context/groupProfileContext';

const GroupProfile = ({ allowUpload = false, width = 'w-12', height = 'h-12' }) => {
  const {  updateGroupProfilePicture } = useContext(GroupProfileContext);
  const { selectedChat } = useContext(ChatContext);

  // This was causing the error - selectedChat.groupProfile is not a function
  // useEffect(() => {
  //   if (!allowUpload) {
  //     selectedChat.groupProfile(null);
  //   }
  // }, [allowUpload]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateGroupProfilePicture(file);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center">
        <div className="">
          {selectedChat && selectedChat.groupProfile ? (
            <img
              // src={groupData.groupProfile.startsWith('http') ? groupData.groupProfile : `${import.meta.env.VITE_BACKEND_URL}${groupData.groupProfile}`}
              src={`${import.meta.env.VITE_BACKEND_URL}${selectedChat.groupProfile}`}
              alt="Profile"
              className={`rounded-full ${width} ${height} object-cover cursor-pointer`}
              onClick={allowUpload ? () => document.getElementById('group-file-input').click() : undefined}
            />
          ) : (
            <div
              onClick={allowUpload ? () => document.getElementById('group-file-input').click() : undefined}
              className={`${width} ${height} bg-gray-800 text-gray-700 rounded-full flex items-center justify-center cursor-pointer`}
            >
              <RxAvatar size={40} />
            </div>
          )}
          {allowUpload && (
            <input
              type="file"
              id="group-file-input"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupProfile;