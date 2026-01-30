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
    default: false,
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
  }
}, {
  timestamps: true
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
