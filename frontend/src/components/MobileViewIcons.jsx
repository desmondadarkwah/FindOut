import React, { useContext, useState } from 'react'
import { MdHome } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';
import { BsChatDots } from 'react-icons/bs';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { IoSettingsOutline } from 'react-icons/io5';
import { SettingsContext } from '../Context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';


const MobileViewIcons = () => {
  const { openSettings, setOpenSettings } = useContext(SettingsContext);
  const [showSearch, setShowSearch] = useState(false);

  const navigate = useNavigate();

  const handleSettings = () => {
    setOpenSettings(!openSettings)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-gray-900 to-gray-800/50 backdrop-blur-lg border-t border-gray-700/50 md:hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

      <div className="flex justify-around items-center px-2 py-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="group flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-95">
          <div className="relative">
            <MdHome size={22} className="text-white group-hover:text-blue-400 transition-colors duration-200" />
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full opacity-100"></div>
          </div>
          <span className="text-xs text-gray-300 group-hover:text-white font-medium">Home</span>
        </button>

        <button
          onClick={() => setShowSearch(true)}
          className="group flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-95">
          <FiSearch size={22} className="text-gray-400 group-hover:text-blue-400 transition-colors duration-200" />
          <span className="text-xs text-gray-400 group-hover:text-white font-medium">Search</span>
        </button>

        <button
          onClick={() => navigate('/inbox')}
          className="group flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-95">
          <BsChatDots size={20} className="text-gray-400 group-hover:text-green-400 transition-colors duration-200" />
          <span className="text-xs text-gray-400 group-hover:text-white font-medium">Chats</span>
        </button>

        <button
          onClick={() => navigate('/add-post')}
          className="group relative flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-95">
          <div className="relative">
            <IoMdNotificationsOutline size={22} className="text-gray-400 group-hover:text-yellow-400 transition-colors duration-200" />
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full h-3 w-3 border-2 border-gray-900 animate-pulse"></span>
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-3 w-3 animate-ping opacity-75"></span>
          </div>
          <span className="text-xs text-gray-400 group-hover:text-white font-medium">Alerts</span>
        </button>

        <button
          onClick={handleSettings}
          className="group flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-95"
        >
          <IoSettingsOutline
            size={22}
            className={`transition-all duration-200 ${openSettings
                ? 'text-blue-400 rotate-45'
                : 'text-gray-400 group-hover:text-purple-400'
              }`}
          />
          <span className="text-xs text-gray-400 group-hover:text-white font-medium">Settings</span>
        </button>
      </div>

      <div className="h-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>

      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />

    </div>
  )
}

export default MobileViewIcons