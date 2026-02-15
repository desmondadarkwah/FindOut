const GroupModel = require("../models/GroupModel");
const crypto = require('crypto');

const CreateGroup = async (req, res) => {
  try {
    const { groupName, subjects, description } = req.body;

    console.log("🔍 FILE RECEIVED:", req.file); // Debug: Check if the file is received

    const groupProfile = req.file ? `/uploads/${req.file.filename}` : null;

    if (!req.authenticatedUser) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    const groupAdmin = req.authenticatedUser.id;

    // ✅ Generate unique invite code (16 characters)
    const inviteCode = crypto.randomBytes(8).toString('hex');

    const newGroup = new GroupModel({
      groupName,
      subjects,
      description,
      groupProfile,
      groupAdmin,
      members: [groupAdmin],
      inviteCode, // ✅ Add invite code
      unreadCount: [{ userId: groupAdmin, count: 0 }] // Initialize unread count for admin
    });

    await newGroup.save();

    // ✅ Populate the group before sending response
    const populatedGroup = await GroupModel.findById(newGroup._id)
      .populate('members', 'name profilePicture')
      .populate('groupAdmin', 'name profilePicture');

    res.status(201).json({ 
      success: true,
      message: 'Group created successfully', 
      group: populatedGroup 
    });
  } catch (error) {
    console.error("❌ Error creating group:", error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating group', 
      error: error.message 
    });
  }
};

module.exports = CreateGroup;