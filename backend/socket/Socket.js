const { Server } = require('socket.io');
const { MessageModel, ChatModel } = require('../models/MessageModel');
const GroupModel = require('../models/GroupModel');

let io;

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-chat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined Chat: ${chatId}`);
    });

    socket.on('send-message', async (messageData, acknowledge) => {
      try {
        const message = new MessageModel({
          chatId: messageData.chatId,
          senderId: messageData.senderId,
          content: messageData.content,
          type: messageData.type
        });

        const savedMessage = await message.save();
        const populatedMessage = await savedMessage.populate('senderId', 'name email profilePicture');

        await ChatModel.findByIdAndUpdate(messageData.chatId, {
          lastMessage: {
            content: messageData.content,
            senderId: messageData.senderId,
            type: messageData.type,
            createdAt: new Date()
          }
        });

        await GroupModel.findByIdAndUpdate(messageData.chatId, {
          lastMessage: {
            content: messageData.content,
            senderId: messageData.senderId,
            type: messageData.type,
            createdAt: new Date()
          }
        });

        // Send the message to EVERYONE in the chat (including sender)
        io.to(messageData.chatId).emit('message-received', populatedMessage);

        acknowledge({ status: 'success', message: populatedMessage });
      } catch (error) {
        console.error('Error sending message:', error);
        acknowledge({ status: 'error', error: error.message });
      }
    });

    socket.on('send-audio-message', async (messageData, acknowledge) => {
      try {
        const message = await MessageModel.findById(messageData.messageId)
          .populate('senderId', 'name email profilePicture');

        socket.to(messageData.chatId).emit('message-received', message);
        if (acknowledge) {
          acknowledge({ status: 'success' });
        }
      } catch (error) {
        console.error('Error with audio message notification:', error);
        if (acknowledge) {
          acknowledge({ status: 'error', error: error.message });
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initializeSocket, getIo };