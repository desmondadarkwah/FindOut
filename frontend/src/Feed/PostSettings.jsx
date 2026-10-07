import React, { useContext, useState } from 'react';
import { Flag, Link, Trash2, X } from 'lucide-react';
import { PostContext } from '../Context/PostContext';
import { ChatContext } from '../Context/ChatContext';
import ReportModal from '../components/ReportModal';
import { useToast } from '../Context/ToastContext';

const PostSettings = ({ postId, authorId, onClose }) => {
  const { deletePost } = useContext(PostContext);
  const { userId } = useContext(ChatContext);
  const { toast, confirm } = useToast();
  const [showReport, setShowReport] = useState(false);

  // Both ids must exist, so an unloaded userId and a missing authorId
  // (undefined === undefined) can never count as "your own post".
  const isOwnPost = !!userId && !!authorId && userId.toString() === authorId.toString();

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      toast.success('Link copied to clipboard!', 'Copied');
      onClose();
    }).catch(err => {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link');
    });
  };

  const handleDeletePost = async () => {
    try {
      const confirmed = await confirm({
        title: 'Delete Post',
        message: 'Are you sure you want to delete this post? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmStyle: 'danger'
      });

      if (!confirmed) return;

      await deletePost(postId);
      toast.success('Post deleted successfully', 'Post Deleted');
      onClose();
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error(error.message || 'Failed to delete post. Please try again.');
    }
  };

  return (
    <div className="w-56 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-2xl overflow-hidden">
      <div className="py-2">
        {!isOwnPost && (
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
          // Also close the dropdown once the report modal is closed,
          // so the menu doesn't stay open behind it.
          onClose={() => { setShowReport(false); onClose(); }}
        />
      )}
    </div>
  );
};

export default PostSettings;