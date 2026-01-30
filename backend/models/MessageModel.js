const mongoose = require('mongoose');

// Define Chat Schema
const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    default: null
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  lastMessage: {
    content: { type: String, default: null },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, default: 'text' },
    createdAt: { type: Date, default: null }
  },
  unreadCount: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    count: {
      type: Number,
      default: 0
    }
  }]
}, { timestamps: true });

const ChatModel = mongoose.model('Chat', chatSchema);

// Define Message Schema
const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Chat',
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  // ✅ ADDED: Message status tracking
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read'],
    default: 'sent'
  },
  // ✅ ADDED: Track who has read the message (for group chats)
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  // ✅ ADDED: Track when message was delivered
  deliveredAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const MessageModel = mongoose.model('Message', messageSchema);

// Export both models
module.exports = {
  ChatModel,
  MessageModel,
};