const GroupModel = require('../models/GroupModel');
const { MessageModel } = require('../models/MessageModel');
const { getIo } = require('../socket/socket');

const JoinGroupViaInvite = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const userId = req.authenticatedUser.id;

    // Find group by invite code
    const group = await GroupModel.findOne({ inviteCode })
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture')
      .populate('pendingRequests.userId', 'name profilePicture');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite link'
      });
    }

    // ✅ Check if user is already a member
    const isAlreadyMember = group.members.some(m => m._id.toString() === userId);
    
    if (isAlreadyMember) {
      return res.status(200).json({
        success: true,
        message: 'Opening group',
        group: group,
        alreadyMember: true
      });
    }

    // ✅ Check if user already has a pending request
    const hasPendingRequest = group.pendingRequests?.some(
      req => req.userId._id.toString() === userId
    );

    if (hasPendingRequest) {
      return res.status(200).json({
        success: false,
        message: 'Your join request is pending approval',
        isPending: true
      });
    }

    // ✅ PRIVACY CHECK: If private, create join request
    if (group.isPrivate) {
      group.pendingRequests.push({
        userId: userId,
        requestedAt: new Date()
      });
      await group.save();

      // Re-populate after save
      const updatedGroup = await GroupModel.findById(group._id)
        .populate('members', 'name profilePicture')
        .populate('groupAdmin', 'name profilePicture')
        .populate('pendingRequests.userId', 'name profilePicture');

      // ✅ Notify admin via socket
      try {
        const io = getIo();
        io.to(group.groupAdmin._id.toString()).emit('new-join-request', {
          groupId: group._id,
          groupName: group.groupName,
          userId: userId,
          group: updatedGroup
        });
      } catch (socketError) {
        console.warn('⚠️ Socket notification skipped:', socketError.message);
      }

      console.log(`📝 Join request created for private group: ${group.groupName}`);

      return res.status(200).json({
        success: true,
        message: 'Join request sent to group admin',
        isPending: true,
        group: updatedGroup
      });
    }

    // ✅ PUBLIC GROUP: Add user immediately
    group.members.push(userId);
    if (!group.unreadCount) group.unreadCount = [];
    group.unreadCount.push({ userId, count: 0 });
    await group.save();

    // Populate the group
    const populatedGroup = await GroupModel.findById(group._id)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture')
      .populate('lastMessage.senderId', 'name profilePicture');

    // ✅ Create system message: "User A joined using invite link"
    try {
      const systemMessage = new MessageModel({
        chatId: group._id,
        senderId: userId,
        content: 'joined using invite link',
        type: 'system',
        createdAt: new Date()
      });
      await systemMessage.save();

      const populatedMessage = await MessageModel.findById(systemMessage._id)
        .populate('senderId', 'name profilePicture');

      // Notify via socket
      try {
        const io = getIo();
        
        // Notify all group members
        io.to(group._id.toString()).emit('member-joined', {
          groupId: group._id,
          newMember: userId,
          group: populatedGroup
        });

        // Send system message to group
        io.to(group._id.toString()).emit('system-message', {
          message: populatedMessage
        });

        console.log(`✅ User ${userId} joined group ${group.groupName} via invite link`);
      } catch (socketError) {
        console.log('⚠️ Socket notification skipped:', socketError.message);
      }
    } catch (msgError) {
      console.log('⚠️ System message skipped:', msgError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Joined group successfully',
      group: populatedGroup,
      alreadyMember: false
    });

  } catch (error) {
    console.error('❌ Error joining via invite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join group',
      error: error.message
    });
  }
};

module.exports = JoinGroupViaInvite;