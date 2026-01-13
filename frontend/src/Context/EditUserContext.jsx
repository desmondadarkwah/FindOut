import React, { createContext, useState, useContext } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from 'react-toastify'

export const EditUserContext = createContext();

const EditUserProvider = ({ children }) => {
  const [userData, setUserData] = useState({}); // Store user details
  const [loading, setLoading] = useState(false); // Loading state for API calls

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/user-details");
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error('Failed to fetch user details')
    } finally {
      setLoading(false);
    }
  };

  // Function to edit user details
  const editUserDetails = async (updates) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put("/api/edit-user", updates);
      setUserData((prev) => ({ ...prev, ...updates }));
      toast.success('user details updated successfully')
    } catch (error) {
      console.error("Error updating user details:", error);
      toast.error('failed to update user details')
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

// Custom hook for easy access to the context
export const useEditUser = () => useContext(EditUserContext);

export default EditUserProvider;
