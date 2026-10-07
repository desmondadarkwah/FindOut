import React, { useContext, useState } from 'react';
import { MdHome, MdDynamicFeed } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';
import { BsChatDots } from 'react-icons/bs';
import { IoSettingsOutline } from 'react-icons/io5';
import { SettingsContext } from '../Context/SettingsContext';
import { useNavigate, useLocation } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';
import NotificationBell from './NotificationBell';

const ACTIVE_COLOR = '#6366f1';

const MobileViewIcons = () => {
  const { openSettings, setOpenSettings } = useContext(SettingsContext);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Highlights the icon of the page you're currently on
  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);
  const iconColor = (path) => (isActive(path) ? ACTIVE_COLOR : 'var(--text-secondary)');

  const navButtonClass =
    'group flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 active:scale-95';
  const navButtonStyle = { background: 'none', border: 'none', cursor: 'pointer' };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--border)',
        // keeps the bar clear of the home indicator on iPhones
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>

      <div className="flex justify-around items-center px-2 py-3">

        {/* Home */}
        <button
          onClick={() => navigate('/dashboard')}
          className={navButtonClass}
          style={navButtonStyle}>
          <MdHome size={22} style={{ color: isActive('/dashboard') ? ACTIVE_COLOR : 'var(--text-primary)' }} />
          <span style={{ fontSize: 10, color: iconColor('/dashboard') }}>Home</span>
        </button>

        {/* Search */}
        <button
          onClick={() => setShowSearch(true)}
          className={navButtonClass}
          style={navButtonStyle}>
          <FiSearch size={22} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Search</span>
        </button>

        {/* Chats */}
        <button
          onClick={() => navigate('/inbox')}
          className={navButtonClass}
          style={navButtonStyle}>
          <BsChatDots size={20} style={{ color: iconColor('/inbox') }} />
          <span style={{ fontSize: 10, color: iconColor('/inbox') }}>Chats</span>
        </button>

        {/* Feed (replaces Groups - Explore Groups is already on the Dashboard) */}
        <button
          onClick={() => navigate('/feed')}
          className={navButtonClass}
          style={navButtonStyle}>
          <MdDynamicFeed size={22} style={{ color: iconColor('/feed') }} />
          <span style={{ fontSize: 10, color: iconColor('/feed') }}>Feed</span>
        </button>

        {/* Notifications */}
        <div className="flex flex-col items-center space-y-1 p-2">
          <NotificationBell iconSize={22} iconColor="var(--text-secondary)" />
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Alerts</span>
        </div>

        {/* Settings */}
        <button
          onClick={() => setOpenSettings(!openSettings)}
          className={navButtonClass}
          style={navButtonStyle}>
          <IoSettingsOutline
            size={22}
            style={{
              color: openSettings ? ACTIVE_COLOR : 'var(--text-secondary)',
              transform: openSettings ? 'rotate(45deg)' : 'none',
              transition: 'all 0.2s'
            }}
          />
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Settings</span>
        </button>
      </div>

      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </div>
  );
};

export default MobileViewIcons;