const GroupModel = require("../models/GroupModel");
const { ChatModel } = require('../models/MessageModel');
const UserModel = require('../models/UserModel');

const GetAllChats = async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;

    // ✅ Get current user's blocked list
    const currentUser = await UserModel.findById(userId).select('blockedUsers');
    const blockedUsers = currentUser?.blockedUsers?.map(id => id.toString()) || [];

    const groups = await GroupModel.find({
      members: userId
    }).populate('members', 'name groupProfile status')
      .populate('lastMessage.senderId', 'name profilePicture');

    const privateChats = await ChatModel.find({
      isGroup: false,
      participants: userId,
    }).populate('participants', 'name profilePicture')
      .populate('lastMessage.senderId', 'name profilePicture');

    const groupsWithUnread = groups.map(group => {
      const groupObj = group.toObject();
      const unreadEntry = groupObj.unreadCount?.find(
        u => u.userId?.toString() === userId.toString()
      );
      return {
        ...groupObj,
        unreadCount: unreadEntry ? unreadEntry.count : 0
      };
    });

    // ✅ Keep blocked chats but flag them instead of filtering out
    const chatsWithUnread = privateChats.map(chat => {
      const chatObj = chat.toObject();
      const unreadEntry = chatObj.unreadCount?.find(
        u => u.userId?.toString() === userId.toString()
      );

      // ✅ Check if other participant is blocked
      const otherParticipant = chatObj.participants?.find(
        p => p._id?.toString() !== userId.toString()
      );
      const isBlockedChat = otherParticipant
        ? blockedUsers.includes(otherParticipant._id?.toString())
        : false;

      return {
        ...chatObj,
        unreadCount: unreadEntry ? unreadEntry.count : 0,
        isBlockedChat, // ✅ Flag instead of removing
      };
    });

    const allChats = [...groupsWithUnread, ...chatsWithUnread];

    allChats.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.createdAt;
      const bTime = b.lastMessage?.createdAt || b.createdAt;
      return new Date(bTime) - new Date(aTime);
    });

    res.status(200).json({ chats: allChats, userId });

  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: 'Error fetching chats', error });
  }
}

module.exports = GetAllChats;