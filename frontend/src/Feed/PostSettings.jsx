import React, { useContext } from 'react';
import { Flag, Share, Link, Trash2, UserCheck, X } from 'lucide-react';
import { PostContext } from '../Context/PostContext';

const PostSettings = ({ postId, authorId, onClose }) => {
  const { deletePost } = useContext(PostContext);

  const handleReport = () => {
    console.log('Report post:', postId);
    // Add your report logic here
    onClose();
  };

  const handleShareTo = () => {
    console.log('Share post:', postId);
    onClose();
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      console.log('Link copied to clipboard');
    });
    onClose();
  };

  const handleDeletePost = async () => {
    try {
      const confirmation = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
      
      if (confirmation) {
        await deletePost(postId);
        console.log('Post deleted successfully');
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleAboutAccount = () => {
    console.log('About account:', authorId);
    // Add navigation to user profile logic here
    onClose();
  };

  return (
    <div className="w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl overflow-hidden">
      <div className="py-2">
        <button
          onClick={handleReport}
          className="w-full px-4 py-3 text-left text-red-400 hover:bg-gray-700/50 transition-colors flex items-center space-x-3"
        >
          <Flag size={16} />
          <span>Report</span>
        </button>
      
        <button
          onClick={handleShareTo}
          className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-700/50 transition-colors flex items-center space-x-3"
        >
          <Share size={16} />
          <span>Share to...</span>
        </button>
        
        <button
          onClick={handleCopyLink}
          className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-700/50 transition-colors flex items-center space-x-3"
        >
          <Link size={16} />
          <span>Copy link</span>
        </button>
        
        <button
          onClick={handleDeletePost}
          className="w-full px-4 py-3 text-left text-red-400 hover:bg-gray-700/50 transition-colors flex items-center space-x-3"
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
        
        <button
          onClick={handleAboutAccount}
          className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-700/50 transition-colors flex items-center space-x-3"
        >
          <UserCheck size={16} />
          <span>About this account</span>
        </button>
        
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