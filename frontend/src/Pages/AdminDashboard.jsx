import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, Users as GroupIcon, Activity,
  TrendingUp, Award, BookOpen, LogOut, Menu, X,
  Shield
} from 'lucide-react';
import { useAdminContext } from '../Context/AdminContext';
import axiosInstance from '../utils/axiosInstance';

const AdminDashboard = () => {
  const { admin, logout } = useAdminContext();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  // ✅ Only redirect if no admin AND no token
  useEffect(() => {
    if (admin) return; // Admin already set from login

    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
    }
  }, [admin, navigate]);

  // ✅ Fetch stasts when admin is set
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');

        if (!token) return;

        const response = await axiosInstance.get('/api/admin/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          console.log('📊 Stats received:', response.data.stats);
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);

        // If unauthorized, clear token and redirect
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin-login');
        }
      } finally {
        setStatsLoading(false);
      }
    };

    if (admin) {
      fetchStats();
    }
  }, [admin, navigate]);

  const handleLogout = async () => {
    const confirm = window.confirm('Are you sure you want to logout?');
    if (confirm) {
      await logout();
      navigate('/admin-login');
    }
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
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
              className="w-full flex items-center gap-3 px-4 py-3 text-white bg-blue-500/20 border border-blue-500/50 rounded-xl transition-colors"
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
            Dashboard Overview
          </h1>
          <p className="text-gray-400">Welcome back, {admin?.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-blue-400" />
              </div>
              <span className="text-green-400 text-sm font-medium">
                +{stats?.users?.recentSignups || 0} this week
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats?.users?.total || 0}
            </h3>
            <p className="text-gray-400 text-sm">Total Users</p>
            <div className="mt-4 flex items-center gap-4 text-xs">
              <span className="text-blue-400">
                {stats?.users?.teachers || 0} Teachers
              </span>
              <span className="text-purple-400">
                {stats?.users?.learners || 0} Learners
              </span>
            </div>
          </div>

          {/* Total Posts */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <FileText size={24} className="text-purple-400" />
              </div>
              <span className="text-xs text-gray-400">All time</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats?.posts?.total || 0}
            </h3>
            <p className="text-gray-400 text-sm">Total Posts</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <span>📚 {stats?.posts?.byType?.find(t => t._id === 'resource')?.count || 0}</span>
              <span>❓ {stats?.posts?.byType?.find(t => t._id === 'help')?.count || 0}</span>
              <span>💡 {stats?.posts?.byType?.find(t => t._id === 'explanation')?.count || 0}</span>
            </div>
          </div>

          {/* Total Groups */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <GroupIcon size={24} className="text-green-400" />
              </div>
              <span className="text-xs text-gray-400">Active</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats?.groups?.total || 0}
            </h3>
            <p className="text-gray-400 text-sm">Learning Groups</p>
          </div>

          {/* Online Users */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Activity size={24} className="text-yellow-400" />
              </div>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats?.users?.online || 0}
            </h3>
            <p className="text-gray-400 text-sm">Users Online</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Subjects */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <BookOpen size={20} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Popular Subjects</h3>
            </div>

            <div className="space-y-3">
              {stats?.topSubjects?.slice(0, 5).map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📚'}
                    </span>
                    <span className="text-white font-medium">{subject._id}</span>
                  </div>
                  <span className="text-blue-400 font-bold">{subject.count} posts</span>
                </div>
              )) || (
                  <p className="text-gray-400 text-center py-8">No subjects yet</p>
                )}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Award size={20} className="text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Top Contributors</h3>
            </div>

            <div className="space-y-3">
              {stats?.topContributors?.slice(0, 5).map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      {user.profilePicture ? (
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}${user.profilePicture}`}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{user.name}</p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-yellow-400 font-bold">⭐ {user.reputation}</span>
                </div>
              )) || (
                  <p className="text-gray-400 text-center py-8">No contributors yet</p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;