const GroupModel = require("../models/GroupModel");
const crypto = require('crypto');

const CreateGroup = async (req, res) => {
  try {
    const { groupName, subjects, description, privacy } = req.body; // ✅ privacy instead of isPrivate

    console.log("🔍 FILE RECEIVED:", req.file);
    console.log("🔍 PRIVACY SETTING:", privacy);

    const groupProfile = req.file ? `/uploads/${req.file.filename}` : null;

    if (!req.authenticatedUser) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    const groupAdmin = req.authenticatedUser.id;
    const inviteCode = crypto.randomBytes(8).toString('hex');

    // ✅ Validate privacy value - default to 'public' if invalid
    const validPrivacyValues = ['public', 'private', 'secret'];
    const groupPrivacy = validPrivacyValues.includes(privacy) ? privacy : 'public';

    const newGroup = new GroupModel({
      groupName,
      subjects,
      description,
      groupProfile,
      groupAdmin,
      members: [groupAdmin],
      inviteCode,
      privacy: groupPrivacy, // ✅ UPDATED: was isPrivate boolean
      unreadCount: [{ userId: groupAdmin, count: 0 }]
    });

    await newGroup.save();

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