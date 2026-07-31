const UserModel = require("../models/UserModel");
const GroupModel = require("../models/GroupModel");
const { ChatModel } = require("../models/MessageModel");
const mongoose = require("mongoose");
const {
  fuzzyMatch,
  complementaryStatus,
  scoreUser,
  scoreGroup,
  rankUsers,
  rankGroups,
} = require("../services/matchingService");

const Suggestions = async (req, res) => {
  try {
    const { id } = req.authenticatedUser;
    const userId = new mongoose.Types.ObjectId(id);
    
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.subjects || user.subjects.length === 0) {
      return res.status(200).json({ 
        suggestedUsers: [], 
        suggestedGroups: [],
        message: "Add subjects to your profile to get personalized suggestions"
      });
    }

    // ─────────────────────────────────────────
    // FIND EXISTING CONNECTIONS (DMs only)
    // ─────────────────────────────────────────
    const existingChats = await ChatModel.find({
      participants: userId,
      isGroup: false
    }).select('participants');

    const connectedUserIds = existingChats
      .flatMap(chat => chat.participants)
      .filter(p => p.toString() !== userId.toString())
      .map(p => p.toString());

    // ─────────────────────────────────────────
    // ✅ OPPOSITE STATUS MATCHING
    // ─────────────────────────────────────────
    const targetStatus = complementaryStatus(user.status);

    console.log(`🎯 User status: ${user.status}, Looking for: ${targetStatus.join(', ')}`);

    // ─────────────────────────────────────────
    // FETCH & MATCH USERS
    // ─────────────────────────────────────────
    const allUsers = await UserModel.find({
      _id: { $ne: userId },
      subjects: { $exists: true, $ne: [] }
    }).select('name status subjects profilePicture isOnline lastSeen').lean();

    const suggestedUsers = allUsers
      .map(otherUser => {
        if (connectedUserIds.includes(otherUser._id.toString())) {
          return null;
        }

        const { score: matchScore, matchedSubjects } = scoreUser(user, otherUser);

        return matchScore > 0 ? {
          ...otherUser,
          matchScore,
          matchedSubjects
        } : null;
      })
      .filter(Boolean);
    const rankedUsers = rankUsers(suggestedUsers);

    // ─────────────────────────────────────────
    // FETCH & MATCH GROUPS
    // ─────────────────────────────────────────
    const allGroups = await GroupModel.find({
      subjects: { $exists: true, $ne: [] }
    })
    .populate('pendingRequests.userId', 'name profilePicture') // ✅ POPULATE HERE
    .select('groupProfile groupName subjects members isPrivate createdAt pendingRequests')
    .lean();

    const suggestedGroups = allGroups
      .map(group => {
        const isMember = group.members.some(m => m.toString() === userId.toString());
        if (isMember) return null;

        const hasPendingRequest = group.pendingRequests?.some(
          req => (req.userId?._id || req.userId)?.toString() === userId.toString()
        );
        if (hasPendingRequest) return null;

        const { score: matchScore, matchedSubjects } = scoreGroup(user, group);

        return matchScore > 0 ? {
          ...group,
          matchScore,
          matchedSubjects
        } : null;
      })
      .filter(Boolean);
    const rankedGroups = rankGroups(suggestedGroups);

    console.log(`✅ Matched ${rankedUsers.length} users, ${rankedGroups.length} groups`);

    res.status(200).json({ 
      suggestedUsers: rankedUsers.map(u => ({
        _id: u._id,
        name: u.name,
        status: u.status,
        subjects: u.subjects,
        profilePicture: u.profilePicture,
        isOnline: u.isOnline
      })),
      suggestedGroups: rankedGroups.map(g => ({
        _id: g._id,
        groupName: g.groupName,
        groupProfile: g.groupProfile,
        subjects: g.subjects,
        members: g.members,
        isPrivate: g.isPrivate,
        pendingRequests: g.pendingRequests // ✅ Already populated
      }))
    });

  } catch (error) {
    console.error("❌ Error fetching suggestions:", error);
    res.status(500).json({ message: "Error fetching suggestions" });
  }
};

module.exports = Suggestions;