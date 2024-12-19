const GroupModel = require("../models/GroupModel");

const CreateGroup = async (req, res) => {
  try {
    const { groupName, subjects, description, meetingTime } = req.body;

    if (!req.authenticatedUser) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    const groupAdmin = req.authenticatedUser.id;

    if (!meetingTime) {
      return res.status(400).json({ message: 'Meeting time is required' });
    }

    const newGroup = new GroupModel({
      groupName,
      subjects,
      description,
      meetingTime,
      groupAdmin,  
      members: [groupAdmin],
    });

    // Save the group to the database
    await newGroup.save();
    
    // Respond with success
    res.status(201).json({ message: 'Group created successfully', group: newGroup });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ message: 'Error creating group', error });
  }
};

module.exports = CreateGroup;
