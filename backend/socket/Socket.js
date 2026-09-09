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
        socket.join(userId);
        console.log(`🔗 User ${userId} joined their personal room`);

        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
          socketId: socket.id
        });

        const [chats, groups] = await Promise.all([
          ChatModel.find({ participants: userId }).lean(),
          GroupModel.find({ members: userId }).lean()
        ]);

        const allChatIds = [
          ...chats.map(c => c._id.toString()),
          ...groups.map(g => g._id.toString())
        ];

        allChatIds.forEach(chatId => {
          socket.join(chatId);
          console.log(`🔗 User ${userId} joined room ${chatId}`);
        });

        const result = await MessageModel.updateMany(
          {
            chatId: { $in: allChatIds },
            senderId: { $ne: userId },
            status: 'sent'
          },
          { $set: { status: 'delivered', deliveredAt: new Date() } }
        );

        if (result.modifiedCount > 0) {
          console.log(`📬 Updated ${result.modifiedCount} messages to 'delivered' for user ${userId}`);
          allChatIds.forEach(chatId => {
            io.to(chatId).emit('messages-delivered', {
              chatId,
              recipientUserId: userId,
              deliveredAt: new Date()
            });
          });
        }

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

        // ✅ Fetch sender info
        const sender = await User.findById(messageData.senderId)
          .select('name email profilePicture blockedUsers')
          .lean();

        if (!sender) {
          return acknowledge({ status: 'error', error: 'Sender not found' });
        }

        // ✅ Get chat to find other participant
        const chat = await ChatModel.findById(messageData.chatId)
          .populate('participants', '_id isOnline blockedUsers');

        // ✅ BLOCK CHECK - only for private chats
        if (chat && !chat.isGroup) {
          const otherParticipant = chat.participants.find(
            p => p._id.toString() !== messageData.senderId.toString()
          );

          if (otherParticipant) {
            // Check if other user blocked the sender
            const senderIsBlockedByOther = otherParticipant.blockedUsers
              ?.map(id => id.toString())
              .includes(messageData.senderId.toString());

            // Check if sender blocked the other user
            const senderBlockedOther = sender.blockedUsers
              ?.map(id => id.toString())
              .includes(otherParticipant._id.toString());

            if (senderIsBlockedByOther || senderBlockedOther) {
              console.log(`🚫 Message silently dropped - user is blocked`);

              // ✅ Acknowledge success to sender - they don't know they're blocked
              acknowledge({
                status: 'success',
                tempId,
                message: {
                  _id: tempId,
                  ...messageData,
                  senderId: sender,
                  createdAt: new Date().toISOString(),
                  status: 'sent' // ✅ Single tick forever - never delivered
                }
              });

              // ✅ Save to database so sender sees their message
              setImmediate(async () => {
                try {
                  const message = new MessageModel({
                    chatId: messageData.chatId,
                    senderId: messageData.senderId,
                    content: messageData.content,
                    type: messageData.type,
                    status: 'sent', // ✅ Never becomes delivered or read
                    deliveredAt: null
                  });
                  const savedMessage = await message.save();

                  const populatedMessage = await MessageModel.findById(savedMessage._id)
                    .populate('senderId', 'name email profilePicture')
                    .lean();

                  // ✅ Confirm message to sender only (NOT broadcast to blocked user)
                  socket.emit('message-confirmed', {
                    tempId,
                    message: populatedMessage
                  });
                } catch (error) {
                  console.error('❌ Error saving blocked message:', error);
                }
              });

              return; // ✅ Stop here - don't broadcast to the other user
            }
          }
        }

        // ✅ Immediately acknowledge to sender
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

        // ✅ Check if any recipient is online
        const group = !chat
          ? await GroupModel.findById(messageData.chatId).populate('members', '_id isOnline')
          : null;

        const recipients = chat ? chat.participants : (group ? group.members : []);
        const recipientIds = recipients.filter(
          p => p._id.toString() !== messageData.senderId.toString()
        );
        const anyRecipientOnline = recipientIds.some(r => r.isOnline === true);

        // ✅ Broadcast to other users in room immediately
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

        // ✅ Persist to database asynchronously
        setImmediate(async () => {
          try {
            const message = new MessageModel({
              chatId: messageData.chatId,
              senderId: messageData.senderId,
              content: messageData.content,
              type: messageData.type,
              status: anyRecipientOnline ? 'delivered' : 'sent',
              deliveredAt: anyRecipientOnline ? new Date() : null
            });

            const savedMessage = await message.save();

            const roomSockets = await io.in(messageData.chatId).fetchSockets();
            const activeViewers = [];
            roomSockets.forEach(s => {
              if (s.data?.viewingChat === messageData.chatId && s.data?.userId) {
                activeViewers.push(s.data.userId);
              }
            });

            console.log(`📊 Active viewers in chat ${messageData.chatId}:`, activeViewers.length > 0 ? activeViewers : 'none');

            const chatUpdate = ChatModel.findByIdAndUpdate(
              messageData.chatId,
              {
                lastMessage: {
                  content: messageData.content,
                  senderId: messageData.senderId,
                  type: messageData.type,
                  createdAt: savedMessage.createdAt
                },
                $inc: { 'unreadCount.$[elem].count': 1 }
              },
              {
                arrayFilters: [{
                  'elem.userId': {
                    $ne: messageData.senderId,
                    $nin: activeViewers
                  }
                }],
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
                $inc: { 'unreadCount.$[elem].count': 1 }
              },
              {
                arrayFilters: [{
                  'elem.userId': {
                    $ne: messageData.senderId,
                    $nin: activeViewers
                  }
                }],
                new: true
              }
            ).lean();

            await Promise.all([chatUpdate, groupUpdate]);

            const populatedMessage = await MessageModel.findById(savedMessage._id)
              .populate('senderId', 'name email profilePicture')
              .lean();

            io.to(messageData.chatId).emit('message-confirmed', {
              tempId,
              message: populatedMessage
            });

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
          return acknowledge({ status: 'error', error: 'Message not found' });
        }

        socket.to(messageData.chatId).emit('message-received', message);

        setImmediate(async () => {
          try {
            const roomSockets = await io.in(messageData.chatId).fetchSockets();
            const activeViewers = [];
            roomSockets.forEach(s => {
              if (s.data?.viewingChat === messageData.chatId && s.data?.userId) {
                activeViewers.push(s.data.userId);
              }
            });

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

        if (acknowledge) acknowledge({ status: 'success' });
      } catch (error) {
        console.error('❌ Error with audio message:', error);
        if (acknowledge) acknowledge({ status: 'error', error: error.message });
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
            chatId,
            senderId: { $ne: userId },
            status: { $in: ['sent', 'delivered'] }
          },
          {
            $set: { status: 'read' },
            $addToSet: { readBy: { userId, readAt: new Date() } }
          }
        );

        if (result.modifiedCount > 0) {
          io.to(chatId).emit('messages-read', {
            chatId,
            readerUserId: userId,
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
          { isOnline: false, lastSeen: new Date(), socketId: null },
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
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};

module.exports = { initializeSocket, getIo };