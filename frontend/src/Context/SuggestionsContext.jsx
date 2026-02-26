import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { ChatContext } from "./ChatContext";
import { useNavigate } from "react-router-dom";

export const SuggestionsContext = createContext();

const SuggestionsProvider = ({ children }) => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setChats, setSelectedChat } = useContext(ChatContext);

  const navigate = useNavigate();

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/api/suggestions');
      setSuggestedUsers(response.data.suggestedUsers);
      setSuggestedGroups(response.data.suggestedGroups);
      console.log('suggestion: ', response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setError('Failed to load suggestions.');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // CONNECT PRIVATE CHAT (User DM)
  // ─────────────────────────────────────────
  const handleConnectPrivateChat = async (userIdToChat) => {
    try {
      const response = await axiosInstance.post("/api/start-new-chat", { userIdToChat });
      const newChatId = response.data.chat._id;

      const allChatsResponse = await axiosInstance.get(`/api/chats`);
      const allChats = allChatsResponse.data.chats;

      const fullChat = allChats.find(chat => chat._id === newChatId);

      if (fullChat) {
        setSelectedChat(fullChat);
        setChats((prevChats) => {
          const chatExists = prevChats.some(chat => chat._id === fullChat._id);
          if (chatExists) return prevChats;
          return [...prevChats, fullChat];
        });
        navigate("/inbox");
      } else {
        console.error('Could not find the newly created chat');
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  // ─────────────────────────────────────────
  // ✅ NEW: OPEN GROUP CHAT DIRECTLY
  // ─────────────────────────────────────────
  const handleOpenGroupChat = async (groupId) => {
    try {
      // Fetch all chats to find the group
      const allChatsResponse = await axiosInstance.get(`/api/chats`);
      const allChats = allChatsResponse.data.chats;

      // Find the group in chats
      const groupChat = allChats.find(chat => chat._id === groupId);

      if (groupChat) {
        // Add to chats list if not already there
        setChats((prevChats) => {
          const exists = prevChats.some(chat => chat._id === groupId);
          if (exists) return prevChats;
          return [groupChat, ...prevChats];
        });

        // Open the group chat
        setSelectedChat(groupChat);
        navigate("/inbox");
      } else {
        console.error('Group chat not found');
      }
    } catch (error) {
      console.error("Error opening group chat:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchSuggestions();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <SuggestionsContext.Provider value={{
      suggestedUsers,
      suggestedGroups,
      loading,
      error,
      fetchSuggestions,
      handleConnectPrivateChat,
      handleOpenGroupChat // ✅ Export new function
    }}>
      {children}
    </SuggestionsContext.Provider>
  );
};

export default SuggestionsProvider;