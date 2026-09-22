const NotificationModel = require('../models/NotificationModel');

// ── Get all notifications for current user
const GetNotifications = async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;

    const notifications = await NotificationModel.find({ recipient: userId })
      .populate('sender', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await NotificationModel.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

// ── Mark one as read
const MarkAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.authenticatedUser.id;

    await NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
};

// ── Mark all as read
const MarkAllAsRead = async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;

    await NotificationModel.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
};

// ── Delete a notification
const DeleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.authenticatedUser.id;

    await NotificationModel.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
};

module.exports = { GetNotifications, MarkAsRead, MarkAllAsRead, DeleteNotification };