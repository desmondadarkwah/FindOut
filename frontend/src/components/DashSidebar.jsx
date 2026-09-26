import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdHome, MdOutlineExplore, MdOutlineAddBox } from "react-icons/md";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import { BsChatDots } from "react-icons/bs";
import { IoMdNotificationsOutline } from "react-icons/io";
import { IoIosMore } from "react-icons/io";
import GlobalSearch from './GlobalSearch';
import UserProfile from "./UserProfile";
import { SettingsContext } from '../Context/SettingsContext';
import NotificationBell from './NotificationBell';

// ✅ FIX: was `<MdOutlineExploreOff />` — the "off"/slashed variant of the
// explore icon — on the one nav item meant to represent exploring content.
// Swapped for the plain MdOutlineExplore icon above.

const DashSidebar = () => {
  const { setOpenSettings, openManageUser, setOpenManageUser } = useContext(SettingsContext);
  const [showSearch, setShowSearch] = useState(false);
  // ✅ Sidebar is now a toggleable drawer rather than permanently on
  // screen — closed by default, opened with the menu button, closed by
  // clicking the backdrop, an item, or the X.
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const closeSettings = () => setOpenSettings(false);

  // ✅ FIX: this called closeSettings() itself, and was then called again
  // by its own onClick handler right after — redundant duplicate call.
  const handleEditClick = () => {
    setOpenManageUser(!openManageUser);
    closeSettings();
    setIsOpen(false);
  };

  const goTo = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  // ✅ FIX: several of these were raw `<a href="...">` tags. A plain <a>
  // does a full browser page reload instead of a client-side route change —
  // it throws away all app state (chats, loaded data, sockets) on every
  // click. Converted to navigate() so the app behaves like the SPA it is.
  const navItems = [
    { label: 'Home', icon: MdHome, action: () => goTo('/dashboard') },
    { label: 'Search', icon: FiSearch, action: () => { setShowSearch(true); setIsOpen(false); } },
    { label: 'FindMore', icon: MdOutlineExplore, action: () => goTo('/feed') },
    { label: 'Chats', icon: BsChatDots, action: () => goTo('/inbox') },
    { label: 'Add a Post', icon: MdOutlineAddBox, action: () => goTo('/add-post') },
  ];

  return (
    <>
      {/* Toggle button — always reachable, even while the drawer is closed */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="hidden md:flex fixed left-4 top-4 z-30 items-center justify-center w-10 h-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-colors"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <FiX size={18} /> : <FiMenu size={18} />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="hidden md:block fixed inset-0 bg-black/50 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`w-60 hidden md:flex flex-col fixed left-0 top-0 h-full bg-[var(--bg-secondary)] border-r border-[var(--border)] z-20 overflow-y-auto no-scrollbar transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <style>{`
          .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>

        <div className="text-[var(--text-primary)] font-semibold flex items-center justify-center mb-8 mt-6 text-2xl">
          FindOut
        </div>

        <nav className="flex flex-col px-2 gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = item.label === 'Home'
              ? location.pathname === '/dashboard'
              : item.label === 'FindMore'
                ? location.pathname === '/feed'
                : item.label === 'Chats'
                  ? location.pathname === '/inbox'
                  : false;

            return (
              <button
                key={item.label}
                onClick={item.action}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  active
                    ? 'bg-[#6366f1]/10 text-[var(--text-primary)] border-l-2 border-[#6366f1]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] border-l-2 border-transparent'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}

          <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
            <NotificationBell iconSize={18} iconColor="currentColor" />
            Notifications
          </span>

          <button
            onClick={() => { setOpenSettings(true); setIsOpen(false); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-colors text-left"
          >
            <IoIosMore size={18} />
            More
          </button>
        </nav>

        <div className="border-t border-[var(--border)] mt-2 pt-2 px-2">
          <button
            onClick={handleEditClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors text-left"
          >
            <UserProfile allowUpload={false} />
          </button>
        </div>

        <p className="text-[var(--text-muted)] text-xs leading-relaxed px-5 pt-6 pb-5 mt-auto">
          Explore study groups and resources tailored to your learning needs.
          Join the community to share knowledge, ask questions, and grow together.
        </p>
      </aside>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
};

export default DashSidebar;