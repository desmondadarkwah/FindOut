const GroupModel = require('../models/GroupModel');
const { MessageModel } = require('../models/MessageModel');
const { getIo } = require('../socket/socket');

const RemoveGroupMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.body;
    const adminId = req.authenticatedUser.id;

    // Validate input
    if (!groupId || !memberId) {
      return res.status(400).json({
        success: false,
        message: 'Group ID and member ID are required'
      });
    }

    // Find the group
    const group = await GroupModel.findById(groupId)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is admin
    if (group.groupAdmin._id.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can remove members'
      });
    }

    // Can't remove admin
    if (memberId === adminId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the group admin'
      });
    }

    // Check if member exists in group
    const memberExists = group.members.some(m => m._id.toString() === memberId);
    if (!memberExists) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this group'
      });
    }

    // Remove member
    group.members = group.members.filter(m => m._id.toString() !== memberId);

    // Remove member's unread count
    group.unreadCount = group.unreadCount?.filter(
      u => u.userId.toString() !== memberId
    ) || [];

    await group.save();

    // Re-populate after save
    const updatedGroup = await GroupModel.findById(groupId)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture')
      .populate('lastMessage.senderId', 'name profilePicture');

    // ✅ Create system message: "User was removed by admin"
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
        
        // Notify all group members
        io.to(groupId).emit('member-removed', {
          groupId: group._id,
          removedMemberId: memberId,
          group: updatedGroup
        });

        // Send system message to group
        io.to(groupId).emit('system-message', {
          message: populatedMessage
        });

        // Notify the removed member
        io.to(memberId).emit('removed-from-group', {
          groupId: group._id,
          groupName: group.groupName
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