const GroupModel = require('../models/GroupModel');
const { MessageModel, ChatModel } = require('../models/MessageModel');
const { createNotification } = require('../services/notificationService');
const { sendJoinRequestApprovedEmail } = require('../services/emailService');

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

    const group = await GroupModel.findById(groupId)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture')
      .populate('pendingRequests.userId', 'name profilePicture');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // ✅ FIX: Check groupAdmin exists before accessing _id
    const groupAdminId = group.groupAdmin?._id?.toString() || group.groupAdmin?.toString();
    if (!groupAdminId || groupAdminId !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can handle join requests'
      });
    }

    // ✅ FIX: Handle both populated and unpopulated pendingRequests
    const requestExists = group.pendingRequests.some(r => {
      const reqUserId = r.userId?._id?.toString() || r.userId?.toString();
      return reqUserId === userId;
    });

    if (!requestExists) {
      return res.status(404).json({
        success: false,
        message: 'No pending request found for this user'
      });
    }

    // Remove from pending requests
    group.pendingRequests = group.pendingRequests.filter(r => {
      const reqUserId = r.userId?._id?.toString() || r.userId?.toString();
      return reqUserId !== userId;
    });

    // ✅ Use global.socketIo instead of getIo()
    const io = global.socketIo || null;

    if (action === 'approve') {
      group.members.push(userId);
      if (!group.unreadCount) group.unreadCount = [];
      group.unreadCount.push({ userId, count: 0 });
      await group.save();

      await ChatModel.findByIdAndUpdate(groupId, {
        participants: group.members,
        $push: { unreadCount: { userId, count: 0 } }
      });

      const populatedGroup = await GroupModel.findById(groupId)
        .populate('members', 'name profilePicture')
        .populate('groupAdmin', 'name profilePicture')
        .populate('lastMessage.senderId', 'name profilePicture')
        .populate('pendingRequests.userId', 'name profilePicture');

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
          io.to(groupId).emit('system-message', { message: populatedMessage });
        }
      } catch (msgError) {
        console.log('⚠️ System message skipped:', msgError.message);
      }

      // ✅ Notify approved user
      try {
        await createNotification({
          recipient: userId,
          sender: adminId,
          type: 'request_approved',
          title: '✅ Join Request Approved!',
          message: `Your request to join "${group.groupName}" was approved. Welcome!`,
          link: '/inbox',
          groupId: group._id,
          io,
        });
      } catch (notifError) {
        console.warn('⚠️ Notification skipped:', notifError.message);
      }
      // ✅ Send email notification
      const approvedUser = await require('../models/UserModel').findById(userId).select('name email isOnline');
      if (approvedUser && !approvedUser.isOnline) {
        await sendJoinRequestApprovedEmail({
          recipientEmail: approvedUser.email,
          recipientName: approvedUser.name,
          groupName: group.groupName,
        });
      }
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
        io.to(adminId).emit('pending-requests-updated', {
          groupId: group._id,
          pendingRequests: populatedGroup.pendingRequests
        });
      }

      console.log(`✅ Approved user ${userId} to join group ${group.groupName}`);

      return res.status(200).json({
        success: true,
        message: 'User approved and added to group',
        group: populatedGroup
      });

    } else {
      // Deny
      await group.save();

      const populatedGroup = await GroupModel.findById(groupId)
        .populate('members', 'name profilePicture')
        .populate('groupAdmin', 'name profilePicture')
        .populate('pendingRequests.userId', 'name profilePicture');

      // ✅ Notify denied user
      try {
        await createNotification({
          recipient: userId,
          sender: adminId,
          type: 'request_rejected',
          title: 'Join Request Not Approved',
          message: `Your request to join "${group.groupName}" was not approved.`,
          link: '/explore-groups',
          groupId: group._id,
          io,
        });
      } catch (notifError) {
        console.warn('⚠️ Notification skipped:', notifError.message);
      }

      if (io) {
        io.to(userId).emit('join-request-denied', {
          groupId: group._id,
          groupName: group.groupName
        });
        io.to(adminId).emit('pending-requests-updated', {
          groupId: group._id,
          pendingRequests: populatedGroup.pendingRequests
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