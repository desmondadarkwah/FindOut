const { Server } = require('socket.io');
const { MessageModel, ChatModel } = require('../models/MessageModel');
const GroupModel = require('../models/GroupModel');
const User = require('../models/UserModel');

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
    console.log(`✅ User connected: ${socket.id}`);

    // ═══════════════════════════════════════════════════════════════
    // USER ONLINE/OFFLINE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    socket.on('user-online', async (userId) => {
      try {
        // Mark user as online
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
          socketId: socket.id
        });

        // Find all chats this user participates in
        const [chats, groups] = await Promise.all([
          ChatModel.find({ participants: userId }).lean(),
          GroupModel.find({ members: userId }).lean()
        ]);

        const allChatIds = [
          ...chats.map(c => c._id.toString()),
          ...groups.map(g => g._id.toString())
        ];

        // Update all 'sent' messages to 'delivered' in these chats
        const result = await MessageModel.updateMany(
          {
            chatId: { $in: allChatIds },
            senderId: { $ne: userId },
            status: 'sent'
          },
          {
            $set: {
              status: 'delivered',
              deliveredAt: new Date()
            }
          }
        );

        // Notify senders that their messages are now delivered
        if (result.modifiedCount > 0) {
          console.log(`📬 Updated ${result.modifiedCount} messages to 'delivered' for user ${userId}`);

          allChatIds.forEach(chatId => {
            io.to(chatId).emit('messages-delivered', {
              chatId,
              recipientUserId: userId, // User who came online
              deliveredAt: new Date()
            });
          });
        }

        // Broadcast online status to all users
        socket.broadcast.emit('user-status-changed', {
          userId,
          isOnline: true,
          lastSeen: new Date()
        });

        console.log(`🟢 User ${userId} is now ONLINE`);
      } catch (error) {
        console.error('❌ Error updating user online status:', error);
      }
    });

    // ═══════════════════════════════════════════════════════════════
    // ACTIVE CHAT TRACKING
    // ═══════════════════════════════════════════════════════════════

    socket.on('viewing-chat', (data) => {
      socket.data = socket.data || {};
      socket.data.viewingChat = data.chatId;
      socket.data.userId = data.userId;
      console.log(`👁️  User ${data.userId} is viewing chat ${data.chatId}`);
    });

    socket.on('left-chat-view', () => {
      if (socket.data) {
        console.log(`👁️  User ${socket.data.userId} left chat view`);
        socket.data.viewingChat = null;
      }
    });

    socket.on('join-chat', (chatId) => {
      socket.join(chatId);
      console.log(`🔗 User joined chat: ${chatId}`);
    });

    // ═══════════════════════════════════════════════════════════════
    // TEXT MESSAGE HANDLING
    // ═══════════════════════════════════════════════════════════════

    socket.on('send-message', async (messageData, acknowledge) => {
      try {
        const tempId = `temp-${Date.now()}-${socket.id}`;

        // Fetch sender info immediately for instant display
        const sender = await User.findById(messageData.senderId)
          .select('name email profilePicture')
          .lean();

        if (!sender) {
          return acknowledge({
            status: 'error',
            error: 'Sender not found'
          });
        }

        // 1. Immediately acknowledge to sender (no waiting)
        acknowledge({
          status: 'success',
          tempId,
          message: {
            _id: tempId,
            ...messageData,
            senderId: sender,
            createdAt: new Date().toISOString(),
            status: 'sending'
          }
        });

        // 2. Check if any recipient is online
        const chat = await ChatModel.findById(messageData.chatId)
          .populate('participants', '_id isOnline');
        const group = !chat
          ? await GroupModel.findById(messageData.chatId)
            .populate('members', '_id isOnline')
          : null;

        const recipients = chat ? chat.participants : (group ? group.members : []);
        const recipientIds = recipients.filter(
          p => p._id.toString() !== messageData.senderId.toString()
        );
        const anyRecipientOnline = recipientIds.some(r => r.isOnline === true);

        // 3. Broadcast to other users in room immediately
        socket.to(messageData.chatId).emit('message-received', {
          _id: tempId,
          chatId: messageData.chatId,
          senderId: sender,
          content: messageData.content,
          type: messageData.type,
          createdAt: new Date().toISOString(),
          status: 'delivered',
          isOptimistic: true
        });

        // 4. Persist to database asynchronously (non-blocking)
        setImmediate(async () => {
          try {
            // Save message to database
            const message = new MessageModel({
              chatId: messageData.chatId,
              senderId: messageData.senderId,
              content: messageData.content,
              type: messageData.type,
              status: anyRecipientOnline ? 'delivered' : 'sent',
              deliveredAt: anyRecipientOnline ? new Date() : null
            });

            const savedMessage = await message.save();

            // Get list of users actively viewing this chat
            const roomSockets = await io.in(messageData.chatId).fetchSockets();
            const activeViewers = [];

            roomSockets.forEach(s => {
              if (s.data?.viewingChat === messageData.chatId && s.data?.userId) {
                activeViewers.push(s.data.userId);
              }
            });

            console.log(`📊 Active viewers in chat ${messageData.chatId}:`, activeViewers.length > 0 ? activeViewers : 'none');

            // Update chat metadata with atomic operations
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
                arrayFilters: [
                  {
                    'elem.userId': {
                      $ne: messageData.senderId,
                      $nin: activeViewers
                    }
                  }
                ],
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
                arrayFilters: [
                  {
                    'elem.userId': {
                      $ne: messageData.senderId,
                      $nin: activeViewers
                    }
                  }
                ],
                new: true
              }
            ).lean();

            await Promise.all([chatUpdate, groupUpdate]);

            // Populate sender info for confirmation
            const populatedMessage = await MessageModel.findById(savedMessage._id)
              .populate('senderId', 'name email profilePicture')
              .lean();

            // Emit confirmed message to replace optimistic one
            io.to(messageData.chatId).emit('message-confirmed', {
              tempId,
              message: populatedMessage
            });

            // Emit updated chat for sidebar
            const updatedChatDoc = chat || group;
            if (updatedChatDoc) {
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
            console.error('❌ Error persisting message:', error);
            io.to(messageData.chatId).emit('message-error', {
              tempId,
              error: error.message
            });
          }
        });

      } catch (error) {
        console.error('❌ Error sending message:', error);
        acknowledge({ status: 'error', error: error.message });
      }
    });

    // ═══════════════════════════════════════════════════════════════
    // AUDIO MESSAGE HANDLING
    // ═══════════════════════════════════════════════════════════════

    socket.on('send-audio-message', async (messageData, acknowledge) => {
      try {
        const message = await MessageModel.findById(messageData.messageId)
          .populate('senderId', 'name email profilePicture')
          .lean();

        if (!message) {
          return acknowledge({
            status: 'error',
            error: 'Message not found'
          });
        }

        // Broadcast immediately to other users
        socket.to(messageData.chatId).emit('message-received', message);

        // Update chat metadata asynchronously
        setImmediate(async () => {
          try {
            // Get active viewers
            const roomSockets = await io.in(messageData.chatId).fetchSockets();
            const activeViewers = [];

            roomSockets.forEach(s => {
              if (s.data?.viewingChat === messageData.chatId && s.data?.userId) {
                activeViewers.push(s.data.userId);
              }
            });

            // Update both chat and group models
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
                {
                  arrayFilters: [{
                    'elem.userId': {
                      $ne: message.senderId._id,
                      $nin: activeViewers
                    }
                  }]
                }
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
                {
                  arrayFilters: [{
                    'elem.userId': {
                      $ne: message.senderId._id,
                      $nin: activeViewers
                    }
                  }]
                }
              )
            ];

            await Promise.all(updatePromises);
          } catch (error) {
            console.error('❌ Error updating audio message metadata:', error);
          }
        });

        if (acknowledge) {
          acknowledge({ status: 'success' });
        }
      } catch (error) {
        console.error('❌ Error with audio message:', error);
        if (acknowledge) {
          acknowledge({ status: 'error', error: error.message });
        }
      }
    });

    // ═══════════════════════════════════════════════════════════════
    // READ RECEIPTS
    // ═══════════════════════════════════════════════════════════════

    socket.on('mark-messages-read', async (data) => {
      const { chatId, userId } = data;

      try {
        const result = await MessageModel.updateMany(
          {
            chatId: chatId,
            senderId: { $ne: userId },
            status: { $in: ['sent', 'delivered'] }
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
          io.to(chatId).emit('messages-read', {
            chatId,
            readerUserId: userId, // User who read the messages
            readAt: new Date()
          });

          console.log(`✅ ${result.modifiedCount} messages marked as read in chat ${chatId}`);
        }
      } catch (error) {
        console.error('❌ Error marking messages as read:', error);
      }
    });

    socket.on('mark-chat-read', async (data) => {
      const { chatId, userId } = data;

      try {
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
          console.log(`✅ Chat ${chatId} marked as read for user ${userId}`);
        }
      } catch (error) {
        console.error('❌ Error marking chat as read:', error);
      }
    });

    // Add these socket events in your io.on('connection') block

    socket.on('join-group-room', (groupId) => {
      socket.join(groupId);
      console.log(`🔗 User joined group room: ${groupId}`);
    });

    // ═══════════════════════════════════════════════════════════════
    // DISCONNECT HANDLING
    // ═══════════════════════════════════════════════════════════════

    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${socket.id}`);

      try {
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
          socket.broadcast.emit('user-status-changed', {
            userId: user._id.toString(),
            isOnline: false,
            lastSeen: new Date()
          });

          console.log(`🔴 User ${user._id} is now OFFLINE`);
        }
      } catch (error) {
        console.error('❌ Error updating user offline status:', error);
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