import React, { createContext, useState, useEffect, useContext } from "react";
import axiosInstance from "../utils/axiosInstance";
import { ChatContext } from "./ChatContext";

export const GroupProfileContext = createContext();

const GroupProfileProvider = ({ children }) => {
  // const [groupData, setGroupData] = useState({});
  // const [loading, setLoading] = useState(true);
  const [groupId, setGroupId] = useState(null);
  const { setChats } = useContext(ChatContext);




  const updateGroupProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("groupProfile", file);
    formData.append('groupId', String(groupId));
    try {
      const response = await axiosInstance.post("/api/group-profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });


      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === groupId ? { ...chat, groupProfile: response.data.groupProfile } : chat
        )
      );



    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };


  const removeGroupProfilePicture = async () => {
    try{

    }catch (error) {
      console.error("Error removing profile picture:", error);
    }
  }

  return (
    <GroupProfileContext.Provider value={{ updateGroupProfilePicture, groupId, setGroupId,removeGroupProfilePicture }}>
      {children}
    </GroupProfileContext.Provider>
  );
};

export default GroupProfileProvider;
