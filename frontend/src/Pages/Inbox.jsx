import React, { useContext, useEffect } from 'react';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';
import socket from '../socket/socket';
import IconsSidebar from '../components/IconsSidebar';
import { ChatContext } from '../Context/ChatContext';

const Inbox = () => {
  const { selectedChat, setSelectedChat, setUserId } = useContext(ChatContext);

  useEffect(() => {
    socket.on('connect', () => console.log(`Connected: ${socket.id}`));
    socket.on('disconnect', () => console.log('Disconnected:', socket.id));

    return () => {};
  }, []);

  return (
    <div className="flex">
      <IconsSidebar />
      <ChatSidebar />
      <ChatWindow selectedChat={selectedChat} />
    </div>
  );
};

export default Inbox;
