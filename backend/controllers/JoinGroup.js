const GroupModel = require('../models/GroupModel');
const { getIo } = require('../socket/socket');

const JoinGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.authenticatedUser.id;

    // Find the group
    const group = await GroupModel.findById(groupId);

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    // Check if user is already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already a member of this group' 
      });
    }

    // Check if user is the admin
    if (group.groupAdmin.toString() === userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are the admin of this group' 
      });
    }

    // If group is private, add to pending requests
    if (group.isPrivate) {
      // Check if already requested
      const alreadyRequested = group.pendingRequests.some(
        req => req.userId.toString() === userId
      );

      if (alreadyRequested) {
        return res.status(400).json({ 
          success: false, 
          message: 'Join request already sent' 
        });
      }

      // Add to pending requests
      group.pendingRequests.push({ userId });
      await group.save();

      // Notify admin via socket
      const io = getIo();
      io.to(group.groupAdmin.toString()).emit('join-request', {
        groupId: group._id,
        groupName: group.groupName,
        userId: userId
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Join request sent to group admin',
        isPending: true
      });
    }

    // If group is public, add member directly
    group.members.push(userId);
    
    // Initialize unread count for new member
    group.unreadCount.push({ userId, count: 0 });
    
    await group.save();

    // Populate the group data
    const populatedGroup = await GroupModel.findById(groupId)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture')
      .populate('lastMessage.senderId', 'name profilePicture');

    // Notify all members via socket
    const io = getIo();
    io.to(groupId).emit('member-joined', {
      groupId: group._id,
      newMember: userId,
      group: populatedGroup
    });

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