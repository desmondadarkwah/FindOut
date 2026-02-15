const GroupModel = require('../models/GroupModel');
const { getIo } = require('../socket/socket');

const AddGroupMembers = async (req, res) => {
  try {
    // Support both 'members' and 'memberIds' for backwards compatibility
    const { groupId, members, memberIds } = req.body;
    const membersToAdd = memberIds || members; // Use memberIds if provided, else use members
    const adminId = req.authenticatedUser.id;

    // Validate input
    if (!groupId || !membersToAdd || !Array.isArray(membersToAdd) || membersToAdd.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Group ID and members array are required' 
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

    console.log('Group Admin:', group.groupAdmin.toString());
    console.log('Authenticated User ID:', adminId);

    // Ensure the authenticated user is the group admin
    if (group.groupAdmin.toString() !== adminId) {
      return res.status(403).json({ 
        success: false,
        message: 'Only the group admin can add members' 
      });
    }

    // Get current members as strings for comparison
    const currentMembers = group.members.map(m => m.toString());

    // Filter out users who are already members or the admin
    const newMembers = membersToAdd.filter(
      memberId => !currentMembers.includes(memberId) && memberId !== adminId
    );

    if (newMembers.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'All selected users are already members' 
      });
    }

    // Add new members (ensure no duplicates)
    group.members = [...new Set([...group.members, ...newMembers])];

    // Initialize unread count for new members
    newMembers.forEach(memberId => {
      // Check if unread count already exists
      const existingUnread = group.unreadCount.find(
        u => u.userId.toString() === memberId
      );
      if (!existingUnread) {
        group.unreadCount.push({ userId: memberId, count: 0 });
      }
    });

    await group.save();

    // Populate the group data
    const populatedGroup = await GroupModel.findById(groupId)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture')
      .populate('lastMessage.senderId', 'name profilePicture');

    // Notify all members via socket (if socket is available)
    try {
      const io = getIo();
      
      // Notify the group room
      io.to(groupId).emit('members-added', {
        groupId: group._id,
        newMembers: newMembers,
        group: populatedGroup
      });

      // Notify new members individually
      newMembers.forEach(memberId => {
        io.to(memberId).emit('added-to-group', {
          groupId: group._id,
          groupName: group.groupName,
          addedBy: adminId
        });
      });

      console.log(`✅ ${newMembers.length} member(s) added to group ${group.groupName}`);
    } catch (socketError) {
      // Socket might not be initialized, that's okay
      console.log('⚠️ Socket notification skipped:', socketError.message);
    }

    res.status(200).json({ 
      success: true,
      message: `Successfully added ${newMembers.length} member(s)`,
      group: populatedGroup 
    });

  } catch (error) {
    console.error('❌ Error adding members:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding members to group',
      error: error.message 
    });
  }
};

module.exports = AddGroupMembers;