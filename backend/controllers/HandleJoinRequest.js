const GroupModel = require('../models/GroupModel');
const { MessageModel } = require('../models/MessageModel');
const { getIo } = require('../socket/socket');

const HandleJoinRequest = async (req, res) => {
  try {
    const { groupId, userId, action } = req.body;
    const adminId = req.authenticatedUser.id;

    if (!groupId || !userId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Group ID, user ID, and action are required'
      });
    }

    if (!['approve', 'deny'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be approve or deny'
      });
    }

    // ✅ Find and populate group
    const group = await GroupModel.findById(groupId)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture')
      .populate('pendingRequests.userId', 'name profilePicture');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Only admin can approve/deny
    if (group.groupAdmin._id.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can handle join requests'
      });
    }

    // Check if user has a pending request
    const requestExists = group.pendingRequests.some(
      r => (r.userId._id || r.userId).toString() === userId
    );

    if (!requestExists) {
      return res.status(404).json({
        success: false,
        message: 'No pending request found for this user'
      });
    }

    // Remove from pending requests
    group.pendingRequests = group.pendingRequests.filter(
      r => (r.userId._id || r.userId).toString() !== userId
    );

    // ✅ Initialize io variable OUTSIDE try block
    let io;
    try {
      io = getIo();
    } catch (socketError) {
      console.warn('⚠️ Socket.io not available:', socketError.message);
      io = null; // ✅ Set to null instead of crashing
    }

    if (action === 'approve') {
      // Add user to members
      group.members.push(userId);
      
      // Initialize unread count for new member
      if (!group.unreadCount) group.unreadCount = [];
      group.unreadCount.push({ userId, count: 0 });
      
      await group.save();

      // Re-populate after save
      const populatedGroup = await GroupModel.findById(groupId)
        .populate('members', 'name profilePicture')
        .populate('groupAdmin', 'name profilePicture')
        .populate('lastMessage.senderId', 'name profilePicture')
        .populate('pendingRequests.userId', 'name profilePicture');

      // ✅ Create system message (optional, won't crash if fails)
      try {
        const systemMessage = new MessageModel({
          chatId: group._id,
          senderId: userId,
          content: 'joined the group',
          type: 'system',
          createdAt: new Date()
        });
        await systemMessage.save();

        const populatedMessage = await MessageModel.findById(systemMessage._id)
          .populate('senderId', 'name profilePicture');

        // ✅ Only emit if socket available
        if (io) {
          io.to(groupId).emit('system-message', { message: populatedMessage });
        }
      } catch (msgError) {
        console.log('⚠️ System message skipped:', msgError.message);
      }

      // ✅ Emit events only if socket available
      if (io) {
        io.to(groupId).emit('member-joined', {
          groupId: group._id,
          newMember: userId,
          group: populatedGroup
        });

        io.to(userId).emit('join-request-approved', {
          groupId: group._id,
          groupName: group.groupName,
          group: populatedGroup
        });
      }

      console.log(`✅ Approved user ${userId} to join group ${group.groupName}`);

      return res.status(200).json({
        success: true,
        message: 'User approved and added to group',
        group: populatedGroup
      });

    } else {
      // Deny - just remove from pending
      await group.save();

      // Re-populate after save
      const populatedGroup = await GroupModel.findById(groupId)
        .populate('members', 'name profilePicture')
        .populate('groupAdmin', 'name profilePicture')
        .populate('pendingRequests.userId', 'name profilePicture');

      // ✅ Only emit if socket available
      if (io) {
        io.to(userId).emit('join-request-denied', {
          groupId: group._id,
          groupName: group.groupName
        });
      }

      console.log(`❌ Denied user ${userId} from group ${group.groupName}`);

      return res.status(200).json({
        success: true,
        message: 'Join request denied',
        group: populatedGroup
      });
    }

  } catch (error) {
    console.error('❌ Error handling join request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle join request',
      error: error.message
    });
  }
};

module.exports = HandleJoinRequest;