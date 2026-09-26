const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'new_message',
      'join_request',
      'request_approved',
      'request_rejected',
      'member_joined',
      'new_match',
      'quiz_verified',
      'post_helpful',  
      'post_comment',  
      'quiz_failed',   
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String }, // where to navigate on click
  isRead: { type: Boolean, default: false },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

const NotificationModel = mongoose.model('Notification', notificationSchema);
module.exports = NotificationModel;