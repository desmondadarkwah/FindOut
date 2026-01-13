const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
    trim: true
  },
  isGroup: {
    type: Boolean,
    default: true,
  },
  subjects: {
    type: [String],
    required: true,
  },
  groupProfile: {
    type: String
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  description: {
    type: String,
    trim: true,
    maxLength: 500
  },
  meetingTime: {
    type: String, // Example: "Monday at 3 PM"
    // required: true
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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

const GroupModel = mongoose.model('Group', groupSchema);

module.exports = GroupModel;
