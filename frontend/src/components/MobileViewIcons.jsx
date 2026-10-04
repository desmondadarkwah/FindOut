import React, { useContext, useState } from 'react';
import { MdHome } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';
import { BsChatDots } from 'react-icons/bs';
import { IoSettingsOutline } from 'react-icons/io5';
import { FaUsers } from 'react-icons/fa';
import { SettingsContext } from '../Context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';
import NotificationBell from './NotificationBell';

const MobileViewIcons = () => {
  const { openSettings, setOpenSettings } = useContext(SettingsContext);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--border)',
      }}>

      <div className="flex justify-around items-center px-2 py-3">

        {/* Home */}
        <button
          onClick={() => navigate('/dashboard')}
          className="group flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 active:scale-95"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <MdHome size={22} style={{ color: 'var(--text-primary)' }} />
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Home</span>
        </button>

        {/* Search */}
        <button
          onClick={() => setShowSearch(true)}
          className="group flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 active:scale-95"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <FiSearch size={22} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Search</span>
        </button>

        {/* Chats */}
        <button
          onClick={() => navigate('/inbox')}
          className="group flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 active:scale-95"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <BsChatDots size={20} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Chats</span>
        </button>

        {/* Explore Groups */}
        <button
          onClick={() => navigate('/explore-groups')}
          className="group flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 active:scale-95"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <FaUsers size={20} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Groups</span>
        </button>

        {/* Notifications */}
        <div className="flex flex-col items-center space-y-1 p-2">
          <NotificationBell iconSize={22} iconColor="var(--text-secondary)" />
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Alerts</span>
        </div>

        {/* Settings */}
        <button
          onClick={() => setOpenSettings(!openSettings)}
          className="group flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 active:scale-95"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <IoSettingsOutline
            size={22}
            style={{
              color: openSettings ? '#6366f1' : 'var(--text-secondary)',
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