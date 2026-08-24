const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String
  },
  subjects: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ["Ready To Teach", "Ready To Learn", "Later"],
    default: "Later",
  },
  freetime: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedSubjects: [{
    subject: {
      type: String,
      required: true
    },
    verifiedAt: {
      type: Date,
      required: true
    }
  }],
  reputation: {
    type: Number,
    default: 0
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  socketId: {
    type: String,
    default: null
  },
blockedUsers: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  default: []
}],
reports: [{
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String },
  chatId: { type: mongoose.Schema.Types.ObjectId },
  reportedAt: { type: Date, default: Date.now }
}],
mutedChats: [{
  type: mongoose.Schema.Types.ObjectId,
  default: []
}],
}, {
  timestamps: true
});

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;