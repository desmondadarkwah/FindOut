import React, { useContext, useEffect } from 'react';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';
import socket from '../socket/socket';
import IconsSidebar from '../components/IconsSidebar';
import { ChatContext } from '../Context/ChatContext';

const Inbox = () => {
  const { selectedChat, setSelectedChat, userId } = useContext(ChatContext); // ✅ Added userId here

  useEffect(() => {
    socket.on('connect', () => console.log('Connected:', socket.id));
    socket.on('disconnect', () => console.log('Disconnected:', socket.id));
    
    return () => {};
  }, []);

  // ✅ NEW: Emit user-online when component mounts and userId is available
  useEffect(() => {
    if (!socket || !userId) return;

    console.log('📢 Emitting user-online for userId:', userId);
    
    // Emit that current user is online
    socket.emit('user-online', userId);

    // Handle page visibility (user switches tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User came back to the tab
        socket.emit('user-online', userId);
        console.log('👀 User came back, emitting user-online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId]); // ✅ Runs when userId is set

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <IconsSidebar />
      <ChatSidebar />
      <ChatWindow selectedChat={selectedChat} />
    </div>
  );
};

export default Inbox;