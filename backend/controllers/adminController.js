const AdminModel = require('../models/AdminModel');
const UserModel = require('../models/UserModel');
const PostModel = require('../models/PostModel');
const GroupModel = require('../models/GroupModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ═══════════════════════════════════════════════════════════════
// ADMIN AUTHENTICATION
// ═══════════════════════════════════════════════════════════════

const AdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        isSuperAdmin: admin.isSuperAdmin
      },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const AdminLogout = async (req, res) => {
  try {
    res.clearCookie('adminToken');
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const GetCurrentAdmin = async (req, res) => {
  try {
    res.json({
      success: true,
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        isSuperAdmin: req.admin.isSuperAdmin
      }
    });
  } catch (error) {
    console.error('Get current admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════

const GetDashboardStats = async (req, res) => {
  try {
    // Get counts
    const [
      totalUsers,
      totalPosts,
      totalGroups,
      onlineUsers,
      teacherCount,
      learnerCount
    ] = await Promise.all([
      UserModel.countDocuments(),
      PostModel.countDocuments(),
      GroupModel.countDocuments(),
      UserModel.countDocuments({ isOnline: true }),
      UserModel.countDocuments({ status: 'Ready To Teach' }),
      UserModel.countDocuments({ status: 'Ready To Learn' })
    ]);

    // Get recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSignups = await UserModel.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get posts by type
    const postsByType = await PostModel.aggregate([
      {
        $group: {
          _id: '$postType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top subjects
    const topSubjects = await PostModel.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get top contributors
    const topContributors = await UserModel.find()
      .select('name email reputation profilePicture')
      .sort({ reputation: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          teachers: teacherCount,
          learners: learnerCount,
          online: onlineUsers,
          recentSignups
        },
        posts: {
          total: totalPosts,
          byType: postsByType
        },
        groups: {
          total: totalGroups
        },
        topSubjects,
        topContributors
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════

const GetAllUsers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    let filter = {};

    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }

    const users = await UserModel.find(filter)
      .select('name email status subjects reputation isVerified createdAt lastSeen isOnline profilePicture')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const totalUsers = await UserModel.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        total: totalUsers,
        page: parseInt(page),
        pages: Math.ceil(totalUsers / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

const VerifyUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    ).select('name email isVerified');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User verified successfully',
      user
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify user'
    });
  }
};

const UnverifyUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { isVerified: false },
      { new: true }
    ).select('name email isVerified');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User verification removed',
      user
    });
  } catch (error) {
    console.error('Unverify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unverify user'
    });
  }
};

const DeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete user's posts
    await PostModel.deleteMany({ author: userId });

    // Remove user from groups
    await GroupModel.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    // Delete the user
    const user = await UserModel.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

const PromoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already an admin
    const existingAdmin = await AdminModel.findOne({ email: user.email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'User is already an admin'
      });
    }

    // Create admin account with same email
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newAdmin = new AdminModel({
      name: user.name,
      email: user.email,
      password: hashedPassword,
      isSuperAdmin: false,
      createdBy: req.admin._id
    });

    await newAdmin.save();

    res.json({
      success: true,
      message: 'User promoted to admin',
      tempPassword, // Send this to admin to share with new admin
      admin: {
        name: newAdmin.name,
        email: newAdmin.email
      }
    });
  } catch (error) {
    console.error('Promote to admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to promote user'
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// POST MANAGEMENT
// ═══════════════════════════════════════════════════════════════

const GetAllPosts = async (req, res) => {
  try {
    const { subject, postType, page = 1, limit = 20 } = req.query;

    let filter = {};

    if (subject && subject !== 'all') {
      filter.subject = subject;
    }

    if (postType && postType !== 'all') {
      filter.postType = postType;
    }

    const posts = await PostModel.find(filter)
      .populate('author', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const totalPosts = await PostModel.countDocuments(filter);

    res.json({
      success: true,
      posts,
      pagination: {
        total: totalPosts,
        page: parseInt(page),
        pages: Math.ceil(totalPosts / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
};

const DeletePostAdmin = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await PostModel.findByIdAndDelete(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
};

module.exports = {
  AdminLogin,
  AdminLogout,
  GetCurrentAdmin,
  GetDashboardStats,
  GetAllUsers,
  VerifyUser,
  UnverifyUser,
  DeleteUser,
  PromoteToAdmin,
  GetAllPosts,
  DeletePostAdmin
};