const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { MessageModel } = require("../models/MessageModel");

/**
 * Image and document attachments for chat messages.
 *
 * Modelled on AudioHandler, which was the only upload path messages had — the
 * paperclip in the chat window was an icon with no handler behind it, and
 * SendMessage hardcodes type: "text", so there was no way to send anything but
 * text and voice.
 */

const uploadPath = path.join(__dirname, "..", "uploads", "attachments");

// multer will not create this, and uploads/ is git-ignored, so it is missing
// on a fresh clone. Same reason AudioHandler creates its own directory.
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    // The original name is kept in the database for display, not on disk: it
    // is user input, and it would be a path-traversal hole here.
    const safeExt = path.extname(file.originalname).slice(0, 10).replace(/[^.a-z0-9]/gi, "");
    cb(null, `attach-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

/* Images, plus the document formats a student would actually share: lecture
   notes, slides, spreadsheets and archives. Anything executable is refused. */
const ALLOWED = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/heic",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
]);

const MAX_BYTES = 10 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  if (ALLOWED.has(file.mimetype)) return cb(null, true);
  cb(new Error("That file type cannot be shared here."), false);
};

const attachmentUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_BYTES },
});

const AttachmentHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file received" });
    }

    const { chatId } = req.body;
    // Taken from the token rather than the body: the audio route trusts a
    // senderId the client supplies, which lets anyone post as anyone.
    const senderId = req.authenticatedUser?.id;

    if (!chatId || !senderId) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: "chatId is required" });
    }

    const isImage = req.file.mimetype.startsWith("image/");
    const url = `${req.protocol}://${req.get("host")}/uploads/attachments/${req.file.filename}`;

    const savedMessage = await new MessageModel({
      chatId,
      senderId,
      content: url,
      type: isImage ? "image" : "file",
      attachment: {
        name: req.file.originalname,
        size: req.file.size,
        mime: req.file.mimetype,
      },
    }).save();

    const populatedMessage = await savedMessage.populate(
      "senderId",
      "name email profilePicture"
    );

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    // Never leave the file behind when the record it belongs to failed.
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    console.error("Error uploading attachment:", error);
    res.status(500).json({ success: false, message: "Failed to send the attachment" });
  }
};

/** Turns multer's own errors into something a person can act on. */
const handleAttachmentErrors = (err, req, res, next) => {
  if (!err) return next();
  const message =
    err.code === "LIMIT_FILE_SIZE"
      ? "That file is larger than 10 MB."
      : err.message || "Upload failed";
  res.status(400).json({ success: false, message });
};

module.exports = { attachmentUpload, AttachmentHandler, handleAttachmentErrors, MAX_BYTES };
