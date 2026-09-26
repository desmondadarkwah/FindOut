import React, { useContext } from 'react';
import { RxHamburgerMenu } from "react-icons/rx";
import { IoHomeOutline } from "react-icons/io5";
import { BsDoorOpen } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import UserProfile from './UserProfile';
import { ProfileContext } from '../Context/ProfileContext';
import { SettingsContext } from '../Context/SettingsContext';
import { useToast } from '../Context/ToastContext';

// FIX: Notifications and Do Not Disturb were toggle switches wired to
// nothing — local state only, no API call, no persisted preference, no
// actual effect on whether notifications show up anywhere else in the
// app. They looked like real settings and did nothing. Removed rather
// than kept as decoration; add them back for real once there's an actual
// notification-muting system to wire them to.
//
// FIX: the avatar at the bottom had cursor-pointer, a hover ring, and a
// tooltip reading "My Profile" — but no onClick handler at all. It looked
// clickable and did nothing. Wired it to open the profile editor, the
// same action DashSidebar.jsx's own avatar already triggers, so it's
// consistent across the app instead of a dead-end look-alike.

const IconsSidebar = ({ showChatSidebar, setShowChatSidebar }) => {
  const navigate = useNavigate();
  const { userData } = useContext(ProfileContext);
  const { setOpenManageUser } = useContext(SettingsContext);
  const { confirm } = useToast();

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Log Out',
      message: 'Are you sure you want to log out?',
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      confirmStyle: 'danger',
    });
    if (!confirmed) return;

    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const iconButtonClass = "cursor-pointer p-2 rounded-xl hover:bg-[var(--bg-card-hover)] transition-colors duration-200 group relative";
  const tooltipClass = "absolute left-14 top-1/2 -translate-y-1/2 bg-[var(--bg-card-hover)] text-[var(--text-primary)] text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 border border-[var(--border)]";

  return (
    <aside className="relative flex md:flex-col items-center justify-between bg-[var(--bg-primary)] text-[var(--text-primary)] md:min-w-[60px] md:border-r md:border-[var(--border)] hidden md:flex py-4">

      {/* TOP ICONS */}
      <span className="flex flex-col items-center gap-5">

        {/* Hamburger - Toggle ChatSidebar */}
        <button
          onClick={() => setShowChatSidebar(!showChatSidebar)}
          className={iconButtonClass}
          aria-label="Toggle Sidebar"
        >
          <RxHamburgerMenu
            className={showChatSidebar ? 'text-[#6366f1]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors duration-200'}
            size={20}
          />
          <span className={tooltipClass}>
            {showChatSidebar ? 'Hide Chats' : 'Show Chats'}
          </span>
        </button>

        {/* Home - Go to Dashboard */}
        <button
          onClick={() => navigate('/dashboard')}
          className={iconButtonClass}
          aria-label="Dashboard"
        >
          <IoHomeOutline
            className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors duration-200"
            size={21}
          />
          <span className={tooltipClass}>Dashboard</span>
        </button>

        {/* Log Out */}
        <button
          onClick={handleLogout}
          className="cursor-pointer p-2 rounded-xl hover:bg-[#ef4444]/10 transition-colors duration-200 group relative"
          aria-label="Log Out"
        >
          <BsDoorOpen size={20} className="text-[#ef4444]/80 group-hover:text-[#ef4444] transition-colors duration-200" />
          <span className={tooltipClass}>Log Out</span>
        </button>
      </span>

      {/* BOTTOM: User Avatar */}
      <span className="flex flex-col items-center gap-3 pb-2">
        <button
          onClick={() => setOpenManageUser(true)}
          className="relative group cursor-pointer rounded-xl overflow-hidden ring-2 ring-transparent hover:ring-[#6366f1] transition-all duration-200"
          aria-label="My Profile"
        >
          <UserProfile currentImage={userData?.profilePicture} />
          <span className="absolute left-14 bottom-0 bg-[var(--bg-card-hover)] text-[var(--text-primary)] text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 border border-[var(--border)]">
            {userData?.name || 'My Profile'}
          </span>
        </button>
      </span>
    </aside>
  );
};

export default IconsSidebar;