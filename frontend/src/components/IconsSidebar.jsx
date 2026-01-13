import React, { useContext } from 'react';
import { RxHamburgerMenu } from "react-icons/rx";
import { IoHomeOutline, IoSettingsOutline } from "react-icons/io5";
// import { ProfileContext } from '../Context/ProfileContext';
import UserProfile from './UserProfile';
import { MdOutlineDashboard } from "react-icons/md";

const IconsSidebar = () => {
  // const { userData } = useContext(ProfileContext)

  return (
<aside className="flex md:flex-col items-center justify-between bg-gray-950 text-white md:min-w-[4%] md:border-r md:border-gray-900 hidden md:flex">

      <span className=" flex flex-col items-center gap-3 mt-5">
        <span className="cursor-pointer" aria-label="Menu">
          <RxHamburgerMenu className='text-gray-300' size={22} />
        </span>
        <span className="cursor-pointer" aria-label="Settings">
          <IoSettingsOutline  className='text-gray-300'  size={23} />
        </span>
      </span>

      <span className="  flex flex-col items-center gap-3">
        <span className="cursor-pointer" aria-label="Home">
          <MdOutlineDashboard className='text-gray-400'  size={22} />
        </span>
        <UserProfile  />
      </span>
    </aside>
  );
}

export default IconsSidebar;