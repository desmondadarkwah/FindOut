import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, Activity, TrendingUp, LogOut, Menu, X,
  Shield, Search, Filter, Trash2, Eye, ChevronLeft, ChevronRight,
  BookOpen, HelpCircle, Lightbulb, Award, Zap
} from 'lucide-react';
import { useAdminContext } from '../Context/AdminContext';
import axiosInstance from '../utils/axiosInstance';

const AdminPosts = () => {
  const { admin, logout } = useAdminContext();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const postTypeIcons = {
    resource: { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    help: { icon: HelpCircle, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    explanation: { icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    challenge: { icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    general: { icon: FileText, color: 'text-gray-400', bg: 'bg-gray-500/20' }
  };

  useEffect(() => {
    if (admin) {
      fetchPosts();
    }
  }, [admin, subjectFilter, typeFilter, currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });

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
    const confirm = window.confirm(
      'Are you sure you want to delete this post? This action cannot be undone.'
    );

    if (!confirm) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstance.delete(`/api/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        fetchPosts();
        alert('Post deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handleLogout = async () => {
    const confirm = window.confirm('Are you sure you want to logout?');
    if (confirm) {
      await logout();
      navigate('/admin-login');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white"
      >
        {showSidebar ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700/50 z-40
        transform transition-transform duration-300 lg:translate-x-0
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold">Admin Panel</h2>
              <p className="text-gray-400 text-xs">FindOut</p>
            </div>
          </div>

          {/* Admin Info */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {admin?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{admin?.name}</p>
                <p className="text-gray-400 text-xs truncate">{admin?.email}</p>
              </div>
            </div>
            {admin?.isSuperAdmin && (
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                  <Shield size={12} />
                  Super Admin
                </span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-colors"
            >
              <Activity size={18} />
              <span className="font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => navigate('/admin-users')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-colors"
            >
              <Users size={18} />
              <span className="font-medium">Users</span>
            </button>

            <button
              onClick={() => navigate('/admin-posts')}
              className="w-full flex items-center gap-3 px-4 py-3 text-white bg-blue-500/20 border border-blue-500/50 rounded-xl transition-colors"
            >
              <FileText size={18} />
              <span className="font-medium">Posts</span>
            </button>

            <button
              onClick={() => navigate('/admin-analytics')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-colors"
            >
              <TrendingUp size={18} />
              <span className="font-medium">Analytics</span>
            </button>
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 mt-6 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Post Management
          </h1>
          <p className="text-gray-400">Moderate and manage user posts</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Post Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            >
              <option value="all">All Post Types</option>
              <option value="resource">📚 Resource</option>
              <option value="help">❓ Help</option>
              <option value="explanation">💡 Explanation</option>
              <option value="challenge">⚡ Challenge</option>
              <option value="general">📝 General</option>
            </select>

            {/* Subject Filter */}
            <input
              type="text"
              placeholder="Filter by subject..."
              value={subjectFilter === 'all' ? '' : subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value || 'all');
                setCurrentPage(1);
              }}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          {posts.map((post) => {
            const typeConfig = postTypeIcons[post.postType] || postTypeIcons.general;
            const Icon = typeConfig.icon;

            return (
              <div
                key={post._id}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    {/* Author & Badges */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        {post.author?.profilePicture ? (
                          <img
                            src={`${import.meta.env.VITE_BACKEND_URL}${post.author.profilePicture}`}
                            alt={post.author.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {post.author?.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm">{post.author?.name}</p>
                        <p className="text-gray-400 text-xs">{post.author?.email}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}>
                          <Icon size={14} />
                          {post.postType}
                        </span>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                          {post.subject}
                        </span>
                      </div>
                    </div>

                    {/* Caption */}
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {post.caption}
                    </p>

                    {/* Image */}
                    {post.image && (
                      <div className="mb-3 rounded-xl overflow-hidden max-w-md">
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}${post.image}`}
                          alt="Post"
                          className="w-full h-auto"
                        />
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <span>👍 {post.helpfulCount || 0} helpful</span>
                      <span>💬 {post.comments?.length || 0} comments</span>
                      <span>📅 {formatDate(post.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {posts.length === 0 && !loading && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 text-center">
            <FileText size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No posts found</h3>
            <p className="text-gray-400">Try adjusting your filters</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-gray-900/50 text-gray-400 rounded-lg hover:bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-gray-900/50 text-gray-400 rounded-lg hover:bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPosts;