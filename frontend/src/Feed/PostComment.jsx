import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Heart, Reply, Smile, Send, User, Clock, X, ChevronDown, ChevronUp } from 'lucide-react';
import { usePostContext } from '../Context/PostContext';
import { CommentContext } from '../Context/CommentContext';

const PostComment = ({ postId, isOpen, onClose }) => {
  const {
    comments,
    loading,
    error,
    fetchComments,
    addComment,
    likeComment,
    clearComments
  } = usePostContext();

  const {
    repliesError,
    addReply,
    fetchReplies,
    deleteReply,
    getRepliesForComment,
    areRepliesLoaded,
    isLoadingReplies,
    clearAllReplies
  } = useContext(CommentContext);

  const [newComment, setNewComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const quickEmojis = ['😀', '😂', '😍', '😭', '👍', '❤️', '🔥', '💯', '🙌', '👏'];

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && postId) {
      fetchComments(postId);
    }
    
    if (!isOpen) {
      clearComments();
      clearAllReplies(); // Clear all replies when modal closes
      setExpandedReplies(new Set());
      setReplyingTo(null);
      setReplyText('');
      setNewComment('');
      setShowEmojiPicker(false);
    }
  }, [isOpen, postId, fetchComments, clearComments, clearAllReplies]);

  useEffect(() => {
    if (comments.length > 0) {
      const commentsWithReplies = comments.filter(comment => 
        comment.replyCount > 0 && expandedReplies.has(comment._id)
      );
      
      commentsWithReplies.forEach(comment => {
        if (!areRepliesLoaded(comment._id)) {
          fetchReplies(comment._id).catch(error => {
            console.error('Failed to auto-fetch replies:', error);
          });
        }
      });
    }
  }, [comments, expandedReplies, areRepliesLoaded, fetchReplies]);

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await addComment(postId, newComment.trim());
      setNewComment('');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [newComment, isSubmitting, addComment, postId]);

  const handleLikeComment = useCallback(async (commentId) => {
    try {
      await likeComment(commentId);
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  }, [likeComment]);

  const handleAddReply = useCallback(async (commentId) => {
    if (!replyText.trim() || isSubmittingReply) return;

    try {
      setIsSubmittingReply(true);
      await addReply(commentId, replyText.trim());
      setReplyText('');
      setReplyingTo(null);
      
      // Auto-expand replies after adding a new reply
      setExpandedReplies(prev => new Set([...prev, commentId]));
    } catch (error) {
      console.error('Failed to add reply:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  }, [replyText, isSubmittingReply, addReply]);

  const handleToggleReplies = useCallback(async (commentId) => {
    const isExpanded = expandedReplies.has(commentId);
    
    if (isExpanded) {
      // Collapse replies
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      // Expand replies - always fetch fresh data
      try {
        await fetchReplies(commentId);
        setExpandedReplies(prev => new Set([...prev, commentId]));
      } catch (error) {
        console.error('Failed to fetch replies:', error);
        return;
      }
    }
  }, [expandedReplies, fetchReplies]);

  const formatTimeAgo = useCallback((date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

    return commentDate.toLocaleDateString();
  }, []);

  const addEmoji = useCallback((emoji) => {
    if (replyingTo) {
      setReplyText(prev => prev + emoji);
    } else {
      setNewComment(prev => prev + emoji);
    }
    setShowEmojiPicker(false);
  }, [replyingTo]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (replyingTo) {
        handleAddReply(replyingTo);
      } else {
        handleAddComment();
      }
    }
  }, [replyingTo, handleAddReply, handleAddComment]);

  const handleReplyToggle = useCallback((commentId) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setReplyText('');
  }, [replyingTo]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">Comments</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close comments"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Messages */}
        {(error || repliesError) && (
          <div className="px-4 py-2 bg-red-900/20 border-b border-red-700/30 flex-shrink-0">
            <p className="text-red-400 text-sm">{error || repliesError}</p>
          </div>
        )}

        {/* Comments List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-400">Loading comments...</p>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="space-y-3">
                  {/* Main Comment */}
                  <div className="flex space-x-3">
                    {/* User Profile Picture */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      {comment.user?.profilePicture ? (
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}${comment.user.profilePicture}`}
                          alt={comment.user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User size={16} className="text-white" />
                      )}
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1">
                      <div className="bg-gray-700/50 rounded-lg px-3 py-2">
                        <p className="text-sm font-medium text-white mb-1">
                          {comment.user?.name || 'Anonymous'}
                        </p>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {comment.text}
                        </p>
                      </div>

                      {/* Comment Actions */}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center">
                          <Clock size={12} className="mr-1" />
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                        <button
                          onClick={() => handleLikeComment(comment._id)}
                          className={`flex items-center space-x-1 hover:text-red-400 transition-colors ${
                            comment.isLiked ? 'text-red-400' : ''
                          }`}
                          aria-label={`${comment.isLiked ? 'Unlike' : 'Like'} comment`}
                        >
                          <Heart size={12} className={comment.isLiked ? 'fill-current' : ''} />
                          <span>{comment.likeCount || 0}</span>
                        </button>
                        <button 
                          onClick={() => handleReplyToggle(comment._id)}
                          className="hover:text-blue-400 transition-colors flex items-center space-x-1"
                          aria-label="Reply to comment"
                        >
                          <Reply size={12} />
                          <span>Reply</span>
                        </button>
                        
                        {/* Toggle Replies Button */}
                        {comment.replyCount > 0 && (
                          <button
                            onClick={() => handleToggleReplies(comment._id)}
                            className="hover:text-blue-400 transition-colors flex items-center space-x-1"
                            disabled={isLoadingReplies(comment._id)}
                            aria-label={`${expandedReplies.has(comment._id) ? 'Hide' : 'Show'} replies`}
                          >
                            {expandedReplies.has(comment._id) ? (
                              <ChevronUp size={12} />
                            ) : (
                              <ChevronDown size={12} />
                            )}
                            <span>
                              {isLoadingReplies(comment._id) ? 'Loading...' : `${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reply Input */}
                  {replyingTo === comment._id && (
                    <div className="ml-11 space-y-2">
                      <div className="flex items-end space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                          <User size={12} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Reply to ${comment.user?.name || 'Anonymous'}...`}
                            disabled={isSubmittingReply}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-sm"
                            rows="2"
                            aria-label={`Reply to ${comment.user?.name || 'Anonymous'}`}
                          />
                        </div>
                        <button
                          onClick={() => handleAddReply(comment._id)}
                          disabled={!replyText.trim() || isSubmittingReply}
                          className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                            replyText.trim() && !isSubmittingReply
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                          aria-label="Send reply"
                        >
                          {isSubmittingReply ? (
                            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Send size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Replies List */}
                  {expandedReplies.has(comment._id) && (
                    <div className="ml-11 space-y-3">
                      {isLoadingReplies(comment._id) ? (
                        <div className="text-center py-4">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-gray-400 text-xs">Loading replies...</p>
                        </div>
                      ) : (
                        getRepliesForComment(comment._id).map((reply) => (
                          <div key={reply._id} className="flex space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                              {reply.user?.profilePicture ? (
                                <img
                                  src={`${import.meta.env.VITE_BACKEND_URL}${reply.user.profilePicture}`}
                                  alt={reply.user.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <User size={12} className="text-white" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="bg-gray-700/30 rounded-lg px-3 py-2">
                                <p className="text-xs font-medium text-white mb-1">
                                  {reply.user?.name || 'Anonymous'}
                                </p>
                                <p className="text-gray-300 text-xs leading-relaxed">
                                  {reply.text}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Clock size={10} className="mr-1" />
                                  {formatTimeAgo(reply.createdAt)}
                                </span>
                                <button 
                                  className="hover:text-red-400 transition-colors flex items-center space-x-1"
                                  aria-label="Like reply"
                                >
                                  <Heart size={10} />
                                  <span>{reply.likeCount || 0}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      
                      {/* Show message if no replies loaded */}
                      {!isLoadingReplies(comment._id) && getRepliesForComment(comment._id).length === 0 && (
                        <div className="text-center py-2">
                          <p className="text-gray-500 text-xs">No replies found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-2">No comments yet</p>
              <p className="text-gray-500 text-sm">Be the first to comment!</p>
            </div>
          )}
        </div>

        {/* Add Comment Section - Fixed at bottom */}
        <div className="border-t border-gray-700 p-4 flex-shrink-0">
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="mb-3 p-3 bg-gray-700/50 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {quickEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => addEmoji(emoji)}
                    className="text-lg hover:bg-gray-600 rounded p-1 transition-colors"
                    aria-label={`Add ${emoji} emoji`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Comment Input */}
          <div className="flex items-end space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-white" />
            </div>
            
            <div className="flex-1 relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a comment..."
                disabled={isSubmitting}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                rows="2"
                aria-label="Add a comment"
              />
              
              {/* Emoji Button */}
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={isSubmitting}
                className="absolute right-2 top-2 text-gray-400 hover:text-yellow-400 transition-colors disabled:opacity-50"
                aria-label="Toggle emoji picker"
              >
                <Smile size={16} />
              </button>
            </div>

            {/* Post Button */}
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isSubmitting}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                newComment.trim() && !isSubmitting
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Post comment"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostComment;