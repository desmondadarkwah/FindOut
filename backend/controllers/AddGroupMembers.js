const GroupModel = require("../models/GroupModel");

const AddGroupMembers = async (req, res) => {
  try {
    const { groupId, members } = req.body;

    if (!groupId || !members || !Array.isArray(members)) {
      return res.status(400).json({ message: 'Group ID and members array are required' });
    }

    const group = await GroupModel.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    console.log('Group Admin:', group.groupAdmin.toString());
    console.log('Authenticated User ID:', req.authenticatedUser.id);

    // Ensure the authenticated user is the group admin
    if (group.groupAdmin.toString() !== req.authenticatedUser.id) {
      return res.status(403).json({ message: 'Only the group admin can add members' });
    }

    group.members = [...new Set([...group.members, ...members])]; // Ensure no duplicates
    await group.save();

    res.status(200).json({ message: 'Members added successfully', group });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ message: 'Error adding members to group', error });
  }
};

module.exports = AddGroupMembers;
