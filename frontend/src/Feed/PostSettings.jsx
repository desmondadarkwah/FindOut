import React, { useContext, useState } from 'react';
import { Flag, Link, Trash2, X } from 'lucide-react';
import { PostContext } from '../Context/PostContext';
import { ChatContext } from '../Context/ChatContext';
import ReportModal from '../components/ReportModal';

const PostSettings = ({ postId, authorId, onClose }) => {
  const { deletePost } = useContext(PostContext);
  const { userId } = useContext(ChatContext);
  const [showReport, setShowReport] = useState(false);

  // ✅ FIX: Convert both to strings for comparison
  const isOwnPost = userId?.toString() === authorId?.toString();

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
    // ✅ Design system: dropdown menus use bg-[var(--bg-secondary)] (solid panel) rather
    // than bg-surface (translucent card) — this sits on top of page content,
    // not directly on the page background, so it needs to read as opaque.
    <div className="w-56 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-2xl overflow-hidden">
      <div className="py-2">
        {!isOwnPost && (
          // ✅ Report → warning (amber), not error — per the color system,
          // warning covers "pending, report"; error is reserved for
          // destructive actions (delete, block).
          <button
            onClick={() => setShowReport(true)}
            className="w-full px-4 py-3 text-left text-[#eab308] hover:bg-[var(--bg-card-hover)] transition-colors flex items-center space-x-3"
          >
            <Flag size={16} />
            <span>Report</span>
          </button>
        )}

        <button
          onClick={handleCopyLink}
          className="w-full px-4 py-3 text-left text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors flex items-center space-x-3"
        >
          <Link size={16} />
          <span>Copy link</span>
        </button>

        {isOwnPost && (
          <button
            onClick={handleDeletePost}
            className="w-full px-4 py-3 text-left text-[#ef4444] hover:bg-[var(--bg-card-hover)] transition-colors flex items-center space-x-3"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        )}

        <div className="border-t border-[var(--border)] mt-2 pt-2">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 text-left text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] transition-colors flex items-center space-x-3"
          >
            <X size={16} />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {showReport && (
        <ReportModal
          type="post"
          id={postId}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};

export default PostSettings;