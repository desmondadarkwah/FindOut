import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, Activity, TrendingUp, LogOut, Menu, X,
  Shield, BarChart3, PieChart, Calendar, ArrowUp, ArrowDown
} from 'lucide-react';
import { useAdminContext } from '../Context/AdminContext';
import axiosInstance from '../utils/axiosInstance';

const AdminAnalytics = () => {
  const { admin, logout } = useAdminContext();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (admin) {
      fetchStats();
    }
  }, [admin]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await axiosInstance.get('/api/admin/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin-login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirm = window.confirm('Are you sure you want to logout?');
    if (confirm) {
      await logout();
      navigate('/admin-login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
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
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-colors"
            >
              <FileText size={18} />
              <span className="font-medium">Posts</span>
            </button>

            <button
              onClick={() => navigate('/admin-analytics')}
              className="w-full flex items-center gap-3 px-4 py-3 text-white bg-blue-500/20 border border-blue-500/50 rounded-xl transition-colors"
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
            Analytics & Insights
          </h1>
          <p className="text-gray-400">Platform performance and user engagement metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users Growth */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-blue-400" />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                <ArrowUp size={16} />
                {stats?.users?.recentSignups || 0}
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats?.users?.total || 0}
            </h3>
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-xs text-gray-500 mt-2">+{stats?.users?.recentSignups || 0} this week</p>
          </div>

          {/* Engagement Rate */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Activity size={24} className="text-purple-400" />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                <ArrowUp size={16} />
                {stats?.users?.online || 0}
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats?.users?.total > 0 
                ? Math.round((stats?.users?.online / stats?.users?.total) * 100)
                : 0}%
            </h3>
            <p className="text-gray-400 text-sm">Online Rate</p>
            <p className="text-xs text-gray-500 mt-2">{stats?.users?.online || 0} users online now</p>
          </div>

          {/* Content Created */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <FileText size={24} className="text-green-400" />
              </div>
              <div className="flex items-center gap-1 text-blue-400 text-sm font-medium">
                <BarChart3 size={16} />
                Active
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats?.posts?.total || 0}
            </h3>
            <p className="text-gray-400 text-sm">Total Posts</p>
            <p className="text-xs text-gray-500 mt-2">Learning content shared</p>
          </div>

          {/* Community Groups */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-yellow-400" />
              </div>
              <div className="flex items-center gap-1 text-purple-400 text-sm font-medium">
                <TrendingUp size={16} />
                Growing
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats?.groups?.total || 0}
            </h3>
            <p className="text-gray-400 text-sm">Learning Groups</p>
            <p className="text-xs text-gray-500 mt-2">Active communities</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Distribution */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <PieChart size={20} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">User Distribution</h3>
            </div>

            <div className="space-y-4">
              {/* Teachers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Teachers (Ready to Teach)</span>
                  <span className="text-blue-400 font-bold">
                    {stats?.users?.teachers || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-900/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stats?.users?.total > 0 
                        ? (stats?.users?.teachers / stats?.users?.total) * 100 
                        : 0}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.users?.total > 0 
                    ? Math.round((stats?.users?.teachers / stats?.users?.total) * 100)
                    : 0}% of total users
                </p>
              </div>

              {/* Learners */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Learners (Ready to Learn)</span>
                  <span className="text-purple-400 font-bold">
                    {stats?.users?.learners || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-900/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stats?.users?.total > 0 
                        ? (stats?.users?.learners / stats?.users?.total) * 100 
                        : 0}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.users?.total > 0 
                    ? Math.round((stats?.users?.learners / stats?.users?.total) * 100)
                    : 0}% of total users
                </p>
              </div>

              {/* Teacher to Learner Ratio */}
              <div className="mt-6 p-4 bg-gray-900/50 rounded-xl">
                <p className="text-gray-400 text-sm mb-2">Teacher : Learner Ratio</p>
                <p className="text-2xl font-bold text-white">
                  1 : {stats?.users?.teachers > 0 
                    ? (stats?.users?.learners / stats?.users?.teachers).toFixed(1)
                    : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.users?.teachers > 0 && stats?.users?.learners > stats?.users?.teachers
                    ? 'More learners than teachers'
                    : 'Balanced community'}
                </p>
              </div>
            </div>
          </div>

          {/* Post Type Distribution */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 size={20} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Content Distribution</h3>
            </div>

            <div className="space-y-4">
              {stats?.posts?.byType?.map((type) => {
                const icons = {
                  resource: '📚',
                  help: '❓',
                  explanation: '💡',
                  challenge: '⚡',
                  general: '📝'
                };

                const colors = {
                  resource: { bar: 'from-blue-500 to-blue-600', text: 'text-blue-400' },
                  help: { bar: 'from-orange-500 to-orange-600', text: 'text-orange-400' },
                  explanation: { bar: 'from-yellow-500 to-yellow-600', text: 'text-yellow-400' },
                  challenge: { bar: 'from-purple-500 to-purple-600', text: 'text-purple-400' },
                  general: { bar: 'from-gray-500 to-gray-600', text: 'text-gray-400' }
                };

                const config = colors[type._id] || colors.general;

                return (
                  <div key={type._id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm capitalize">
                        {icons[type._id] || '📝'} {type._id}
                      </span>
                      <span className={`font-bold ${config.text}`}>
                        {type.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-900/50 rounded-full h-3 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${config.bar} h-full rounded-full transition-all duration-500`}
                        style={{
                          width: `${stats?.posts?.total > 0 
                            ? (type.count / stats?.posts?.total) * 100 
                            : 0}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats?.posts?.total > 0 
                        ? Math.round((type.count / stats?.posts?.total) * 100)
                        : 0}% of total posts
                    </p>
                  </div>
                );
              })}

              {(!stats?.posts?.byType || stats?.posts?.byType.length === 0) && (
                <p className="text-gray-400 text-center py-8">No post data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Activity size={20} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Platform Health</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-900/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Average Reputation</span>
                <span className="text-yellow-400">⭐</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {stats?.topContributors?.length > 0
                  ? (stats.topContributors.reduce((sum, u) => sum + (u.reputation || 0), 0) / stats.topContributors.length).toFixed(1)
                  : 0}
              </p>
            </div>

            <div className="p-4 bg-gray-900/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Posts per User</span>
                <span className="text-blue-400">📊</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {stats?.users?.total > 0
                  ? (stats.posts.total / stats.users.total).toFixed(1)
                  : 0}
              </p>
            </div>

            <div className="p-4 bg-gray-900/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Active Subjects</span>
                <span className="text-purple-400">📚</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {stats?.topSubjects?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;