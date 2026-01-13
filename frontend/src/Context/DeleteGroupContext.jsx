import { createContext, useContext } from "react";
import axiosInstance from "../utils/axiosInstance";
import { FetchAllGroupsContext } from "./fetchAllGroupsContext";

export const DeleteGroupContext = createContext();

const DeleteGroupProvider = ({ children }) => {
  const { fetchAllGroups } = useContext(FetchAllGroupsContext);

  const handleDeleteGroup = async (groupId) => {
    try {
      await axiosInstance.delete(`/api/deletegroup/${groupId}`);
      alert("Group deleted succesfully");
      fetchAllGroups();
    } catch (error) {
      console.error("error deleting group:", error);
      alert('failed to delete group')
    }
  }

  return (
    <DeleteGroupContext.Provider value={{
      handleDeleteGroup
    }}>
      {children}
    </DeleteGroupContext.Provider>
  )
}

export const useDelete = () => useContext(DeleteGroupContext)

export default DeleteGroupProvider;