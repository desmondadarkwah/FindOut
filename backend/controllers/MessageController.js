const { MessageModel, ChatModel } = require('../models/MessageModel');


const GetMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await MessageModel.find({ chatId})
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
    const { chatId, content ,senderId} = req.body;

    if (!chatId || !content || !senderId) {
      return res.status(400).json({ error: 'chatId, content, and senderId are required' });
    }
    
    const newMessage = await MessageModel.create({
      chatId,
      senderId,
      content,
      type: "text",  
    })


    await ChatModel.findByIdAndUpdate(newMessage.chatId, {
      lastMessage: {
        content: newMessage.content,
        senderId: newMessage.senderId,
        type: 'text',
        createdAt: new Date()
      }
    })

    const populatedMessage = await newMessage.populate('senderId', 'name profilePicture email');


    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}

module.exports = {
  GetMessages,
  SendMessage,
};
