const GroupModel = require('../models/GroupModel');
const MessageModel = require('../models/MessageModel');
const { getIo } = require('../socket/socket');

const JoinGroupViaInvite = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const userId = req.authenticatedUser.id;

    // Find group by invite code
    const group = await GroupModel.findOne({ inviteCode });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite link'
      });
    }

    // ✅ Check if user is already a member
    const isAlreadyMember = group.members.includes(userId);
    
    if (isAlreadyMember) {
      // ✅ Just return the group data (no error)
      const populatedGroup = await GroupModel.findById(group._id)
        .populate('members', 'name profilePicture')
        .populate('groupAdmin', 'name profilePicture')
        .populate('lastMessage.senderId', 'name profilePicture');

      return res.status(200).json({
        success: true,
        message: 'Opening group',
        group: populatedGroup,
        alreadyMember: true // ✅ Flag to skip success screen
      });
    }

    // ✅ Add user to group
    group.members.push(userId);
    group.unreadCount.push({ userId, count: 0 });
    await group.save();

    // Populate the group
    const populatedGroup = await GroupModel.findById(group._id)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture')
      .populate('lastMessage.senderId', 'name profilePicture');

    // ✅ Create system message: "User A joined using invite link"
    const systemMessage = new MessageModel({
      chatId: group._id,
      senderId: userId,
      content: `joined using invite link`,
      type: 'system', // ✅ System message type
      createdAt: new Date()
    });
    await systemMessage.save();

    // Populate system message
    const populatedMessage = await MessageModel.findById(systemMessage._id)
      .populate('senderId', 'name profilePicture');

    // Notify via socket
    try {
      const io = getIo();
      
      // Notify all group members
      io.to(group._id.toString()).emit('member-joined', {
        groupId: group._id,
        newMember: userId,
        group: populatedGroup
      });

      // Send system message to group
      io.to(group._id.toString()).emit('system-message', {
        message: populatedMessage
      });

      console.log(`✅ User ${userId} joined group ${group.groupName} via invite link`);
    } catch (socketError) {
      console.log('⚠️ Socket notification skipped:', socketError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Joined group',
      group: populatedGroup,
      alreadyMember: false
    });

  } catch (error) {
    console.error('❌ Error joining via invite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join group',
      error: error.message
    });
  }
};

module.exports = JoinGroupViaInvite;