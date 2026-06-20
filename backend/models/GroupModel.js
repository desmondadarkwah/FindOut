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
    type: String,
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true,
    default: function () {
      return require('crypto').randomBytes(8).toString('hex');
    }
  },

  // ✅ UPDATED: Replaced isPrivate (Boolean) with privacy (String - 3 levels)
  privacy: {
    type: String,
    enum: ['public', 'private', 'secret'],
    default: 'public'
  },

  // ✅ KEPT: Pending join requests (for private groups)
  pendingRequests: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
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

const GroupModel = mongoose.model('Group', groupSchema);

module.exports = GroupModel;