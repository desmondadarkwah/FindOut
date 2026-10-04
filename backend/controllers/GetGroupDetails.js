const GroupModel = require('../models/GroupModel');

const GetGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await GroupModel.findById(groupId)
      .populate('members', 'name profilePicture email')
      .populate('groupAdmin', 'name profilePicture')
      .populate('pendingRequests.userId', 'name profilePicture email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // ✅ Return ALL fields including privacy and pendingRequests
    res.status(200).json({
      success: true,
      group: {
        _id: group._id,
        groupName: group.groupName,
        subjects: group.subjects,
        description: group.description,
        meetingTime: group.meetingTime,
        groupProfile: group.groupProfile,
        privacy: group.privacy,                    // ✅ Critical - was missing!
        inviteCode: group.inviteCode,
        members: group.members,
        groupAdmin: group.groupAdmin,
        pendingRequests: group.pendingRequests,    // ✅ Critical - was missing!
        unreadCount: group.unreadCount,
        lastMessage: group.lastMessage,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ message: 'Error fetching group details', error });
  }
};

module.exports = GetGroupDetails;