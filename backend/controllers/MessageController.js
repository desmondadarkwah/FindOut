const { MessageModel, ChatModel } = require('../models/MessageModel');
const UserModel = require('../models/UserModel');

const GetMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.authenticatedUser.id;

    // ✅ Fetch messages but filter out ones deleted for this user
    const messages = await MessageModel.find({
      chatId,
      deletedFor: { $nin: [userId] } // ✅ Don't show messages deleted for this user
    })
      .populate('senderId', 'profilePicture name')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
};

const SendMessage = async (req, res) => {
  try {
    const { chatId, content, senderId } = req.body;

    if (!chatId || !content || !senderId) {
      return res.status(400).json({ error: 'chatId, content, and senderId are required' });
    }

    // ✅ Get the chat to find the other participant
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // ✅ Only check blocks for private chats (not groups)
    if (!chat.isGroup) {
      const otherParticipantId = chat.participants.find(
        p => p.toString() !== senderId.toString()
      );

      if (otherParticipantId) {
        // ✅ Check if sender is blocked by the other user
        const otherUser = await UserModel.findById(otherParticipantId)
          .select('blockedUsers');

        const senderIsBlocked = otherUser?.blockedUsers
          ?.map(id => id.toString())
          .includes(senderId.toString());

        if (senderIsBlocked) {
          return res.status(403).json({
            error: 'Message not delivered',
            isBlocked: true,
            message: "You can't send messages to this user"
          });
        }

        // ✅ Check if sender has blocked the other user
        const senderUser = await UserModel.findById(senderId)
          .select('blockedUsers');

        const otherIsBlocked = senderUser?.blockedUsers
          ?.map(id => id.toString())
          .includes(otherParticipantId.toString());

        if (otherIsBlocked) {
          return res.status(403).json({
            error: 'Message not delivered',
            isBlocked: true,
            message: "Unblock this user to send messages"
          });
        }
      }
    }

    // ✅ All clear - save the message
    const newMessage = await MessageModel.create({
      chatId,
      senderId,
      content,
      type: "text",
    });

    await ChatModel.findByIdAndUpdate(newMessage.chatId, {
      lastMessage: {
        content: newMessage.content,
        senderId: newMessage.senderId,
        type: 'text',
        createdAt: new Date()
      }
    });

    const populatedMessage = await newMessage.populate('senderId', 'name profilePicture email');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

module.exports = { GetMessages, SendMessage };