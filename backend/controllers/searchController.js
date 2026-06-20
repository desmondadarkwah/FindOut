const UserModel = require('../models/UserModel');
const GroupModel = require('../models/GroupModel');
const PostModel = require('../models/PostModel');

// ═══════════════════════════════════════════════════════════════
// GLOBAL SEARCH
// ═══════════════════════════════════════════════════════════════

const GlobalSearch = async (req, res) => {
  try {
    const { query, type = 'all', limit = 10 } = req.query;
    const userId = req.authenticatedUser.id;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const searchRegex = new RegExp(query, 'i');
    const results = {};

    // Search Users
    if (type === 'all' || type === 'users') {
      const users = await UserModel.find({
        _id: { $ne: userId },
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { subjects: { $in: [searchRegex] } }
        ]
      })
        .select('name email profilePicture status subjects isVerified isOnline reputation')
        .limit(parseInt(limit))
        .lean();

      results.users = users;
    }

    // Search Groups
    // ✅ UPDATED: Exclude secret groups from search results
    if (type === 'all' || type === 'groups') {
      const groups = await GroupModel.find({
        privacy: { $ne: 'secret' }, // ✅ Secret groups never appear in search
        $or: [
          { groupName: searchRegex },
          { description: searchRegex },
          { subjects: { $in: [searchRegex] } }
        ]
      })
        .select('groupName description groupProfile members privacy subjects createdAt')
        .limit(parseInt(limit))
        .lean();

      results.groups = groups.map(group => ({
        ...group,
        memberCount: group.members?.length || 0,
        isMember: group.members?.some(m => m.toString() === userId.toString())
      }));
    }

    // Search Posts
    if (type === 'all' || type === 'posts') {
      const posts = await PostModel.find({
        $or: [
          { caption: searchRegex },
          { subject: searchRegex }
        ]
      })
        .populate('author', 'name email profilePicture')
        .select('caption image subject postType helpfulCount comments createdAt')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean();

      results.posts = posts;
    }

    res.json({
      success: true,
      query,
      results
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// EXPLORE GROUPS
// ═══════════════════════════════════════════════════════════════

const ExploreGroups = async (req, res) => {
  try {
    const { 
      subject, 
      privacy,       // ✅ UPDATED: was isPrivate
      sortBy = 'newest', 
      page = 1, 
      limit = 20 
    } = req.query;
    const userId = req.authenticatedUser.id;

    const user = await UserModel.findById(userId).select('subjects');
    const userSubjects = user?.subjects || [];

    // ✅ UPDATED: Always exclude secret groups from explore
    let filter = {
      privacy: { $ne: 'secret' }
    };

    // Subject filter
    if (subject && subject !== 'all') {
      filter.subjects = { $in: [new RegExp(subject, 'i')] };
    }

    // ✅ UPDATED: Privacy filter using new field
    if (privacy && privacy !== 'all') {
      filter.privacy = privacy; // 'public' or 'private' only (secret already excluded)
    }

    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'popular':
        break;
      case 'active':
        sort = { updatedAt: -1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
    }

    const allGroups = await GroupModel.find(filter)
      .populate('groupAdmin', 'name profilePicture')
      .select('groupName description groupProfile members groupAdmin privacy subjects createdAt updatedAt pendingRequests')
      .sort(sort)
      .lean();

    const groupsWithDetails = allGroups.map(group => {
      const memberCount = group.members?.length || 0;
      const isMember = group.members?.some(m => m.toString() === userId.toString());
      const isAdmin = group.groupAdmin?._id?.toString() === userId.toString();

      const hasPendingRequest = group.pendingRequests?.some(
        req => req.userId?.toString() === userId.toString()
      );

      const subjectMatch = userSubjects.some(userSubject =>
        group.subjects?.some(groupSubject =>
          groupSubject.toLowerCase().includes(userSubject.toLowerCase())
        )
      );

      return {
        _id: group._id,
        groupName: group.groupName,
        description: group.description,
        groupPicture: group.groupProfile,
        members: group.members,
        groupAdmin: group.groupAdmin,
        privacy: group.privacy,                    // ✅ NEW field
        isPrivate: group.privacy === 'private',    // ✅ Keep for frontend compatibility
        isSecret: group.privacy === 'secret',      // ✅ NEW
        subject: group.subjects?.[0] || 'General',
        subjects: group.subjects,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        memberCount,
        isMember,
        isAdmin,
        hasPendingRequest,
        suggested: subjectMatch && !isMember
      };
    });

    if (sortBy === 'popular') {
      groupsWithDetails.sort((a, b) => b.memberCount - a.memberCount);
    }

    const suggested = groupsWithDetails.filter(g => g.suggested).slice(0, 6);
    const popular = [...groupsWithDetails].sort((a, b) => b.memberCount - a.memberCount).slice(0, 10);
    const recentlyActive = [...groupsWithDetails].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 10);

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedGroups = groupsWithDetails.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      suggested,
      popular,
      recentlyActive,
      allGroups: paginatedGroups,
      pagination: {
        total: groupsWithDetails.length,
        page: parseInt(page),
        pages: Math.ceil(groupsWithDetails.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Explore groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch groups'
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET ALL USERS
// ═══════════════════════════════════════════════════════════════

const GetAllUsers = async (req, res) => {
  try {
    const { 
      status, 
      subject, 
      verified, 
      online,
      sortBy = 'reputation',
      page = 1, 
      limit = 20 
    } = req.query;
    const userId = req.authenticatedUser.id;

    let filter = { _id: { $ne: userId } };

    if (status && status !== 'all') filter.status = status;
    if (subject && subject !== 'all') filter.subjects = subject;
    if (verified === 'true') filter.isVerified = true;
    if (online === 'true') filter.isOnline = true;

    let sort = {};
    switch (sortBy) {
      case 'reputation': sort = { reputation: -1 }; break;
      case 'newest':     sort = { createdAt: -1 };  break;
      case 'name':       sort = { name: 1 };         break;
      default:           sort = { reputation: -1 };
    }

    const users = await UserModel.find(filter)
      .select('name email profilePicture status subjects isVerified isOnline reputation')
      .sort(sort)
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

module.exports = { GlobalSearch, ExploreGroups, GetAllUsers };