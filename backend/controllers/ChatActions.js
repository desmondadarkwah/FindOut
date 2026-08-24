const UserModel = require('../models/UserModel');
const { MessageModel } = require('../models/MessageModel');
const { getIo } = require('../socket/socket');

// ═══════════════════════════════════════════════
// BLOCK USER
// ═══════════════════════════════════════════════
const BlockUser = async (req, res) => {
  try {
    const { userIdToBlock } = req.body;
    const userId = req.authenticatedUser.id;

    if (userIdToBlock === userId) {
      return res.status(400).json({ success: false, message: "You can't block yourself" });
    }

    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { blockedUsers: userIdToBlock }
    });

    try {
      const io = getIo();
      io.to(userIdToBlock).emit('user-blocked', { blockedBy: userId });
    } catch (e) { console.warn('Socket skip:', e.message); }

    res.json({ success: true, message: 'User blocked successfully' });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ success: false, message: 'Failed to block user' });
  }
};

// ═══════════════════════════════════════════════
// UNBLOCK USER ✅ NEW
// ═══════════════════════════════════════════════
const UnblockUser = async (req, res) => {
  try {
    const { userIdToUnblock } = req.body;
    const userId = req.authenticatedUser.id;

    await UserModel.findByIdAndUpdate(userId, {
      $pull: { blockedUsers: userIdToUnblock }
    });

    try {
      const io = getIo();
      io.to(userIdToUnblock).emit('user-unblocked', { unblockedBy: userId });
    } catch (e) { console.warn('Socket skip:', e.message); }

    res.json({ success: true, message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ success: false, message: 'Failed to unblock user' });
  }
};

// ═══════════════════════════════════════════════
// DELETE CHAT
// ═══════════════════════════════════════════════
const DeleteChat = async (req, res) => {
  try {
    const { chatId } = req.body;
    const userId = req.authenticatedUser.id;

    await MessageModel.updateMany(
      { chatId },
      { $addToSet: { deletedFor: userId } }
    );

    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete chat' });
  }
};

// ═══════════════════════════════════════════════
// REPORT USER
// ═══════════════════════════════════════════════
const ReportUser = async (req, res) => {
  try {
    const { reportedUserId, reason, chatId } = req.body;
    const userId = req.authenticatedUser.id;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Please provide a reason' });
    }

    await UserModel.findByIdAndUpdate(reportedUserId, {
      $push: {
        reports: {
          reportedBy: userId,
          reason,
          chatId,
          reportedAt: new Date()
        }
      }
    });

    res.json({ success: true, message: 'User reported successfully' });
  } catch (error) {
    console.error('Report user error:', error);
    res.status(500).json({ success: false, message: 'Failed to report user' });
  }
};

module.exports = { BlockUser, UnblockUser, DeleteChat, ReportUser };