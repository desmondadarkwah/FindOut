const GroupModel = require('../models/GroupModel');
const { MessageModel } = require('../models/MessageModel');
const { createNotification } = require('../services/notificationService');

const JoinGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.authenticatedUser.id;

    const group = await GroupModel.findById(groupId)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture')
      .populate('pendingRequests.userId', 'name profilePicture');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // ✅ SECRET GROUP: Cannot be joined directly
    if (group.privacy === 'secret') {
      return res.status(403).json({
        success: false,
        message: 'This group is secret. You can only join via an invite link.',
        isSecret: true
      });
    }

    // Check if already a member
    const isAlreadyMember = group.members.some(m =>
      (m._id || m).toString() === userId.toString()
    );

    if (isAlreadyMember) {
      return res.status(200).json({
        success: true,
        message: 'Already a member',
        group,
        alreadyMember: true
      });
    }

    // Check if already has pending request
    const hasPendingRequest = group.pendingRequests?.some(
      req => (req.userId._id || req.userId).toString() === userId.toString()
    );

    if (hasPendingRequest) {
      return res.status(200).json({
        success: false,
        message: 'Your join request is already pending',
        isPending: true
      });
    }

    // ✅ Get socket safely
    let io = null;
    try {
      const { getIo } = require('../socket/socket');
      io = getIo();
    } catch (e) {
      console.warn('⚠️ Socket not available:', e.message);
    }

    // ✅ PRIVATE GROUP: Create join request
    if (group.privacy === 'private') {
      group.pendingRequests.push({
        userId,
        requestedAt: new Date()
      });
      await group.save();

      const updatedGroup = await GroupModel.findById(groupId)
        .populate('members', 'name profilePicture')
        .populate('groupAdmin', 'name profilePicture')
        .populate('pendingRequests.userId', 'name profilePicture');

      // ✅ Notify admin
      await createNotification({
        recipient: group.groupAdmin._id,
        sender: userId,
        type: 'join_request',
        title: '📝 New Join Request',
        message: `Someone requested to join "${group.groupName}"`,
        link: '/inbox',
        groupId: group._id,
        io,
      });

      if (io) {
        io.to(group.groupAdmin._id.toString()).emit('new-join-request', {
          groupId: group._id,
          groupName: group.groupName,
          userId,
          group: updatedGroup
        });

        io.to(group.groupAdmin._id.toString()).emit('pending-requests-updated', {
          groupId: group._id,
          pendingRequests: updatedGroup.pendingRequests
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Join request sent to group admin',
        isPending: true,
        group: updatedGroup
      });
    }

    // ✅ PUBLIC GROUP: Add immediately
    group.members.push(userId);
    if (!group.unreadCount) group.unreadCount = [];
    group.unreadCount.push({ userId, count: 0 });
    await group.save();

    const populatedGroup = await GroupModel.findById(groupId)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture')
      .populate('lastMessage.senderId', 'name profilePicture');

    // System message
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

      if (io) {
        io.to(groupId).emit('member-joined', {
          groupId: group._id,
          newMember: userId,
          group: populatedGroup
        });

        io.to(groupId).emit('system-message', {
          message: populatedMessage
        });
      }

    } catch (socketError) {
      console.log('⚠️ Socket skipped:', socketError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Successfully joined the group',
      group: populatedGroup,
      isPending: false
    });

  } catch (error) {
    console.error('❌ Error joining group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join group',
      error: error.message
    });
  }
};

module.exports = JoinGroup;