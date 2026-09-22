const NotificationModel = require('../models/NotificationModel');

const createNotification = async ({ recipient, sender, type, title, message, link, groupId, io }) => {
  try {
    // Don't notify yourself
    if (recipient.toString() === sender?.toString()) return;

    const notification = await NotificationModel.create({
      recipient,
      sender,
      type,
      title,
      message,
      link: link || '/dashboard',
      groupId: groupId || null,
      isRead: false,
    });

    const populated = await NotificationModel.findById(notification._id)
      .populate('sender', 'name profilePicture')
      .lean();

    // ✅ Send real-time via socket
    if (io) {
      io.to(recipient.toString()).emit('new-notification', populated);
    }

    return populated;
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

module.exports = { createNotification };