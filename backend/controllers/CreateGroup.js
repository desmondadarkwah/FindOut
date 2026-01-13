const GroupModel = require("../models/GroupModel");

const CreateGroup = async (req, res) => {
  try {
    const { groupName, subjects, description } = req.body;
    // const groupProfile = req.file ? req.file.path : null;
    // console.log("Profile picture path being saved:", profilePicture);

    console.log("🔍 FILE RECEIVED:", req.file); // Debug: Check if the file is received

    const groupProfile = req.file ? `/uploads/${req.file.filename}` : null;


    if (!req.authenticatedUser) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    const groupAdmin = req.authenticatedUser.id;


    const newGroup = new GroupModel({
      groupName,
      subjects,
      description,
      // meetingTime,
      groupProfile,
      groupAdmin,
      members: [groupAdmin],
    });

    await newGroup.save();

    res.status(201).json({ message: 'Group created successfully', group: newGroup });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ message: 'Error creating group', error });
  }
};

module.exports = CreateGroup;
