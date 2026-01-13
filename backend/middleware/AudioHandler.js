const express = require("express");
const multer = require("multer");
const path = require("path");
const { MessageModel } = require("../models/MessageModel");

const uploadPath = path.join(__dirname, "..", "audios");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    cb(null, `audio-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("audio/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only audio is allowed"), false);
  }
};

const audioUpload = multer({ storage, fileFilter });

const AudioHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No audio recorded" });
    }
    
    const audioUrl = `${req.protocol}://${req.get('host')}/audios/${req.file.filename}`;
    const newMessage = new MessageModel({
      chatId: req.body.chatId,
      senderId: req.body.senderId,
      content: audioUrl,
      type: "audio",
    });

    const savedMessage = await newMessage.save();
    const populatedMessage = await savedMessage.populate('senderId', 'name email profilePicture');

    res.status(200).json({ success: true, message: populatedMessage });

  } catch (error) {
    console.error("Error uploading audio message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  audioUpload,
  AudioHandler,
};