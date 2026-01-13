import React, { useContext, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { CiLight } from "react-icons/ci";
import { MdReportGmailerrorred } from "react-icons/md";
import { SettingsContext } from "../Context/SettingsContext";
import { useEditUser } from "../Context/EditUserContext";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const SettingsMenu = () => {
  const { openSettings, setOpenSettings } = useContext(SettingsContext);
  const { editUserDetails } = useEditUser();
  const [showInput, setShowInput] = useState(false);
  const [subject, setSubject] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { openManageUser, setOpenManageUser } = useContext(SettingsContext);

  const navigate = useNavigate();

  const toggleInput = () => {
    setShowInput(!showInput);
  };

  const handleInputChange = (e) => {
    setSubject(e.target.value);
  };

  const handleSubmit = () => {
    if (subject.trim()) {
      editUserDetails({ subjects: [subject] });
      setSubject("");
      alert("Subject updated successfully!");
    } else {
      alert("Please enter a valid subject.");
    }
  };

  const handleEditClick = () => {
    setOpenManageUser(!openManageUser);
    closeSettings();
  };

  const closeSettings = () => setOpenSettings(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* Backdrop overlay */}
      {openSettings && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSettings}
        />
      )}
      
      {/* Settings Menu */}
      <div 
        className={`
          fixed left-0 top-0 h-full w-60 bg-gray-950 shadow-2xl 
          flex flex-col gap-4 p-5 z-50 
          transform transition-transform duration-300 ease-in-out
          ${openSettings ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <span
          onClick={closeSettings}
          className='cursor-pointer w-7 ring ring-blue-950 mb-2'>
          <IoClose color='white' size={25} />
        </span>
        
        <span
          onClick={() => { handleEditClick(); closeSettings(); }}
          className="w-full flex items-center rounded gap-2 text-gray-400 hover:text-white border border-transparent hover:border-gray-700 transition duration-200 p-2 cursor-pointer">
          <FaRegEdit />
          Edit
        </span>

        <span
          onClick={() => { closeSettings(); }}
          className="flex items-center rounded gap-2 text-gray-400 hover:text-white border border-transparent hover:border-gray-700 transition duration-200 p-2 cursor-pointer">
          <CiLight />
          Change background
        </span>

        <span
          onClick={() => { closeSettings(); }}
          className="flex items-center rounded gap-2 text-gray-400 hover:text-white border border-transparent hover:border-gray-700 transition duration-200 p-2 cursor-pointer">
          <MdReportGmailerrorred />
          Report a problem
        </span>

        <div>
          <span
            onClick={toggleInput}
            className="flex items-center rounded gap-2 text-gray-400 hover:text-white border border-transparent hover:border-gray-700 transition duration-200 p-2 cursor-pointer">
            Subjects
          </span>
          {showInput && (
            <div className="mt-2">
              <input
                type="text"
                value={subject}
                onChange={handleInputChange}
                className="bg-gray-800 text-gray-300 p-2 rounded w-full"
                placeholder="Type your subject..."
              />
              <button
                onClick={handleSubmit}
                className="mt-2 bg-blue-600 text-white p-2 rounded w-full">
                Submit
              </button>
            </div>
          )}
        </div>

        <span
          onClick={handleLogoutClick}
          className="flex items-center gap-2 rounded text-gray-400 hover:text-white border border-transparent hover:border-gray-700 transition duration-200 p-2 cursor-pointer">
          Log out
        </span>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60]">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-white text-lg font-semibold mb-3">Confirm Logout</h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to log out? You'll need to sign in again to access your account.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelLogout}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition duration-200 border border-gray-600">
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200">
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsMenu;