import { createContext, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

export const FetchAllGroupsContext = createContext();

const FetchAllGroupsProvider = ({ children }) => {
  const [myGroups, setMyGroups] = useState([]);

  const fetchAllGroups = async () => {
    const response = await axiosInstance.get('/api/my-groups')
    setMyGroups(response.data)
    console.log('my groups: ', myGroups);
  };

  return (
    <FetchAllGroupsContext.Provider value={{
      myGroups,
      fetchAllGroups
    }}>
      {children}
    </FetchAllGroupsContext.Provider>
  )
}

export default FetchAllGroupsProvider;