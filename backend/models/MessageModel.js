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
    type: { type: String, default: 'text' }, // 'text', 'audio', 'image', etc.
    createdAt: { type: Date, default: null }
  },
  unreadCount: {
    type: Number,
    default: 0
  }
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
  }
}, { timestamps: true });

const MessageModel = mongoose.model('Message', messageSchema);

// Export both models
module.exports = {
  ChatModel,
  MessageModel,
};