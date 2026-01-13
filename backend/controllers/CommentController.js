const PostModel = require('../models/PostModel');

const AddComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.authenticatedUser?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const newComment = {
      user: userId,
      text: text.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    post.commentCount += 1;

    await post.save();

    // Populate the new comment for response
    await post.populate('comments.user', 'name profilePicture');
    const addedComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      comment: addedComment,
      commentCount: post.commentCount
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
};

// FIXED: This function now includes replies with proper population
const GetComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.authenticatedUser?.id;

    const post = await PostModel.findById(postId)
      .populate({
        path: 'comments.user',
        select: 'name profilePicture'
      })
      .populate({
        path: 'comments.replies.user', // ADD THIS LINE
        select: 'name profilePicture'
      })
      .select('comments');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const formattedComments = post.comments.map(comment => {
      // Format replies
      const formattedReplies = (comment.replies || []).map(reply => ({
        _id: reply._id,
        text: reply.text,
        user: reply.user,
        createdAt: reply.createdAt,
        likeCount: reply.likes ? reply.likes.length : 0,
        isLiked: userId && reply.likes ?
          reply.likes.some(like => like.user.toString() === userId) : false
      }));

      return {
        _id: comment._id,
        text: comment.text,
        user: comment.user,
        createdAt: comment.createdAt,
        likeCount: comment.likes ? comment.likes.length : 0,
        isLiked: userId && comment.likes ?
          comment.likes.some(like => like.user.toString() === userId) : false,
        replyCount: comment.replyCount || 0,
        replies: formattedReplies // INCLUDE REPLIES IN RESPONSE
      };
    });

    formattedComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      comments: formattedComments,
      totalComments: formattedComments.length
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const LikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.authenticatedUser?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const post = await PostModel.findOne({ 'comments._id': commentId });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Find the specific comment
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Initialize likes array if it doesn't exist
    if (!comment.likes) {
      comment.likes = [];
    }

    // Filter out any invalid likes and find existing like
    comment.likes = comment.likes.filter(like => like && like.user);

    const existingLikeIndex = comment.likes.findIndex(like => {
      try {
        return like.user.toString() === userId;
      } catch (err) {
        console.warn('Invalid like found during comparison:', like);
        return false;
      }
    });

    let liked = false;

    if (existingLikeIndex > -1) {
      // Unlike - remove the like
      comment.likes.splice(existingLikeIndex, 1);
      liked = false;
    } else {
      // Like - add the like
      comment.likes.push({
        user: userId,
        createdAt: new Date()
      });
      liked = true;
    }

    await post.save();

    res.status(200).json({
      success: true,
      liked: liked,
      likeCount: comment.likes.length,
      message: liked ? 'Comment liked' : 'Comment unliked'
    });

  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const ReplyComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.authenticatedUser?.id;


    // Validate required parameters
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply text is required'
      });
    }

    if (text.trim().length > 300) {
      return res.status(400).json({
        success: false,
        message: 'Reply text cannot exceed 300 characters'
      });
    }

    // Find post with the specific comment
    const post = await PostModel.findOne({ 'comments._id': commentId });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Find the specific comment
    const comment = post.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Initialize replies array if it doesn't exist
    if (!comment.replies) {
      comment.replies = [];
    }

    // Create new reply
    const newReply = {
      user: userId,
      text: text.trim(),
      likes: [],
      likeCount: 0,
      createdAt: new Date()
    };

    comment.replies.push(newReply);
    comment.replyCount = comment.replies.length;

    
    // Save the post
    await post.save();
    
    // Populate the user data for the response
    await post.populate({
      path: 'comments.replies.user',
      select: 'name profilePicture'
    });

    // Get the newly added reply (it should be the last one)
    const addedReply = comment.replies[comment.replies.length - 1];


    res.status(201).json({
      success: true,
      reply: {
        _id: addedReply._id,
        text: addedReply.text,
        user: addedReply.user,
        createdAt: addedReply.createdAt,
        likeCount: addedReply.likeCount || 0,
        isLiked: false
      },
      replyCount: comment.replyCount,
      message: 'Reply added successfully'
    });

  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

const GetRepliedComments = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.authenticatedUser?.id;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;


    // Find post with the specific comment and populate replies
    const post = await PostModel.findOne({ 'comments._id': commentId });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Find the specific comment
    const comment = post.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Now populate the replies with user data
    await post.populate({
      path: 'comments.replies.user',
      select: 'name profilePicture'
    });

    // Get replies with pagination
    const replies = comment.replies || [];    
    const sortedReplies = replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const paginatedReplies = sortedReplies.slice(skip, skip + limitNum);

    // Format replies with like status
    const formattedReplies = paginatedReplies.map(reply => {
      
      if (!reply) return null;

      let likeCount = 0;
      let isLiked = false;

      // Safely handle likes array
      if (reply.likes && Array.isArray(reply.likes)) {
        const validLikes = reply.likes.filter(like => {
          return like && 
                 like.user && 
                 (typeof like.user === 'string' || 
                  (typeof like.user === 'object' && like.user._id));
        });

        likeCount = validLikes.length;

        if (userId && validLikes.length > 0) {
          isLiked = validLikes.some(like => {
            try {
              const likeUserId = typeof like.user === 'string' 
                ? like.user 
                : like.user._id?.toString() || like.user.toString();
              
              return likeUserId === userId;
            } catch (err) {
              console.warn('Error comparing reply like user ID:', err);
              return false;
            }
          });
        }
      }

      return {
        _id: reply._id,
        text: reply.text || '',
        user: reply.user || null,
        createdAt: reply.createdAt || new Date(),
        likeCount: likeCount,
        isLiked: isLiked
      };
    }).filter(reply => reply !== null);


    res.status(200).json({
      success: true,
      replies: formattedReplies,
      totalReplies: replies.length,
      currentPage: pageNum,
      totalPages: Math.ceil(replies.length / limitNum),
      hasMore: skip + limitNum < replies.length
    });

  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch replies',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

const DeleteRepliedComment = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const userId = req.authenticatedUser?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Find post with the specific comment
    const post = await PostModel.findOne({ 'comments._id': commentId });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Find the specific comment
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Find the specific reply
    const reply = comment.replies.id(replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Check if user is the author of the reply
    if (reply.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own replies'
      });
    }

    // Remove the reply
    comment.replies.pull(replyId);
    comment.replyCount = comment.replies.length;

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Reply deleted successfully',
      replyCount: comment.replyCount
    });

  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reply',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

module.exports = {
  AddComment,
  GetComment,
  LikeComment,
  ReplyComment,
  GetRepliedComments,
  DeleteRepliedComment
};