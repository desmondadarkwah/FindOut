const UserModel = require('../models/UserModel');
const PostModel = require('../models/PostModel');
const GroupModel = require('../models/GroupModel');

// ── Report a User
const ReportUser = async (req, res) => {
  try {
    const { reportedUserId, reason, chatId } = req.body;
    const userId = req.authenticatedUser.id;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Please provide a reason' });
    }

    await UserModel.findByIdAndUpdate(reportedUserId, {
      $push: {
        reports: {
          reportedBy: userId,
          reason,
          chatId,
          reportedAt: new Date()
        }
      }
    });

    res.json({ success: true, message: 'User reported successfully' });
  } catch (error) {
    console.error('Report user error:', error);
    res.status(500).json({ success: false, message: 'Failed to report user' });
  }
};

// ── Report a Post
const ReportPost = async (req, res) => {
  try {
    const { postId, reason } = req.body;
    const userId = req.authenticatedUser.id;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Please provide a reason' });
    }

    // Check if already reported
    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const alreadyReported = post.reports?.some(
      r => r.reportedBy?.toString() === userId.toString()
    );

    if (alreadyReported) {
      return res.status(400).json({ success: false, message: 'You already reported this post' });
    }

    await PostModel.findByIdAndUpdate(postId, {
      $push: {
        reports: {
          reportedBy: userId,
          reason,
          reportedAt: new Date()
        }
      }
    });

    res.json({ success: true, message: 'Post reported successfully' });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({ success: false, message: 'Failed to report post' });
  }
};

// ── Report a Group
const ReportGroup = async (req, res) => {
  try {
    const { groupId, reason } = req.body;
    const userId = req.authenticatedUser.id;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Please provide a reason' });
    }

    const group = await GroupModel.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const alreadyReported = group.reports?.some(
      r => r.reportedBy?.toString() === userId.toString()
    );

    if (alreadyReported) {
      return res.status(400).json({ success: false, message: 'You already reported this group' });
    }

    await GroupModel.findByIdAndUpdate(groupId, {
      $push: {
        reports: {
          reportedBy: userId,
          reason,
          reportedAt: new Date()
        }
      }
    });

    res.json({ success: true, message: 'Group reported successfully' });
  } catch (error) {
    console.error('Report group error:', error);
    res.status(500).json({ success: false, message: 'Failed to report group' });
  }
};

// ── Get All Reports (Admin only)
const GetAllReports = async (req, res) => {
  try {
    const [users, posts, groups] = await Promise.all([
      UserModel.find({ 'reports.0': { $exists: true } })
        .select('name email profilePicture reports')
        .populate('reports.reportedBy', 'name email')
        .lean(),
      PostModel.find({ 'reports.0': { $exists: true } })
        .select('caption postType reports author')
        .populate('author', 'name email')
        .populate('reports.reportedBy', 'name email')
        .lean(),
      GroupModel.find({ 'reports.0': { $exists: true } })
        .select('groupName privacy reports groupAdmin')
        .populate('groupAdmin', 'name email')
        .populate('reports.reportedBy', 'name email')
        .lean(),
    ]);

    res.json({
      success: true,
      reports: { users, posts, groups },
      totalReports: users.length + posts.length + groups.length
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, message: 'Failed to get reports' });
  }
};

module.exports = {
  ReportUser,
  ReportPost,
  ReportGroup,
  GetAllReports
};