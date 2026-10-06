const GroupModel = require('../models/GroupModel');
const { MessageModel, ChatModel } = require('../models/MessageModel');

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
      return res.status(404).json({ success: false, message: 'Group not found' });
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

    // ✅ Remove member
    group.members = group.members.filter(m => m._id.toString() !== memberId);
    group.unreadCount = group.unreadCount?.filter(
      u => u.userId.toString() !== memberId
    ) || [];
    await group.save();

    // ✅ Also remove from ChatModel
    await ChatModel.findByIdAndUpdate(groupId, {
      participants: group.members.map(m => m._id),
      $pull: { unreadCount: { userId: memberId } }
    });

    const updatedGroup = await GroupModel.findById(groupId)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture')
      .populate('lastMessage.senderId', 'name profilePicture');

    // ✅ Get io from global
    const io = global.socketIo || null;

    // ✅ System message
    try {
      const systemMessage = new MessageModel({
        chatId: group._id,
        senderId: memberId,
        content: 'was removed from the group',
        type: 'system',
        createdAt: new Date()
      });
      await systemMessage.save();

      const populatedMessage = await MessageModel.findById(systemMessage._id)
        .populate('senderId', 'name profilePicture');

      if (io) {
        // ✅ Emit to user's PERSONAL room - they are always in this room
        io.to(memberId.toString()).emit('force-remove-chat', {
          groupId: group._id,
          groupName: group.groupName,
          reason: 'removed'
        });

        // ✅ Update remaining members
        io.to(groupId.toString()).emit('member-removed', {
          groupId: group._id,
          removedMemberId: memberId,
          group: updatedGroup
        });

        // ✅ System message to group
        io.to(groupId.toString()).emit('system-message', {
          message: populatedMessage
        });

        console.log(`✅ User ${memberId} removed from group ${group.groupName}`);
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