const { ChatModel } = require('../models/MessageModel');
const UserModel = require('../models/UserModel');

const StartNewChat = async (req, res) => {
  try {
    const { userIdToChat } = req.body;
    const authenticatedUser = req.authenticatedUser.id;

    if (!userIdToChat) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const authenticatedUserDetails = await UserModel.findById(authenticatedUser)
      .select('name blockedUsers');
    const userToChat = await UserModel.findById(userIdToChat)
      .select('name blockedUsers');

    if (!authenticatedUserDetails || !userToChat) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Check if current user has blocked the other user
    const currentUserBlocked = authenticatedUserDetails.blockedUsers
      ?.map(id => id.toString())
      .includes(userIdToChat.toString());

    // ✅ Check if other user has blocked the current user
    const otherUserBlocked = userToChat.blockedUsers
      ?.map(id => id.toString())
      .includes(authenticatedUser.toString());

    if (currentUserBlocked) {
      return res.status(403).json({
        success: false,
        message: "You have blocked this user. Unblock them to start a chat.",
        isBlocked: true
      });
    }

    if (otherUserBlocked) {
      return res.status(403).json({
        success: false,
        message: "You cannot message this user.",
        isBlocked: true
      });
    }

    // Check if a private chat already exists
    let chat = await ChatModel.findOne({
      isGroup: false,
      participants: { $all: [authenticatedUser, userIdToChat] },
    });

    if (!chat) {
      const participantNames = [
        { userId: authenticatedUser, name: userToChat.name },
        { userId: userIdToChat, name: authenticatedUserDetails.name },
      ];

      chat = await ChatModel.create({
        isGroup: false,
        participants: [authenticatedUser, userIdToChat],
        participantNames,
      });
    }

    res.status(200).json({
      message: "Chat started successfully",
      chat,
    });
  } catch (error) {
    console.error("Error starting chat:", error);
    res.status(500).json({ message: "Error starting chat", error: error.message });
  }
};

module.exports = StartNewChat;