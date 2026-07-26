import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { MdHome, MdOutlineExplore, MdOutlineAddBox } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { BsChatDots } from "react-icons/bs";
import { IoIosMore } from "react-icons/io";
import GlobalSearch from './GlobalSearch';
import UserProfile from "./UserProfile";
import { SettingsContext } from '../Context/SettingsContext';

/* Navigation is data. Adding a destination should not mean copying markup. */
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home',       Icon: MdHome },
  { to: '/feed',      label: 'FindMore',   Icon: MdOutlineExplore },
  { to: '/inbox',     label: 'Chats',      Icon: BsChatDots },
  { to: '/add-post',  label: 'Add a Post', Icon: MdOutlineAddBox },
];

/* Shared shape for both links and buttons, so a nav row looks identical
   regardless of which element it is built from. */
const rowBase =
  'flex w-full items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-sm font-semibold transition-colors';

const DashSidebar = () => {
  const { setOpenSettings, openManageUser, setOpenManageUser } = useContext(SettingsContext);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  const closeSettings = () => setOpenSettings(false);

  const handleEditClick = () => {
    setOpenManageUser(!openManageUser);
    closeSettings();
  };

  return (
    <>
      <aside className="scrollbar-slim fixed left-0 top-0 z-dropdown hidden h-full w-60 flex-col gap-4 overflow-y-auto bg-surface-base p-4 md:flex">
        {/* Wordmark */}
        <div className="card-glass px-4 py-5">
          <h1 className="text-gradient-brand text-2xl font-extrabold tracking-tight">
            FindOut
          </h1>
          <p className="mt-1 text-[11.5px] font-medium leading-snug text-content-muted">
            Share knowledge · Ask questions · Help others learn
          </p>
        </div>

        {/* Primary action */}
        <button
          type="button"
          onClick={() => navigate('/add-post')}
          className="btn-gradient flex items-center justify-center gap-2 rounded-[14px] py-3.5 text-sm font-bold text-white"
        >
          <Plus size={18} aria-hidden="true" /> Create Post
        </button>

        {/* Primary navigation */}
        <nav className="card-glass flex flex-col gap-0.5 p-2" aria-label="Main">
          {/* Search opens a modal rather than navigating, so it is a button. */}
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            className={`${rowBase} text-content-secondary hover:bg-surface-hover hover:text-content-primary`}
          >
            <FiSearch size={20} className="shrink-0" aria-hidden="true" />
            Search
          </button>

          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${rowBase} ${
                  isActive
                    ? 'nav-active'
                    : 'text-content-secondary hover:bg-surface-hover hover:text-content-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className="shrink-0" aria-hidden="true" />
                  {label}
                  {isActive && (
                    <span
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500"
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => setOpenSettings(true)}
            className={`${rowBase} text-content-secondary hover:bg-surface-hover hover:text-content-primary`}
          >
            <IoIosMore size={20} className="shrink-0" aria-hidden="true" />
            More
          </button>
        </nav>

        {/* Account — pushed to the bottom */}
        <div className="card-glass mt-auto p-2">
          <button
            type="button"
            onClick={handleEditClick}
            className={`${rowBase} text-content-secondary hover:bg-surface-hover hover:text-content-primary`}
          >
            <UserProfile allowUpload={false} />
            <span className="truncate">My profile</span>
          </button>
        </div>
      </aside>

      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
};

export default DashSidebar;
