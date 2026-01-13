import React, { createContext, useState } from "react";

const SettingsContext = createContext();

const SettingsProvider = ({ children }) => {
  const [openSettings, setOpenSettings] = useState(false);
  const [openManageUser, setOpenManageUser] = useState(false)
  const [openGroupManager, setOpenGroupManager] = useState(false)
  return (
    <SettingsContext.Provider value={{
      openSettings,
      setOpenSettings,
      openManageUser,
      setOpenManageUser,
      openGroupManager, setOpenGroupManager
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider
export { SettingsContext };