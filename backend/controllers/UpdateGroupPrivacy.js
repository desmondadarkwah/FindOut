const GroupModel = require('../models/GroupModel');

const UpdateGroupPrivacy = async (req, res) => {
  try {
    const { groupId, isPrivate } = req.body;
    const adminId = req.authenticatedUser.id;

    const group = await GroupModel.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.groupAdmin.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can change privacy settings'
      });
    }

    // Update using updateOne to avoid validation issues
    await GroupModel.updateOne(
      { _id: groupId },
      { $set: { isPrivate: isPrivate } }
    );

    console.log(`✅ Group ${group.groupName} privacy set to ${isPrivate ? 'Private' : 'Public'}`);

    res.status(200).json({
      success: true,
      message: `Group is now ${isPrivate ? 'Private' : 'Public'}`,
      isPrivate
    });

  } catch (error) {
    console.error('❌ Error updating privacy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update privacy',
      error: error.message
    });
  }
};

module.exports = UpdateGroupPrivacy;