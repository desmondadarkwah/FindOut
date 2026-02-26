const UserModel = require("../models/UserModel");
const GroupModel = require("../models/GroupModel");
const { ChatModel } = require("../models/MessageModel");
const mongoose = require("mongoose");

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
    let targetStatus = [];
    if (user.status === "Ready To Learn") {
      targetStatus.push("Ready To Teach");  // ✅ Opposite
    } else if (user.status === "Ready To Teach") {
      targetStatus.push("Ready To Learn");  // ✅ Opposite
    }

    console.log(`🎯 User status: ${user.status}, Looking for: ${targetStatus.join(', ')}`);

    // ─────────────────────────────────────────
    // FUZZY MATCHING FUNCTION
    // ─────────────────────────────────────────
    const fuzzyMatch = (str1, str2) => {
      const normalize = (str) => str
        .toLowerCase()
        .replace(/[+#.\-_\s]/g, '')
        .trim();
      
      const n1 = normalize(str1);
      const n2 = normalize(str2);
      
      if (n1 === n2) return { match: true, score: 10 };
      if (n1.includes(n2) || n2.includes(n1)) return { match: true, score: 7 };
      if (n1.length >= 3 && n2.length >= 3 && n1.substring(0, 3) === n2.substring(0, 3)) {
        return { match: true, score: 5 };
      }
      
      const distance = levenshteinDistance(n1, n2);
      const maxLen = Math.max(n1.length, n2.length);
      const similarity = 1 - distance / maxLen;
      
      if (similarity >= 0.7) {
        return { match: true, score: Math.floor(similarity * 5) };
      }
      
      return { match: false, score: 0 };
    };

    const levenshteinDistance = (str1, str2) => {
      const matrix = [];
      for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
      for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      return matrix[str2.length][str1.length];
    };

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

        let matchScore = 0;
        const matchedSubjects = [];

        // ✅ Status match (opposite statuses)
        if (targetStatus.length > 0 && targetStatus.includes(otherUser.status)) {
          matchScore += 20; // Higher priority for status match
        }

        // Subject matching
        for (const userSubject of user.subjects) {
          for (const otherSubject of otherUser.subjects || []) {
            const result = fuzzyMatch(userSubject, otherSubject);
            if (result.match) {
              matchScore += result.score;
              matchedSubjects.push({
                yours: userSubject,
                theirs: otherSubject,
                score: result.score
              });
              break;
            }
          }
        }

        if (otherUser.isOnline) matchScore += 3;
        if (matchedSubjects.length > 1) matchScore += matchedSubjects.length * 2;

        return matchScore > 0 ? {
          ...otherUser,
          matchScore,
          matchedSubjects
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        if (b.isOnline !== a.isOnline) return b.isOnline ? 1 : -1;
        return new Date(b.lastSeen) - new Date(a.lastSeen);
      })
      .slice(0, 15);

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

        let matchScore = 0;
        const matchedSubjects = [];

        for (const userSubject of user.subjects) {
          for (const groupSubject of group.subjects || []) {
            const result = fuzzyMatch(userSubject, groupSubject);
            if (result.match) {
              matchScore += result.score;
              matchedSubjects.push({
                yours: userSubject,
                theirs: groupSubject,
                score: result.score
              });
              break;
            }
          }
        }

        matchScore += Math.min(group.members.length, 15);
        if (matchedSubjects.length > 1) matchScore += matchedSubjects.length * 3;
        if (group.isPrivate) matchScore -= 2;

        return matchScore > 0 ? {
          ...group,
          matchScore,
          matchedSubjects
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 15);

    console.log(`✅ Matched ${suggestedUsers.length} users, ${suggestedGroups.length} groups`);

    res.status(200).json({ 
      suggestedUsers: suggestedUsers.map(u => ({
        _id: u._id,
        name: u.name,
        status: u.status,
        subjects: u.subjects,
        profilePicture: u.profilePicture,
        isOnline: u.isOnline
      })),
      suggestedGroups: suggestedGroups.map(g => ({
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