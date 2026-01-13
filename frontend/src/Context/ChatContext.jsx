import { createContext, useState } from 'react';

export const ChatContext = createContext();

const ChatContextProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [userId, setUserId] = useState(null);
  const [barsToHidden, setBarsToHidden] = useState(true);
  const [showChatOptions, setShowChatOptions] = useState(false);

// const HideGroupOptions = () => {
//   setShowChatOptions(false)
// }

  return (
    <ChatContext.Provider value={{
      chats, setChats,
      selectedChat, setSelectedChat,
      userId, setUserId,
      barsToHidden, setBarsToHidden,
      showChatOptions, setShowChatOptions,
      // HideGroupOptions
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export default ChatContextProvider;
