import React, { useContext, useState } from 'react';
import { Flag, Link, Trash2, X, Check, AlertCircle } from 'lucide-react';
import { PostContext } from '../Context/PostContext';
import { ChatContext } from '../Context/ChatContext';
import { copyToClipboard, postUrl } from '../utils/share';

const PostSettings = ({ postId, authorId, onClose }) => {
  const { deletePost } = useContext(PostContext);
  const { userId } = useContext(ChatContext);

  // Either side may be an ObjectId or a string depending on where it came
  // from, so compare as strings.
  const isOwnPost = userId?.toString() === authorId?.toString();

  const [copyResult, setCopyResult] = useState(null);

  /**
   * The menu stays open briefly after copying so the confirmation is actually
   * seen. Closing immediately would leave the user unsure anything happened,
   * which is how this looked when the copy was failing silently.
   */
  const handleCopyLink = async () => {
    const ok = await copyToClipboard(postUrl(postId));
    setCopyResult(ok ? 'copied' : 'failed');
    if (ok) setTimeout(onClose, 900);
  };

  const handleReport = () => {
    console.log('Report post:', postId);
    alert('Post reported. Thank you for keeping our community safe!');
    onClose();
  };

  const handleDeletePost = async () => {
    try {
      const confirmation = window.confirm(
        'Are you sure you want to delete this post? This action cannot be undone.'
      );

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

  const copyLabel = {
    copied: 'Link copied',
    failed: 'Could not copy — select the link from the address bar',
  }[copyResult] ?? 'Copy link';

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
          className={`w-full px-4 py-3 text-left transition-colors flex items-center space-x-3 ${
            copyResult === 'copied'
              ? 'text-green-400'
              : copyResult === 'failed'
                ? 'text-amber-400'
                : 'text-gray-300 hover:bg-gray-700/50'
          }`}
        >
          {copyResult === 'copied'
            ? <Check size={16} className="shrink-0" />
            : copyResult === 'failed'
              ? <AlertCircle size={16} className="shrink-0" />
              : <Link size={16} className="shrink-0" />}
          <span className={copyResult === 'failed' ? 'text-xs leading-snug' : ''}>
            {copyLabel}
          </span>
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
