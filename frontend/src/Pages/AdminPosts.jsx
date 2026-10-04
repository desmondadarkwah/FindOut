import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, Activity, TrendingUp, LogOut, Menu, X, Shield, Flag, Trash2, ChevronLeft, ChevronRight, BookOpen, HelpCircle, Lightbulb, Zap, ThumbsUp, MessageCircle
} from 'lucide-react';
import { useAdminContext } from '../Context/AdminContext';
import axiosInstance from '../utils/axiosInstance';
import FindOutLoader from '../Loader/FindOutLoader';

const ACTIVE_KEY = 'posts';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: Activity, to: '/admin-dashboard' },
  { key: 'users', label: 'Users', icon: Users, to: '/admin-users' },
  { key: 'posts', label: 'Posts', icon: FileText, to: '/admin-posts' },
  { key: 'reports', label: 'Reports', icon: Flag, to: '/admin-reports' },
  { key: 'analytics', label: 'Analytics', icon: TrendingUp, to: '/admin-analytics' },
];

const postTypeIcons = {
  resource: BookOpen,
  help: HelpCircle,
  explanation: Lightbulb,
  challenge: Zap,
  general: FileText,
};

const AdminPosts = () => {
  const { admin, logout } = useAdminContext();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [toastState, setToastState] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (message, type = 'success', persistent = false) => {
    clearTimeout(toastTimer.current);
    setToastState({ message, type, persistent });
    if (!persistent) toastTimer.current = setTimeout(() => setToastState(null), 3000);
  };
  const toast = showToast;
  const confirm = (message) => Promise.resolve(window.confirm(message));

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (admin) fetchPosts();
  }, [admin, subjectFilter, typeFilter, currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({ page: currentPage, limit: 20 });
      if (subjectFilter !== 'all') params.append('subject', subjectFilter);
      if (typeFilter !== 'all') params.append('postType', typeFilter);

      const response = await axiosInstance.get(`/api/admin/posts?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setPosts(response.data.posts);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin-login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    const ok = await confirm('Delete this post? This action cannot be undone.');
    if (!ok) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstance.delete(`/api/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) { fetchPosts(); toast('Post deleted successfully'); }
    } catch (error) {
      toast('Failed to delete post', 'error');
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading && posts.length === 0) {
    return <FindOutLoader />;
  }

  const inputStyle = { background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' };


  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      await logout();
      navigate('/admin-login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#0f0f1a] border border-[rgba(255,255,255,0.07)] rounded-lg text-[rgba(255,255,255,0.4)]"
      >
        {showSidebar ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-[#0f0f1a] border-r border-[rgba(255,255,255,0.07)] z-40
        transform transition-transform duration-200 lg:translate-x-0
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-5 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8 px-1">
            <div className="w-8 h-8 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.07)] rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-[rgba(255,255,255,0.4)]" />
            </div>
            <div>
              <h2 className="text-[#f1f5f9] font-semibold text-sm leading-tight">FindOut</h2>
              <p className="text-[rgba(255,255,255,0.2)] text-xs leading-tight">Admin</p>
            </div>
          </div>

          {/* Admin Info */}
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-xl p-3.5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.07)] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#f1f5f9] font-semibold text-xs">
                  {admin?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#f1f5f9] font-medium text-sm truncate">{admin?.name}</p>
                <p className="text-[rgba(255,255,255,0.2)] text-xs truncate">{admin?.email}</p>
              </div>
            </div>
            {admin?.isSuperAdmin && (
              <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.07)]">
                <span className="inline-flex items-center gap-1.5 text-xs text-[rgba(251,191,36,0.9)]">
                  <Shield size={12} />
                  Super Admin
                </span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-0.5 flex-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.key === ACTIVE_KEY;
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.to)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-l-2 ${
                    active
                      ? 'text-[#f1f5f9] bg-[rgba(255,255,255,0.05)] border-[#6366f1]'
                      : 'text-[rgba(255,255,255,0.4)] hover:text-[#f1f5f9] hover:bg-[rgba(255,255,255,0.03)] border-transparent'
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-[rgba(255,255,255,0.2)] hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 px-4 py-6 lg:px-10 lg:py-10">
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
            value={subjectFilter === 'all' ? '' : subjectFilter}
            onChange={(e) => { setSubjectFilter(e.target.value || 'all'); setCurrentPage(1); }}
            className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Posts */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {posts.map((post) => {
          const Icon = postTypeIcons[post.postType] || FileText;
          return (
            <div key={post._id} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      {post.author?.profilePicture ? (
                        <img src={`${import.meta.env.VITE_BACKEND_URL}${post.author.profilePicture}`} alt={post.author.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-semibold text-xs" style={{ color: '#f1f5f9' }}>{post.author?.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm" style={{ color: '#f1f5f9' }}>{post.author?.name}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{post.author?.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                        <Icon size={13} />
                        {post.postType}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                        {post.subject}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm mb-3 line-clamp-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{post.caption}</p>

                  {post.image && (
                    <div className="mb-3 rounded-lg overflow-hidden max-w-md">
                      <img src={`${import.meta.env.VITE_BACKEND_URL}${post.image}`} alt="Post" className="w-full h-auto" />
                    </div>
                  )}

                  <div className="flex items-center gap-5 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <span className="inline-flex items-center gap-1.5"><ThumbsUp size={13} />{post.helpfulCount || 0} helpful</span>
                    <span className="inline-flex items-center gap-1.5"><MessageCircle size={13} />{post.comments?.length || 0} comments</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>

                <button onClick={() => handleDeletePost(post._id)} className="p-2 rounded-lg flex-shrink-0" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
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
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg disabled:opacity-40" style={{ background: '#0a0a0f', color: 'rgba(255,255,255,0.3)' }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg disabled:opacity-40" style={{ background: '#0a0a0f', color: 'rgba(255,255,255,0.3)' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
      </div>
      {toastState && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium"
          style={{
            background: toastState.type === 'error' ? '#dc2626' : '#0f0f1a',
            border: toastState.type === 'error' ? 'none' : '1px solid rgba(99,102,241,0.3)',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          <span>{toastState.message}</span>
          {toastState.persistent && (
            <button onClick={() => setToastState(null)} className="text-xs underline" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPosts;