import React, {  useEffect, useState } from 'react';
import { MdAdd } from 'react-icons/md';
import UserProfile from './UserProfile';

const MobileViewBar = () => {
  const [visible, setVisible] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 100) { // Adjust the scroll value as needed
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 bg-black flex items-center justify-between p-2 shadow-md z-10 md:hidden ${visible ? 'block' : 'hidden'}`}>
      <div className="text-white font-bold text-lg">
        FindOut
      </div>
      <div className="flex items-center">
        <button className="text-white mr-4">
          <MdAdd size={24} />
        </button>
        <button className="relative text-white">
          <UserProfile />
          {/* <span className={`absolute top-0 right-0 ${status.Teach ? 'bg-green-600' : status.Learn ? 'bg-yellow-500' : ''} rounded-full h-3 w-3`} /> */}
        </button>
      </div>
    </div>
  );
}

export default MobileViewBar;