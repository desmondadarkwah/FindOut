import React, { useContext } from 'react'
import { MdHome } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { MdOutlineExploreOff } from "react-icons/md";
import { BsChatDots } from "react-icons/bs";
import { MdOutlineAddBox } from "react-icons/md";
import { IoMdNotificationsOutline } from "react-icons/io";
// import { IoSettingsOutline } from "react-icons/io5";
import { IoIosMore } from "react-icons/io";

import UserProfile from "./UserProfile";
import { SettingsContext } from '../Context/SettingsContext';

const DashSidebar = () => {
  const { setOpenSettings } = useContext(SettingsContext);
//  const {}
  
  return (
    <div className="flex">
      <aside className="w-60 border border-gray-900 hidden md:block fixed left-0 top-0 h-full bg-black z-10 overflow-y-auto">
        <div className="text-white w-52 ml-4 font-bold flex items-center justify-center mb-10 mt-5 text-4xl">
          FindOut
        </div>
        <span className="flex items-center hover:bg-[#1c1e21] p-2">
          <MdHome size={25} color="white" />
          <a href="#" className="block px-4 font-medium text-white rounded-md">
            Home
          </a>
        </span>
        <span className="flex items-center hover:bg-[#1c1e21] p-2">
          <FiSearch size={25} color="white" />
          <a href="#" className="block px-4 py-2 font-medium text-white">
            Search
          </a>
        </span>
        <span className="flex items-center hover:bg-[#1c1e21] p-2">
          <MdOutlineExploreOff size={25} color="white" />
          <a href="feed" className="block px-4 py-2 font-medium text-white">
            FindMore
          </a>
        </span>
        <span className="flex items-center hover:bg-[#1c1e21] p-2">
          <BsChatDots size={25} color="white" />
          <a href="inbox" className="block px-4 py-2 font-medium text-white">
            Chats
          </a>````
        </span>
        <span className="flex items-center hover:bg-[#1c1e21] p-2">
          <MdOutlineAddBox size={25} color="white" />
          <a href="/add-post" className="block px-4 py-2 font-medium text-white">
            Add a Post
          </a>
        </span>
        <span className="flex items-center hover:bg-[#1c1e21] p-2">
          <IoMdNotificationsOutline size={25} color="white" />
          <span className="block px-4 py-2 font-medium text-white">
            Notifications
          </span>
        </span>
        <span className="flex items-center hover:bg-[#1c1e21] p-2">
          <UserProfile allowUpload={false} />
          <span className="block px-4 py-2 font-medium text-white">
            Profile
          </span>
        </span>
        <span
          onClick={()=>setOpenSettings(true)}
          className="flex items-center hover:bg-[#1c1e21] p-2 cursor-pointer"
        >
          {/* <IoSettingsOutline size={25} color="white" /> */}
          <IoIosMore size={25} color="white" />
          <span  className="block px-4 py-2 font-medium text-white">
            More
          </span>
        </span>
        <span className="flex items-center justify-center flex-col text-gray-400 text-xs mt-8 px-4 pb-4">
          Welcome to FindOut! Explore various <a href="#" className="text-blue-500 hover:underline">study groups</a> and resources tailored to your learning needs.
          Join our vibrant community of learners to share knowledge, ask questions, and grow together.
          <a href="#" className="text-blue-500 hover:underline">Connect with fellow learners</a> and enhance your academic journey today!
        </span>
      </aside>
    </div>
  )
}

export default DashSidebar