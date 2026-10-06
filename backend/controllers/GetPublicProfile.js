const UserModel = require('../models/UserModel');

const GetPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId)
      .select('name email profilePicture subjects status bio reputation isVerified isOnline lastSeen createdAt verifiedSubjects')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

module.exports = GetPublicProfile;