const User = require('../models/UserModel');

const SearchUsers = async (req, res) => {
  try {
    const currentUserId = req.authenticatedUser.id;
    const searchQuery = req.query.q;

    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    // Search by name or email (case-insensitive)
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ]
    })
      .select('name email profilePicture status')
      .limit(20) // Limit results to 20 users max
      .lean();

    console.log(`🔍 Found ${users.length} users matching "${searchQuery}"`);

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('❌ Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
};

module.exports = SearchUsers;