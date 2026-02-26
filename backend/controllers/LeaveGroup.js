const GroupModel = require('../models/GroupModel');
const { MessageModel } = require('../models/MessageModel');
const { getIo } = require('../socket/socket');

const LeaveGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.authenticatedUser.id;

    const group = await GroupModel.findById(groupId)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Cannot leave if you're the admin
    if (group.groupAdmin._id.toString() === userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Group admin cannot leave. Transfer admin rights or delete the group.' 
      });
    }

    // Remove user from members
    group.members = group.members.filter(m => m._id.toString() !== userId);
    group.unreadCount = group.unreadCount?.filter(u => u.userId.toString() !== userId) || [];
    await group.save();

    // Re-populate
    const updatedGroup = await GroupModel.findById(groupId)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture')
      .populate('lastMessage.senderId', 'name profilePicture');

    // ✅ Create system message: "User left the group"
    try {
      const systemMessage = new MessageModel({
        chatId: group._id,
        senderId: userId,
        content: 'left the group',
        type: 'system',
        createdAt: new Date()
      });
      await systemMessage.save();

      const populatedMessage = await MessageModel.findById(systemMessage._id)
        .populate('senderId', 'name profilePicture');

      // Notify via socket
      try {
        const io = getIo();
        
        // Notify remaining group members
        io.to(groupId).emit('member-left', {
          groupId: group._id,
          leftMemberId: userId,
          group: updatedGroup
        });

        // Send system message
        io.to(groupId).emit('system-message', {
          message: populatedMessage
        });

        console.log(`✅ User ${userId} left group ${group.groupName}`);
      } catch (socketError) {
        console.warn('⚠️ Socket notification skipped:', socketError.message);
      }
    } catch (msgError) {
      console.log('⚠️ System message skipped:', msgError.message);
    }

    res.status(200).json({
      success: true,
      message: 'You have left the group'
    });

  } catch (error) {
    console.error('❌ Error leaving group:', error);
    res.status(500).json({ success: false, message: 'Failed to leave group' });
  }
};

module.exports = LeaveGroup;