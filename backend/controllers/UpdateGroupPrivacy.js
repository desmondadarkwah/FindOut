const GroupModel = require('../models/GroupModel');

const UpdateGroupPrivacy = async (req, res) => {
  try {
    const { groupId, privacy } = req.body; // ✅ Changed from isPrivate to privacy

    if (!['public', 'private', 'secret'].includes(privacy)) {
      return res.status(400).json({
        success: false,
        message: 'Privacy must be public, private or secret'
      });
    }

    const adminId = req.authenticatedUser.id;

    const group = await GroupModel.findById(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.groupAdmin.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can change privacy settings'
      });
    }

    // ✅ Save privacy field correctly
    await GroupModel.updateOne(
      { _id: groupId },
      { $set: { privacy: privacy } }
    );

    console.log(`✅ Group ${group.groupName} privacy set to ${privacy}`);

    res.status(200).json({
      success: true,
      message: `Group is now ${privacy}`,
      privacy // ✅ Return privacy not isPrivate
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