import { createContext, useContext } from "react";
import axiosInstance from "../utils/axiosInstance";
import { FetchAllGroupsContext } from "./fetchAllGroupsContext";
import { useToast } from "./ToastContext"; // ✅ NEW

export const DeleteGroupContext = createContext();

const DeleteGroupProvider = ({ children }) => {
  const { fetchAllGroups } = useContext(FetchAllGroupsContext);
  const { toast, confirm } = useToast(); // ✅ NEW

  const handleDeleteGroup = async (groupId, groupName) => {
    // ✅ Show confirm dialog
    const confirmed = await confirm({
      title: 'Delete Group',
      message: `Are you sure you want to delete "${groupName}"? This action cannot be undone and will remove all messages.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmStyle: 'danger'
    });

    if (!confirmed) return; // User cancelled

    try {
      await axiosInstance.delete(`/api/deletegroup/${groupId}`);
      
      // ✅ Success toast
      toast.success(`${groupName} has been deleted`, 'Group Deleted');
      
      fetchAllGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
      
      // ✅ Error toast
      toast.error(
        error.response?.data?.message || 'Failed to delete group',
        'Delete Failed'
      );
    }
  };

  return (
    <DeleteGroupContext.Provider value={{ handleDeleteGroup }}>
      {children}
    </DeleteGroupContext.Provider>
  );
};

export const useDelete = () => useContext(DeleteGroupContext);
export default DeleteGroupProvider;