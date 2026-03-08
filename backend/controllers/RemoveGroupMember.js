const GroupModel = require('../models/GroupModel');
const { MessageModel } = require('../models/MessageModel');
const { ChatModel } = require('../models/MessageModel');
const { getIo } = require('../socket/socket');

const RemoveGroupMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.body;
    const adminId = req.authenticatedUser.id;

    if (!groupId || !memberId) {
      return res.status(400).json({
        success: false,
        message: 'Group ID and member ID are required'
      });
    }

    const group = await GroupModel.findById(groupId)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.groupAdmin._id.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can remove members'
      });
    }

    if (memberId === adminId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the group admin'
      });
    }

    const memberExists = group.members.some(m => m._id.toString() === memberId);
    if (!memberExists) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this group'
      });
    }

    // Remove member
    group.members = group.members.filter(m => m._id.toString() !== memberId);
    group.unreadCount = group.unreadCount?.filter(
      u => u.userId.toString() !== memberId
    ) || [];

    await group.save();

    // ✅ ALSO remove from ChatModel participants
    await ChatModel.findByIdAndUpdate(groupId, {
      participants: group.members.map(m => m._id),
      $pull: { unreadCount: { userId: memberId } }
    });

    // Re-populate
    const updatedGroup = await GroupModel.findById(groupId)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture')
      .populate('lastMessage.senderId', 'name profilePicture');

    // Create system message
    try {
      const systemMessage = new MessageModel({
        chatId: group._id,
        senderId: memberId,
        content: 'was removed by admin',
        type: 'system',
        createdAt: new Date()
      });
      await systemMessage.save();

      const populatedMessage = await MessageModel.findById(systemMessage._id)
        .populate('senderId', 'name profilePicture');

      // Notify via socket
      try {
        const io = getIo();
        
        // ✅ FIRST: Tell removed user to delete the chat from their sidebar
        io.to(memberId).emit('force-remove-chat', {
          groupId: group._id,
          groupName: group.groupName,
          reason: 'removed'
        });

        // ✅ SECOND: Update remaining members
        io.to(groupId).emit('member-removed', {
          groupId: group._id,
          removedMemberId: memberId,
          group: updatedGroup
        });

        // ✅ THIRD: Send system message to group
        io.to(groupId).emit('system-message', {
          message: populatedMessage
        });

        console.log(`✅ User ${memberId} removed from group ${group.groupName}`);
      } catch (socketError) {
        console.warn('⚠️ Socket notification skipped:', socketError.message);
      }
    } catch (msgError) {
      console.log('⚠️ System message skipped:', msgError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      group: updatedGroup
    });

  } catch (error) {
    console.error('❌ Error removing member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member',
      error: error.message
    });
  }
};

module.exports = RemoveGroupMember;