const PostModel = require('../models/PostModel');
const UserModel = require('../models/UserModel');
const fs = require('fs');
const path = require('path');
const { uploadSingle } = require('../config/upload');

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
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // ✅ NEW: Get postType and subject from request
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
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      console.error('Error creating post:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
};

const GetAllPost = async (req, res) => {
  try {
    const currentUserId = req.authenticatedUser?.id;
    
    // ✅ NEW: Optional filtering by subject and postType
    const { subject, postType } = req.query;
    
    let filter = {};
    if (subject && subject !== 'all') {
      filter.subject = subject;
    }
    if (postType && postType !== 'all') {
      filter.postType = postType;
    }

    const posts = await PostModel.find(filter)
      .populate('author', 'name profilePicture subjects status reputation isVerified')
      .populate({
        path: 'comments.user',
        select: 'name profilePicture'
      })
      .sort({ createdAt: -1 })
      .lean();

    const postsWithStatus = posts.map(post => {
      let isHelpful = false;
      if (currentUserId) {
        isHelpful = post.helpful?.some(h => h.user.toString() === currentUserId);
      }
      
      return {
        ...post,
        isHelpful,
        helpful: undefined // Don't send full array
      };
    });

    res.json({
      success: true,
      posts: postsWithStatus,
      totalPosts: postsWithStatus.length
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ CHANGED: Toggle helpful instead of like
const TogglePostHelpful = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.authenticatedUser?.id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const existingIndex = post.helpful.findIndex(
      h => h.user.toString() === userId
    );

    let isHelpful;
    let reputationChange = 0;

    if (existingIndex > -1) {
      post.helpful.splice(existingIndex, 1);
      post.helpfulCount = Math.max(0, post.helpfulCount - 1);
      isHelpful = false;
      reputationChange = -5; // Remove points
    } else {
      post.helpful.push({ user: userId });
      post.helpfulCount += 1;
      isHelpful = true;
      reputationChange = 5; // Add points
    }

    await post.save();

    // ✅ UPDATE AUTHOR REPUTATION
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
    res.status(500).json({
      success: false,
      message: 'Failed to toggle helpful'
    });
  }
};

const DeletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.authenticatedUser?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    if (post.image) {
      const imagePath = path.resolve(post.image);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (fileError) {
          console.error('Error deleting image file:', fileError);
        }
      }
    }

    await PostModel.findByIdAndDelete(postId);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
};

module.exports = {
  GetAllPost,
  TogglePostHelpful,
  DeletePost,
  AddPost
};