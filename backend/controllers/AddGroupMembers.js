const GroupModel = require('../models/GroupModel');
const { MessageModel } = require('../models/MessageModel');
const UserModel = require('../models/UserModel');

const AddGroupMembers = async (req, res) => {
  try {
    const { groupId, members, memberIds } = req.body;
    const membersToAdd = memberIds || members;
    const adminId = req.authenticatedUser.id;

    if (!groupId || !membersToAdd || !Array.isArray(membersToAdd) || membersToAdd.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Group ID and members array are required'
      });
    }

    const group = await GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.groupAdmin.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'Only the group admin can add members'
      });
    }

    const currentMembers = group.members.map(m => m.toString());
    const newMembers = membersToAdd.filter(
      memberId => !currentMembers.includes(memberId) && memberId !== adminId
    );

    if (newMembers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All selected users are already members'
      });
    }

    // ✅ Add new members
    group.members = [...new Set([...group.members, ...newMembers])];

    // ✅ Initialize unread count for new members
    newMembers.forEach(memberId => {
      const existingUnread = group.unreadCount.find(
        u => u.userId.toString() === memberId
      );
      if (!existingUnread) {
        group.unreadCount.push({ userId: memberId, count: 0 });
      }
    });

    await group.save();

    const populatedGroup = await GroupModel.findById(groupId)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture')
      .populate('lastMessage.senderId', 'name profilePicture');

    // ✅ Get socket safely
    const io = global.socketIo || null;

    // ✅ Create system message for EACH new member added
    for (const memberId of newMembers) {
      try {
        const addedUser = await UserModel.findById(memberId).select('name');

        const systemMessage = new MessageModel({
          chatId: group._id,
          senderId: memberId, // ✅ Use added member's ID not admin's
          content: 'was added to the group',
          type: 'system',
          createdAt: new Date()
        });
        await systemMessage.save();

        const populatedMessage = await MessageModel.findById(systemMessage._id)
          .populate('senderId', 'name profilePicture');

        if (io) {
          // ✅ Send system message to group room
          io.to(groupId).emit('system-message', {
            message: populatedMessage
          });
        }
      } catch (msgError) {
        console.log('⚠️ System message skipped:', msgError.message);
      }
    }

    if (io) {
      // ✅ Notify the group room about new members
      io.to(groupId).emit('members-added', {
        groupId: group._id,
        newMembers: newMembers,
        group: populatedGroup
      });

      // ✅ Notify each new member personally - add group to their sidebar
      newMembers.forEach(memberId => {
        io.to(memberId.toString()).emit('added-to-group', {
          groupId: group._id,
          groupName: group.groupName,
          group: populatedGroup,
          addedBy: adminId
        });
      });

      console.log(`✅ ${newMembers.length} member(s) added to group ${group.groupName}`);
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
      message: 'Failed to add members',
      error: error.message
    });
  }
};

module.exports = AddGroupMembers;