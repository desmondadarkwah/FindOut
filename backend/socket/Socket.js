const { Server } = require('socket.io');
const { MessageModel, ChatModel } = require('../models/MessageModel');
const GroupModel = require('../models/GroupModel');
const User = require('../models/UserModel'); // ✅ ADDED - Import User model for online status

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

    // ✅ NEW: Handle user going online
    socket.on('user-online', async (userId) => {
      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
          socketId: socket.id
        });

        // Broadcast to all users that this user is now online
        socket.broadcast.emit('user-status-changed', {
          userId,
          isOnline: true,
          lastSeen: new Date()
        });

        console.log(`✅ User ${userId} is now ONLINE`);
      } catch (error) {
        console.error('Error updating user online status:', error);
      }
    });

    socket.on('join-chat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined Chat: ${chatId}`);
    });

    // ✅ OPTIMIZED: Handle message sending with instant delivery
    // socket.on('send-message', async (messageData, acknowledge) => {
    //   try {
    //     // 1. ✅ IMMEDIATELY acknowledge to sender (no waiting)
    //     const tempId = `temp-${Date.now()}-${socket.id}`;
    //     acknowledge({ 
    //       status: 'success', 
    //       tempId,
    //       message: {
    //         _id: tempId,
    //         ...messageData,
    //         senderId: { _id: messageData.senderId },
    //         createdAt: new Date().toISOString()
    //       }
    //     });

    //     // 2. ✅ Broadcast to OTHER users in room IMMEDIATELY
    //     socket.to(messageData.chatId).emit('message-received', {
    //       _id: tempId,
    //       chatId: messageData.chatId,
    //       senderId: messageData.senderId,
    //       content: messageData.content,
    //       type: messageData.type,
    //       createdAt: new Date().toISOString(),
    //       isOptimistic: true
    //     });

    //     // 3. ✅ Persist to database ASYNCHRONOUSLY (non-blocking)
    //     setImmediate(async () => {
    //       try {
    //         const message = new MessageModel({
    //           chatId: messageData.chatId,
    //           senderId: messageData.senderId,
    //           content: messageData.content,
    //           type: messageData.type
    //         });

    //         const savedMessage = await message.save();

    //         // ✅ Single atomic update for Chat/Group
    //         const updatePromises = [];

    //         const chatUpdate = ChatModel.findByIdAndUpdate(
    //           messageData.chatId,
    //           {
    //             lastMessage: {
    //               content: messageData.content,
    //               senderId: messageData.senderId,
    //               type: messageData.type,
    //               createdAt: savedMessage.createdAt
    //             },
    //             $inc: {
    //               'unreadCount.$[elem].count': 1
    //             }
    //           },
    //           {
    //             arrayFilters: [{ 'elem.userId': { $ne: messageData.senderId } }],
    //             new: true
    //           }
    //         ).lean();

    //         const groupUpdate = GroupModel.findByIdAndUpdate(
    //           messageData.chatId,
    //           {
    //             lastMessage: {
    //               content: messageData.content,
    //               senderId: messageData.senderId,
    //               type: messageData.type,
    //               createdAt: savedMessage.createdAt
    //             },
    //             $inc: {
    //               'unreadCount.$[elem].count': 1
    //             }
    //           },
    //           {
    //             arrayFilters: [{ 'elem.userId': { $ne: messageData.senderId } }],
    //             new: true
    //           }
    //         ).lean();

    //         updatePromises.push(chatUpdate, groupUpdate);
    //         const [chat, group] = await Promise.all(updatePromises);

    //         // ✅ Populate sender info once
    //         const populatedMessage = await MessageModel.findById(savedMessage._id)
    //           .populate('senderId', 'name email profilePicture')
    //           .lean();

    //         // ✅ Emit real message to replace optimistic one
    //         io.to(messageData.chatId).emit('message-confirmed', {
    //           tempId,
    //           message: populatedMessage
    //         });

    //         // ✅ Emit updated chat for sidebar (with populated data)
    //         const updatedChat = chat || group;
    //         if (updatedChat) {
    //           const populatedChat = chat 
    //             ? await ChatModel.findById(messageData.chatId)
    //                 .populate('participants', 'name profilePicture')
    //                 .populate('lastMessage.senderId', 'name profilePicture')
    //                 .lean()
    //             : await GroupModel.findById(messageData.chatId)
    //                 .populate('members', 'name profilePicture')
    //                 .populate('lastMessage.senderId', 'name profilePicture')
    //                 .lean();

    //           io.to(messageData.chatId).emit('chat-updated', populatedChat);
    //         }

    //       } catch (error) {
    //         console.error('Error persisting message:', error);
    //         io.to(messageData.chatId).emit('message-error', { tempId, error: error.message });
    //       }
    //     });

    //   } catch (error) {
    //     console.error('Error sending message:', error);
    //     acknowledge({ status: 'error', error: error.message });
    //   }
    // });

    socket.on('send-message', async (messageData, acknowledge) => {
      try {
        // 1. ✅ IMMEDIATELY acknowledge to sender
        const tempId = `temp-${Date.now()}-${socket.id}`;
        acknowledge({
          status: 'success',
          tempId,
          message: {
            _id: tempId,
            ...messageData,
            senderId: { _id: messageData.senderId },
            createdAt: new Date().toISOString(),
            status: 'sending' // ✅ Initial status
          }
        });

        // 2. ✅ Check if recipient is online
        const chat = await ChatModel.findById(messageData.chatId).populate('participants', '_id isOnline');
        const group = !chat ? await GroupModel.findById(messageData.chatId).populate('members', '_id isOnline') : null;

        const recipients = chat ? chat.participants : (group ? group.members : []);
        const recipientIds = recipients.filter(p => p._id.toString() !== messageData.senderId.toString());

        // Check if ANY recipient is online
        const anyRecipientOnline = recipientIds.some(r => r.isOnline === true);

        // 3. ✅ Broadcast to OTHER users in room IMMEDIATELY
        socket.to(messageData.chatId).emit('message-received', {
          _id: tempId,
          chatId: messageData.chatId,
          senderId: messageData.senderId,
          content: messageData.content,
          type: messageData.type,
          createdAt: new Date().toISOString(),
          status: 'delivered', // ✅ Delivered if they're in the chat room
          isOptimistic: true
        });

        // 4. ✅ Persist to database ASYNCHRONOUSLY
        setImmediate(async () => {
          try {
            const message = new MessageModel({
              chatId: messageData.chatId,
              senderId: messageData.senderId,
              content: messageData.content,
              type: messageData.type,
              status: anyRecipientOnline ? 'delivered' : 'sent', // ✅ Set initial status
              deliveredAt: anyRecipientOnline ? new Date() : null
            });

            const savedMessage = await message.save();

            // ✅ Single atomic update for Chat/Group
            const updatePromises = [];

            const chatUpdate = ChatModel.findByIdAndUpdate(
              messageData.chatId,
              {
                lastMessage: {
                  content: messageData.content,
                  senderId: messageData.senderId,
                  type: messageData.type,
                  createdAt: savedMessage.createdAt
                },
                $inc: {
                  'unreadCount.$[elem].count': 1
                }
              },
              {
                arrayFilters: [{ 'elem.userId': { $ne: messageData.senderId } }],
                new: true
              }
            ).lean();

            const groupUpdate = GroupModel.findByIdAndUpdate(
              messageData.chatId,
              {
                lastMessage: {
                  content: messageData.content,
                  senderId: messageData.senderId,
                  type: messageData.type,
                  createdAt: savedMessage.createdAt
                },
                $inc: {
                  'unreadCount.$[elem].count': 1
                }
              },
              {
                arrayFilters: [{ 'elem.userId': { $ne: messageData.senderId } }],
                new: true
              }
            ).lean();

            updatePromises.push(chatUpdate, groupUpdate);
            await Promise.all(updatePromises);

            // ✅ Populate sender info once
            const populatedMessage = await MessageModel.findById(savedMessage._id)
              .populate('senderId', 'name email profilePicture')
              .lean();

            // ✅ Emit real message to replace optimistic one
            io.to(messageData.chatId).emit('message-confirmed', {
              tempId,
              message: populatedMessage
            });

            // ✅ Emit updated chat for sidebar
            const updatedChat = chat || group;
            if (updatedChat) {
              const populatedChat = chat
                ? await ChatModel.findById(messageData.chatId)
                  .populate('participants', 'name profilePicture')
                  .populate('lastMessage.senderId', 'name profilePicture')
                  .lean()
                : await GroupModel.findById(messageData.chatId)
                  .populate('members', 'name profilePicture')
                  .populate('lastMessage.senderId', 'name profilePicture')
                  .lean();

              io.to(messageData.chatId).emit('chat-updated', populatedChat);
            }

          } catch (error) {
            console.error('Error persisting message:', error);
            io.to(messageData.chatId).emit('message-error', { tempId, error: error.message });
          }
        });

      } catch (error) {
        console.error('Error sending message:', error);
        acknowledge({ status: 'error', error: error.message });
      }
    });

    // ✅ NEW: Mark message as read
    socket.on('mark-messages-read', async (data) => {
      const { chatId, userId } = data;

      try {
        // Update all unread messages in this chat to 'read' status
        const result = await MessageModel.updateMany(
          {
            chatId: chatId,
            senderId: { $ne: userId }, // Not sent by current user
            status: { $in: ['sent', 'delivered'] } // Only update unread messages
          },
          {
            $set: { status: 'read' },
            $addToSet: {
              readBy: {
                userId: userId,
                readAt: new Date()
              }
            }
          }
        );

        if (result.modifiedCount > 0) {
          // Notify sender(s) that their messages were read
          io.to(chatId).emit('messages-read', {
            chatId,
            userId,
            readAt: new Date()
          });

          console.log(`✅ ${result.modifiedCount} messages marked as read in chat ${chatId}`);
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('send-audio-message', async (messageData, acknowledge) => {
      try {
        const message = await MessageModel.findById(messageData.messageId)
          .populate('senderId', 'name email profilePicture')
          .lean();

        // ✅ Broadcast immediately
        socket.to(messageData.chatId).emit('message-received', message);

        // ✅ Update chat/group asynchronously
        setImmediate(async () => {
          const updatePromises = [
            ChatModel.findByIdAndUpdate(
              messageData.chatId,
              {
                lastMessage: {
                  content: message.content,
                  senderId: message.senderId._id,
                  type: 'audio',
                  createdAt: new Date()
                },
                $inc: { 'unreadCount.$[elem].count': 1 }
              },
              { arrayFilters: [{ 'elem.userId': { $ne: message.senderId._id } }] }
            ),
            GroupModel.findByIdAndUpdate(
              messageData.chatId,
              {
                lastMessage: {
                  content: message.content,
                  senderId: message.senderId._id,
                  type: 'audio',
                  createdAt: new Date()
                },
                $inc: { 'unreadCount.$[elem].count': 1 }
              },
              { arrayFilters: [{ 'elem.userId': { $ne: message.senderId._id } }] }
            )
          ];

          await Promise.all(updatePromises);
        });

        if (acknowledge) {
          acknowledge({ status: 'success' });
        }
      } catch (error) {
        console.error('Error with audio message:', error);
        if (acknowledge) {
          acknowledge({ status: 'error', error: error.message });
        }
      }
    });

    socket.on('mark-chat-read', async (data) => {
      const { chatId, userId } = data;

      try {
        // ✅ Use atomic update instead of find + modify + save
        const [chat, group] = await Promise.all([
          ChatModel.findOneAndUpdate(
            { _id: chatId, 'unreadCount.userId': userId },
            { $set: { 'unreadCount.$.count': 0 } },
            { new: true }
          ),
          GroupModel.findOneAndUpdate(
            { _id: chatId, 'unreadCount.userId': userId },
            { $set: { 'unreadCount.$.count': 0 } },
            { new: true }
          )
        ]);

        if (chat || group) {
          socket.emit('chat-marked-read', { chatId, userId });
        }
      } catch (error) {
        console.error('Error marking chat as read:', error);
      }
    });

    // ✅ NEW: Handle user disconnect - mark offline
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.id}`);

      try {
        // Find user by socketId and mark offline
        const user = await User.findOneAndUpdate(
          { socketId: socket.id },
          {
            isOnline: false,
            lastSeen: new Date(),
            socketId: null
          },
          { new: true }
        );

        if (user) {
          // Broadcast to all users that this user is now offline
          socket.broadcast.emit('user-status-changed', {
            userId: user._id.toString(),
            isOnline: false,
            lastSeen: new Date()
          });

          console.log(`❌ User ${user._id} is now OFFLINE`);
        }
      } catch (error) {
        console.error('Error updating user offline status:', error);
      }
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