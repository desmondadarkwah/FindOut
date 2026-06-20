import React, { useContext, useEffect, useState } from 'react';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';
import socket from '../socket/socket';
import IconsSidebar from '../components/IconsSidebar';
import { ChatContext } from '../Context/ChatContext';

const Inbox = () => {
  const { selectedChat, setSelectedChat, userId } = useContext(ChatContext);
  const [showChatSidebar, setShowChatSidebar] = useState(true); // ✅ Toggle state

  useEffect(() => {
    socket.on('connect', () => console.log('Connected:', socket.id));
    socket.on('disconnect', () => console.log('Disconnected:', socket.id));
    return () => {};
  }, []);

  useEffect(() => {
    if (!socket || !userId) return;

    console.log('📢 Emitting user-online for userId:', userId);
    socket.emit('user-online', userId);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        socket.emit('user-online', userId);
        console.log('👀 User came back, emitting user-online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <IconsSidebar 
        showChatSidebar={showChatSidebar}
        setShowChatSidebar={setShowChatSidebar}
      />
      <ChatSidebar showChatSidebar={showChatSidebar} />
      <ChatWindow selectedChat={selectedChat} />
    </div>
  );
};

export default Inbox;