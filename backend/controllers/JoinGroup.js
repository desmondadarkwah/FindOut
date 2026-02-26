const GroupModel = require('../models/GroupModel');
const MessageModel = require('../models/MessageModel');
const { getIo } = require('../socket/socket');

const JoinGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.authenticatedUser.id;

    const group = await GroupModel.findById(groupId);

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    // Already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already a member of this group' 
      });
    }

    // Is the admin
    if (group.groupAdmin.toString() === userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are the admin of this group' 
      });
    }

    // ✅ PRIVATE GROUP: Send join request
    if (group.isPrivate) {
      const alreadyRequested = group.pendingRequests.some(
        r => r.userId.toString() === userId
      );

      if (alreadyRequested) {
        return res.status(400).json({ 
          success: false, 
          message: 'Join request already sent',
          isPending: true
        });
      }

      group.pendingRequests.push({ userId });
      await group.save();

      // Notify admin via socket
      try {
        const io = getIo();
        io.to(group.groupAdmin.toString()).emit('join-request', {
          groupId: group._id,
          groupName: group.groupName,
          userId: userId
        });
      } catch (socketError) {
        console.log('⚠️ Socket skipped:', socketError.message);
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Join request sent to group admin',
        isPending: true
      });
    }

    // ✅ PUBLIC GROUP: Add member directly
    group.members.push(userId);
    group.unreadCount.push({ userId, count: 0 });
    await group.save();

    const populatedGroup = await GroupModel.findById(groupId)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture')
      .populate('lastMessage.senderId', 'name profilePicture');

    // ✅ Create system message
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

      const io = getIo();

      io.to(groupId).emit('member-joined', {
        groupId: group._id,
        newMember: userId,
        group: populatedGroup
      });

      io.to(groupId).emit('system-message', {
        message: populatedMessage
      });

    } catch (socketError) {
      console.log('⚠️ Socket skipped:', socketError.message);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Successfully joined the group',
      group: populatedGroup
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