const GroupModel = require('../models/GroupModel');
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
    const group = await GroupModel.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is admin
    if (group.groupAdmin.toString() !== adminId) {
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
    if (!group.members.includes(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this group'
      });
    }

    // Remove member
    group.members = group.members.filter(
      id => id.toString() !== memberId
    );

    // Remove member's unread count
    group.unreadCount = group.unreadCount.filter(
      u => u.userId.toString() !== memberId
    );

    // ✅ FIXED: Use updateOne instead of save to avoid validation
    await GroupModel.updateOne(
      { _id: groupId },
      {
        $set: {
          members: group.members,
          unreadCount: group.unreadCount
        }
      }
    );

    // Populate the group data
    const populatedGroup = await GroupModel.findById(groupId)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture')
      .populate('lastMessage.senderId', 'name profilePicture');

    // Notify via socket
    try {
      const io = getIo();

      // Notify the group
      io.to(groupId).emit('member-removed', {
        groupId: group._id,
        removedMemberId: memberId,
        group: populatedGroup
      });

      // Notify the removed member
      io.to(memberId).emit('removed-from-group', {
        groupId: group._id,
        groupName: group.groupName
      });

      console.log(`✅ Removed member ${memberId} from group ${group.groupName}`);
    } catch (socketError) {
      console.log('⚠️ Socket notification skipped:', socketError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      group: populatedGroup
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