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
  const { setChats,setSelectedChat } = useContext(ChatContext); // Store chat list

  const navigate = useNavigate();

  const fetchSuggestions = async () => {
    setLoading(true); // Start loading
    setError(null); // Reset error state
    try {
      const response = await axiosInstance.get('/api/suggestions');
      setSuggestedUsers(response.data.suggestedUsers);
      setSuggestedGroups(response.data.suggestedGroups);

    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setError('Failed to load suggestions.'); // Set error message
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleConnectPrivateChat = async (userIdToChat) => {
    try {
      // Step 1: Create the chat
      const response = await axiosInstance.post("/api/start-new-chat", { userIdToChat });
      const newChatId = response.data.chat._id;
      
      
      // Step 2: Fetch all chats (which includes the newly created one with populated data)
      const allChatsResponse = await axiosInstance.get(`/api/chats`);
      const allChats = allChatsResponse.data.chats; // Access .chats property
      
      // Find the newly created chat
      const fullChat = allChats.find(chat => chat._id === newChatId);
      
      if (fullChat) {
        console.log('Full chat with populated participants:', fullChat);
        
        setSelectedChat(fullChat);
        
        setChats((prevChats) => {
          const chatExists = prevChats.some(chat => chat._id === fullChat._id);
          if (chatExists) {
            return prevChats;
          }
          return [...prevChats, fullChat];
        });
        
        navigate("/inbox");
      } else {
        console.error('Could not find the newly created chat');
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchSuggestions();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <SuggestionsContext.Provider value={{ suggestedUsers, suggestedGroups, loading, error, fetchSuggestions, handleConnectPrivateChat }}>
      {children}
    </SuggestionsContext.Provider>
  );
}

export default SuggestionsProvider;
