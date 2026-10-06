const UserModel = require('../models/UserModel');
const fs = require('fs');
const path = require('path');

const RemoveProfilePicture = async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ✅ Delete file from disk if exists
    if (user.profilePicture) {
      const filePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await UserModel.findByIdAndUpdate(userId, { profilePicture: null });

    res.json({ success: true, message: 'Profile picture removed' });
  } catch (error) {
    console.error('Remove profile picture error:', error);
    res.status(500).json({ message: 'Failed to remove profile picture' });
  }
};

module.exports = RemoveProfilePicture;