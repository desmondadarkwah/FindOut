const GroupModel = require("../models/GroupModel");
const { ChatModel } = require('../models/MessageModel');

const GetAllChats = async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    const groups = await GroupModel.find({
      members: userId
    }).populate('members', 'name groupProfile status')
      .populate('lastMessage.senderId', 'name profilePicture');

    const privateChats = await ChatModel.find({
      isGroup: false,
      participants: userId,
    }).populate('participants', 'name profilePicture')
      .populate('lastMessage.senderId', 'name profilePicture');

    if (!groups.length && !privateChats.length) {
      return res.status(404).json({ message: 'No chats found for this user' });
    }

    const allChats = [...groups, ...privateChats];

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

module.exports = GetAllChats