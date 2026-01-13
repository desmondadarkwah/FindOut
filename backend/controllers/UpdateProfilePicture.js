const UserModel = require("../models/UserModel");

const UpdateProfilePicture = async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

    if (!profilePicture) {
      return res.status(400).json({ message: "No profile picture uploaded." });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { profilePicture },
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile picture updated successfully.",
      profilePicture: updatedUser.profilePicture,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ message: "Error updating profile picture.", error: error.message });
  }
};


module.exports = UpdateProfilePicture;
