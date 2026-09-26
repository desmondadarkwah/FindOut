const PostModel = require('../models/PostModel');
const UserModel = require('../models/UserModel');
const fs = require('fs');
const path = require('path');
const { uploadSingle } = require('../config/upload');
const { createNotification } = require('../services/notificationService');
const { getIo } = require('../socket/socket');

const AddPost = async (req, res) => {
  uploadSingle(req, res, async (err) => {
    try {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.code === 'LIMIT_FILE_SIZE'
            ? 'File size too large. Maximum size is 5MB.'
            : err.message || 'Error uploading file'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please select an image to upload'
        });
      }

      const userId = req.authenticatedUser?.id || req.user?.id;

      if (!userId) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { caption, postType, subject } = req.body;

      const newPost = new PostModel({
        author: userId,
        image: req.file.path.replace(/\\/g, '/'),
        caption: caption?.trim() || '',
        postType: postType || 'general',
        subject: subject || 'General',
        helpful: [],
        comments: [],
        helpfulCount: 0,
        commentCount: 0
      });

      const savedPost = await newPost.save();
      await savedPost.populate('author', 'name profilePicture subjects status');

      res.status(201).json({
        success: true,
        message: 'Post created successfully!',
        post: savedPost
      });

    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      console.error('Error creating post:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  });
};

const GetAllPost = async (req, res) => {
  try {
    const currentUserId = req.authenticatedUser?.id;
    const { subject, postType } = req.query;

    let filter = {};
    if (subject && subject !== 'all') filter.subject = subject;
    if (postType && postType !== 'all') filter.postType = postType;

    const posts = await PostModel.find(filter)
      .populate('author', 'name profilePicture subjects status reputation isVerified')
      .populate({ path: 'comments.user', select: 'name profilePicture' })
      .sort({ createdAt: -1 })
      .lean();

    const postsWithStatus = posts.map(post => {
      let isHelpful = false;
      if (currentUserId) {
        isHelpful = post.helpful?.some(h => h.user.toString() === currentUserId);
      }
      return { ...post, isHelpful, helpful: undefined };
    });

    res.json({ success: true, posts: postsWithStatus, totalPosts: postsWithStatus.length });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
};

const TogglePostHelpful = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.authenticatedUser?.id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const post = await PostModel.findById(postId).populate('author', 'name');
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const existingIndex = post.helpful.findIndex(h => h.user.toString() === userId);
    let isHelpful;
    let reputationChange = 0;

    if (existingIndex > -1) {
      post.helpful.splice(existingIndex, 1);
      post.helpfulCount = Math.max(0, post.helpfulCount - 1);
      isHelpful = false;
      reputationChange = -5;
    } else {
      post.helpful.push({ user: userId });
      post.helpfulCount += 1;
      isHelpful = true;
      reputationChange = 5;

      // ✅ Notify post author when someone marks helpful
      if (post.author._id.toString() !== userId.toString()) {
        try {
          const io = getIo();
          const helper = await UserModel.findById(userId).select('name');
          await createNotification({
            recipient: post.author._id,
            sender: userId,
            type: 'post_helpful',
            title: '⭐ Someone found your post helpful!',
            message: `${helper?.name || 'Someone'} marked your post as helpful`,
            link: '/feed',
            io,
          });
        } catch (e) {
          console.warn('⚠️ Helpful notification skipped:', e.message);
        }
      }
    }

    await post.save();

    await UserModel.findByIdAndUpdate(
      post.author,
      { $inc: { reputation: reputationChange } }
    );

    res.json({
      success: true,
      helpful: isHelpful,
      helpfulCount: post.helpfulCount,
      message: isHelpful ? 'Marked as helpful' : 'Removed helpful mark'
    });
  } catch (error) {
    console.error('Error toggling helpful:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle helpful' });
  }
};

// ✅ ADD COMMENT with notification
const AddComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { comment } = req.body;
    const userId = req.authenticatedUser?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!comment?.trim()) {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.comments.push({
      user: userId,
      comment: comment.trim(),
      createdAt: new Date()
    });
    post.commentCount = post.comments.length;
    await post.save();

    const updatedPost = await PostModel.findById(postId)
      .populate('author', 'name profilePicture')
      .populate({ path: 'comments.user', select: 'name profilePicture' });

    // ✅ Notify post author when someone comments
    if (post.author.toString() !== userId.toString()) {
      try {
        const io = getIo();
        const commenter = await UserModel.findById(userId).select('name');
        await createNotification({
          recipient: post.author,
          sender: userId,
          type: 'post_comment',
          title: '💬 New comment on your post',
          message: `${commenter?.name || 'Someone'} commented: "${comment.trim().substring(0, 50)}${comment.length > 50 ? '...' : ''}"`,
          link: '/feed',
          io,
        });
      } catch (e) {
        console.warn('⚠️ Comment notification skipped:', e.message);
      }
    }

    res.json({
      success: true,
      message: 'Comment added successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
};

const DeletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.authenticatedUser?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own posts' });
    }

    if (post.image) {
      const imagePath = path.resolve(post.image);
      if (fs.existsSync(imagePath)) {
        try { fs.unlinkSync(imagePath); }
        catch (fileError) { console.error('Error deleting image:', fileError); }
      }
    }

    await PostModel.findByIdAndDelete(postId);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
};

module.exports = {
  GetAllPost,
  TogglePostHelpful,
  AddComment,
  DeletePost,
  AddPost
};