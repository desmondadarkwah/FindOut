import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

export const ProfileContext = createContext();

const ProfileProvider = ({ children }) => {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken && refreshToken) {
      fetchUserDetails();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserDetails = async () => {
    try {
      const response = await axiosInstance.get("/api/user-details");
      console.log('profilecontext: ', response.data)
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };


  const updateProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const response = await axiosInstance.post("/api/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUserData((prevData) => ({
        ...prevData,
        profilePicture: response.data.profilePicture,
      }));
      await fetchUserDetails()

    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };

  return (
    <ProfileContext.Provider value={{ fetchUserDetails, userData, loading, updateProfilePicture }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;
