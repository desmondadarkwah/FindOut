const GroupModel = require("../models/GroupModel");

const UpdateGroupProfilePicture = async (req, res) => {
  try {
    const {groupId} = req.body;
    const groupProfile = req.file ? `/uploads/${req.file.filename}` : null;

    if (!groupProfile) {
      return res.status(400).json({ message: "No profile picture uploaded." });
    }

    const updatedUser = await GroupModel.findByIdAndUpdate(
      groupId,
      { groupProfile },
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile picture updated successfully.",
      groupProfile: updatedUser.groupProfile,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ message: "Error updating profile picture.", error: error.message });
  }
};


module.exports = UpdateGroupProfilePicture;
