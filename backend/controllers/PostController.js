// postController.js
const PostModel = require('../models/PostModel');
const fs = require('fs');
const path = require('path');
const { uploadSingle } = require('../config/upload'); // Adjust path as needed

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
      
      console.log('User object:', req.user); 
      console.log('Extracted userId:', userId); 
      
      if (!userId) {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { caption } = req.body;
      
      const newPost = new PostModel({
        author: userId,
        image: req.file.path.replace(/\\/g, '/'), 
        caption: caption?.trim() || '',
        likes: [],
        comments: [],
        likeCount: 0,
        commentCount: 0
      });

      console.log('Creating post with author:', userId); // Debug log
      
      // Save post to database
      const savedPost = await newPost.save();
      
      // Populate author details for response
      await savedPost.populate('author', 'name profilePicture');
      
      // Return success response
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

    const posts = await PostModel.find()
      .populate('author', 'name profilePicture')
      .populate({
        path: 'comments.user',
        select: 'name profilePicture'
      })
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    // Add isLiked field for each post if user is authenticated
    const postsWithLikeStatus = posts.map(post => {
      let isLiked = false;
      if (currentUserId) {
        isLiked = post.likes.some(like => like.user.toString() === currentUserId);
      }
      
      return {
        ...post,
        isLiked,
        // Don't send the full likes array to frontend for privacy
        likes: undefined
      };
    });

    res.json({
      success: true,
      posts: postsWithLikeStatus,
      totalPosts: postsWithLikeStatus.length
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

const TogglePostLikes = async (req, res) => {
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

    const existingLikeIndex = post.likes.findIndex(
      like => like.user.toString() === userId
    );

    let isLiked;
    if (existingLikeIndex > -1) {
      // Unlike the post
      post.likes.splice(existingLikeIndex, 1);
      post.likeCount = Math.max(0, post.likeCount - 1);
      isLiked = false;
    } else {
      // Like the post
      post.likes.push({ user: userId });
      post.likeCount += 1;
      isLiked = true;
    }

    await post.save();

    res.json({
      success: true,
      liked: isLiked,
      likeCount: post.likeCount,
      message: isLiked ? 'Post liked' : 'Post unliked'
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
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

    // Check if user is the author
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    // Delete the image file if it exists
    if (post.image) {
      const imagePath = path.resolve(post.image);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (fileError) {
          console.error('Error deleting image file:', fileError);
          // Continue with post deletion even if file deletion fails
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
  TogglePostLikes,
  DeletePost,
  AddPost
};