import React, { useContext, useState, useEffect, useRef } from 'react';
import { RxHamburgerMenu } from "react-icons/rx";
import { IoHomeOutline, IoSettingsOutline } from "react-icons/io5";
import { MdOutlineDashboard, MdOutlineNotifications, MdOutlineDoNotDisturb } from "react-icons/md";
import { BsDoorOpen } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import UserProfile from './UserProfile';
import { ProfileContext } from '../Context/ProfileContext';

const IconsSidebar = ({ showChatSidebar, setShowChatSidebar }) => {
  const navigate = useNavigate();
  const { userData } = useContext(ProfileContext);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const settingsRef = useRef(null);

  // ✅ Close settings panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <aside className="relative flex md:flex-col items-center justify-between bg-gray-950 text-white md:min-w-[60px] md:border-r md:border-gray-800 hidden md:flex py-4">

      {/* ── TOP ICONS ── */}
      <span className="flex flex-col items-center gap-5">

        {/* Hamburger - Toggle ChatSidebar */}
        <button
          onClick={() => setShowChatSidebar(!showChatSidebar)}
          className="cursor-pointer p-2 rounded-xl hover:bg-gray-800 transition-all duration-200 group relative"
          aria-label="Toggle Sidebar"
        >
          <RxHamburgerMenu
            className={`transition-colors duration-200 ${showChatSidebar ? 'text-indigo-400' : 'text-gray-400 group-hover:text-white'}`}
            size={20}
          />
          {/* Tooltip */}
          <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 border border-gray-700">
            {showChatSidebar ? 'Hide Chats' : 'Show Chats'}
          </span>
        </button>

        {/* Home - Go to Dashboard */}
        <button
          onClick={() => navigate('/dashboard')}
          className="cursor-pointer p-2 rounded-xl hover:bg-gray-800 transition-all duration-200 group relative"
          aria-label="Dashboard"
        >
          <IoHomeOutline
            className="text-gray-400 group-hover:text-white transition-colors duration-200"
            size={21}
          />
          {/* Tooltip */}
          <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 border border-gray-700">
            Dashboard
          </span>
        </button>

        {/* Settings - Opens panel */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="cursor-pointer p-2 rounded-xl hover:bg-gray-800 transition-all duration-200 group relative"
            aria-label="Settings"
          >
            <IoSettingsOutline
              className={`transition-colors duration-200 ${showSettings ? 'text-indigo-400 rotate-45' : 'text-gray-400 group-hover:text-white'} transition-transform`}
              size={21}
            />
            {/* Tooltip - only show when panel is closed */}
            {!showSettings && (
              <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 border border-gray-700">
                Settings
              </span>
            )}
          </button>

          {/* ✅ Settings Panel */}
          {showSettings && (
            <div className="absolute left-14 top-0 w-56 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">

              {/* Panel Header */}
              <div className="px-4 py-3 border-b border-gray-700/50">
                <p className="text-white font-semibold text-sm">Quick Settings</p>
                <p className="text-gray-500 text-xs mt-0.5">Manage your preferences</p>
              </div>

              {/* Notifications Toggle */}
              <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <MdOutlineNotifications
                    size={18}
                    className={notifications ? 'text-indigo-400' : 'text-gray-500'}
                  />
                  <span className="text-sm text-gray-300">Notifications</span>
                </div>
                {/* Toggle Switch */}
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-10 h-5 rounded-full transition-all duration-300 relative ${notifications ? 'bg-indigo-500' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${notifications ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Do Not Disturb Toggle */}
              <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors border-b border-gray-700/30">
                <div className="flex items-center gap-3">
                  <MdOutlineDoNotDisturb
                    size={18}
                    className={doNotDisturb ? 'text-amber-400' : 'text-gray-500'}
                  />
                  <span className="text-sm text-gray-300">Do Not Disturb</span>
                </div>
                {/* Toggle Switch */}
                <button
                  onClick={() => setDoNotDisturb(!doNotDisturb)}
                  className={`w-10 h-5 rounded-full transition-all duration-300 relative ${doNotDisturb ? 'bg-amber-500' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${doNotDisturb ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Log Out */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-500/10 transition-colors group"
              >
                <BsDoorOpen size={18} className="text-red-400" />
                <span className="text-sm text-red-400 font-medium">Log Out</span>
              </button>
            </div>
          )}
        </div>
      </span>

      {/* ── BOTTOM: User Avatar ── */}
      <span className="flex flex-col items-center gap-3 pb-2">
        <div className="relative group">
          <div className="cursor-pointer rounded-xl overflow-hidden ring-2 ring-transparent hover:ring-indigo-500 transition-all duration-200">
            <UserProfile currentImage={userData?.profilePicture} />
          </div>
          {/* Tooltip */}
          <span className="absolute left-14 bottom-0 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 border border-gray-700">
            {userData?.name || 'My Profile'}
          </span>
        </div>
      </span>
    </aside>
  );
};

export default IconsSidebar;