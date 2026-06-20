import { createContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

export const ChatContext = createContext();

const ChatContextProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [userId, setUserId] = useState(null);
  const [barsToHidden, setBarsToHidden] = useState(true);
  const [showChatOptions, setShowChatOptions] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // ✅ CHECK TOKEN FIRST - if no token, user is not logged in, stop immediately
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        // Check if userId is already in localStorage
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
          return;
        }

        // Otherwise fetch from backend
        const response = await axiosInstance.get('/api/chats');
        if (response.data.userId) {
          setUserId(response.data.userId);
          localStorage.setItem('userId', response.data.userId);
        }
      } catch (error) {
        console.error('Error fetching userId:', error);
      }
    };

    if (!userId) {
      fetchUserId();
    }
  }, [userId]);

  return (
    <ChatContext.Provider value={{
      chats, 
      setChats,
      selectedChat, 
      setSelectedChat,
      userId, 
      setUserId,
      barsToHidden, 
      setBarsToHidden,
      showChatOptions, 
      setShowChatOptions,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export default ChatContextProvider;