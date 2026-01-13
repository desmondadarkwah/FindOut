import React, { useContext } from "react";
import { ProfileContext } from "../Context/ProfileContext";
import { RxAvatar } from "react-icons/rx";

const UserProfile = ({ allowUpload = false, width = 'w-8', height = 'h-8' }) => {
  const { userData, updateProfilePicture } = useContext(ProfileContext);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateProfilePicture(file);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="">
        {userData.profilePicture ? (
          <img
            src={`${import.meta.env.VITE_BACKEND_URL}${userData.profilePicture}`}
            alt="Profile"
            className={`rounded-full ${width} ${height} object-cover cursor-pointer`}
            onClick={allowUpload ? () => document.getElementById("file-input").click() : undefined}
          />
        ) : (
          <div
            onClick={allowUpload ? () => document.getElementById("file-input").click() : undefined}
            className={'w-8 h-8 bg-gray-800 text-gray-700 rounded-full flex items-center justify-center'}
          >
            <RxAvatar size={20} />
          </div>
        )}
        <input
          type="file"
          id="file-input"
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>
    </div>
  );
};

export default UserProfile;
