import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Trash2, ChevronLeft, ChevronRight, BookOpen, HelpCircle, Lightbulb, Zap, ThumbsUp, MessageCircle
} from 'lucide-react';
import { useAdminContext } from '../Context/AdminContext';
import axiosInstance from '../utils/axiosInstance';
import FindOutLoader from '../Loader/FindOutLoader';
import { useAdminUI, useDebouncedValue, resolveImage } from './AdminLayout';

const postTypeIcons = {
  resource: BookOpen,
  help: HelpCircle,
  explanation: Lightbulb,
  challenge: Zap,
  general: FileText,
};

const AdminPosts = () => {
  const { admin } = useAdminContext();
  const navigate = useNavigate();
  const { toast, confirm } = useAdminUI();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Full-page loader only for the very first load (see AdminUsers for why)
  const [initialLoad, setInitialLoad] = useState(true);
  const [subjectInput, setSubjectInput] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Wait until you stop typing before asking the server, and ignore slow
  // older responses.
  const subjectQuery = useDebouncedValue(subjectInput.trim(), 400);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (admin) fetchPosts();
  }, [admin, subjectQuery, typeFilter, currentPage]);

  const fetchPosts = async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({ page: currentPage, limit: 20 });
      if (subjectQuery) params.append('subject', subjectQuery);
      if (typeFilter !== 'all') params.append('postType', typeFilter);

      const response = await axiosInstance.get(`/api/admin/posts?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (requestId !== requestIdRef.current) return;
      if (response.data.success) {
        setPosts(response.data.posts);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin-login');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  };

  const handleDeletePost = async (postId) => {
    const ok = await confirm('Delete this post? This action cannot be undone.', {
      title: 'Delete Post',
      confirmText: 'Delete',
    });
    if (!ok) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstance.delete(`/api/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        // go back a page if that was the last post on this one
        if (posts.length === 1 && currentPage > 1) setCurrentPage(p => p - 1);
        else fetchPosts();
        toast('Post deleted successfully');
      }
    } catch (error) {
      toast('Failed to delete post', 'error');
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (initialLoad && loading) {
    return <FindOutLoader />;
  }

  const inputStyle = { background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: '#f1f5f9' }}>Post Management</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Moderate and manage user posts</p>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
            style={inputStyle}
          >
            <option value="all">All Post Types</option>
            <option value="resource">Resource</option>
            <option value="help">Help</option>
            <option value="explanation">Explanation</option>
            <option value="challenge">Challenge</option>
            <option value="general">General</option>
          </select>
          <input
            type="text"
            placeholder="Filter by subject..."
            value={subjectInput}
            onChange={(e) => { setSubjectInput(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Posts (dim slightly while new results load) */}
      <div className="grid grid-cols-1 gap-4 mb-6 transition-opacity" style={{ opacity: loading ? 0.6 : 1 }}>
        {posts.map((post) => {
          const Icon = postTypeIcons[post.postType] || FileText;
          return (
            <div key={post._id} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      {post.author?.profilePicture ? (
                        <img src={resolveImage(post.author.profilePicture)} alt={post.author.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-semibold text-xs" style={{ color: '#f1f5f9' }}>{post.author?.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm" style={{ color: '#f1f5f9' }}>{post.author?.name}</p>
                      <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.2)' }}>{post.author?.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                        <Icon size={13} />
                        {post.postType}
                      </span>
                      {post.subject && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                          {post.subject}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm mb-3 line-clamp-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{post.caption}</p>

                  {post.image && (
                    <div className="mb-3 rounded-lg overflow-hidden max-w-md">
                      <img
                        src={resolveImage(post.image)}
                        alt="Post"
                        className="w-full h-auto"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-5 text-sm flex-wrap" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <span className="inline-flex items-center gap-1.5"><ThumbsUp size={13} />{post.helpfulCount || 0} helpful</span>
                    <span className="inline-flex items-center gap-1.5"><MessageCircle size={13} />{post.comments?.length || 0} comments</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeletePost(post._id)}
                  aria-label="Delete post"
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {posts.length === 0 && !loading && (
        <div className="rounded-xl p-12 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <FileText size={40} color="rgba(255,255,255,0.15)" className="mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#f1f5f9' }}>No posts found</h3>
          <p style={{ color: 'rgba(255,255,255,0.3)' }}>Try adjusting your filters</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Page {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} aria-label="Previous page" className="p-2 rounded-lg disabled:opacity-40" style={{ background: '#0a0a0f', color: 'rgba(255,255,255,0.3)' }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} aria-label="Next page" className="p-2 rounded-lg disabled:opacity-40" style={{ background: '#0a0a0f', color: 'rgba(255,255,255,0.3)' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPosts;