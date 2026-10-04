import React, { createContext, useState, useContext } from "react";
import axiosInstance from "../utils/axiosInstance";

export const EditUserContext = createContext();

const EditUserProvider = ({ children }) => {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/user-details");
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  const editUserDetails = async (updates) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put("/api/edit-user", updates);
      setUserData(prev => ({ ...prev, ...updates }));
      return true; // ✅ Return success - let caller handle toast
    } catch (error) {
      console.error("Error updating user details:", error);
      return false; // ✅ Return failure - let caller handle toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <EditUserContext.Provider value={{ userData, loading, fetchUserDetails, editUserDetails }}>
      {children}
    </EditUserContext.Provider>
  );
};

export const useEditUser = () => useContext(EditUserContext);
export default EditUserProvider;