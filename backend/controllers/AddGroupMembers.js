const GroupModel = require('../models/GroupModel');
const { MessageModel } = require('../models/MessageModel');
const UserModel = require('../models/UserModel');

// ✅ Safe import: if the path/function is wrong, the controller still works (emails are just skipped)
let sendAddedToGroupEmail = null;
try {
  // 👇 CHANGE this path to wherever your email function lives
  ({ sendAddedToGroupEmail } = require('../services/emailService'));
} catch (err) {
  console.log('⚠️ sendAddedToGroupEmail not loaded, emails disabled:', err.message);
}

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
    if (!Array.isArray(group.unreadCount)) {
      group.unreadCount = [];
    }
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

    // ✅ Look up the admin once (used for emails)
    let adminName = 'Admin';
    try {
      const admin = await UserModel.findById(adminId).select('name');
      if (admin?.name) adminName = admin.name;
    } catch (adminError) {
      console.log('⚠️ Admin lookup skipped:', adminError.message);
    }

    // ✅ Handle EACH new member (system message + email)
    for (const memberId of newMembers) {
      // --- System message ---
      try {
        const systemMessage = new MessageModel({
          chatId: group._id,
          senderId: memberId,
          content: 'was added to the group',
          type: 'system',
          createdAt: new Date()
        });
        await systemMessage.save();

        const populatedMessage = await MessageModel.findById(systemMessage._id)
          .populate('senderId', 'name profilePicture');

        if (io) {
          io.to(groupId).emit('system-message', {
            message: populatedMessage
          });
        }
      } catch (msgError) {
        console.log('⚠️ System message skipped:', msgError.message);
      }

      // --- Email notification (only if user is offline) ---
      try {
        if (typeof sendAddedToGroupEmail === 'function') {
          const addedUser = await UserModel.findById(memberId).select('name email isOnline');

          if (addedUser && addedUser.email && !addedUser.isOnline) {
            await sendAddedToGroupEmail({
              recipientEmail: addedUser.email,
              recipientName: addedUser.name,
              groupName: group.groupName,
              addedByName: adminName,
            });
          }
        }
      } catch (emailError) {
        console.log('⚠️ Email skipped:', emailError.message);
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
