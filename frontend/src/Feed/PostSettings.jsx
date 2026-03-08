import React, { useContext } from 'react';
import { Flag, Link, Trash2, X } from 'lucide-react';
import { PostContext } from '../Context/PostContext';
import { ChatContext } from '../Context/ChatContext';

const PostSettings = ({ postId, authorId, onClose }) => {
  const { deletePost } = useContext(PostContext);
  const { userId } = useContext(ChatContext);

  // ✅ FIX: Convert both to strings for comparison
  const isOwnPost = userId?.toString() === authorId?.toString();

  console.log('🔍 Debug PostSettings:', {
    userId,
    authorId,
    isOwnPost
  });

  const handleReport = () => {
    console.log('Report post:', postId);
    alert('Post reported. Thank you for keeping our community safe!');
    onClose();
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      alert('Link copied to clipboard!');
      onClose();
    }).catch(err => {
      console.error('Failed to copy link:', err);
      alert('Failed to copy link');
    });
  };

  const handleDeletePost = async () => {
    try {
      const confirmation = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
      
      if (confirmation) {
        await deletePost(postId);
        alert('Post deleted successfully');
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert(error.message || 'Failed to delete post. Please try again.');
    }
  };

  return (
    <div className="w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl overflow-hidden">
      <div className="py-2">
        {!isOwnPost && (
          <button
            onClick={handleReport}
            className="w-full px-4 py-3 text-left text-red-400 hover:bg-gray-700/50 transition-colors flex items-center space-x-3"
          >
            <Flag size={16} />
            <span>Report</span>
          </button>
        )}
        
        <button
          onClick={handleCopyLink}
          className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-700/50 transition-colors flex items-center space-x-3"
        >
          <Link size={16} />
          <span>Copy link</span>
        </button>
        
        {isOwnPost && (
          <button
            onClick={handleDeletePost}
            className="w-full px-4 py-3 text-left text-red-400 hover:bg-gray-700/50 transition-colors flex items-center space-x-3"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        )}
        
        <div className="border-t border-gray-600 mt-2 pt-2">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 text-left text-gray-400 hover:bg-gray-700/50 transition-colors flex items-center space-x-3"
          >
            <X size={16} />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostSettings;