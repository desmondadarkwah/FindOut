import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, Activity, TrendingUp, LogOut, Menu, X,
  Shield, Search, Filter, CheckCircle, XCircle, Trash2,
  UserPlus, Eye, MoreVertical, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAdminContext } from '../Context/AdminContext';
import axiosInstance from '../utils/axiosInstance';
import FindOutLoader from '../Loader/FindOutLoader';

const AdminUsers = () => {
  const { admin, logout } = useAdminContext();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);

  useEffect(() => {
    if (admin) {
      fetchUsers();
    }
  }, [admin, searchQuery, statusFilter, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });

      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await axiosInstance.get(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin-login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstance.patch(
        `/api/admin/users/${userId}/verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        fetchUsers();
        alert('User verified successfully!');
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      alert('Failed to verify user');
    }
  };

  const handleUnverifyUser = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstance.patch(
        `/api/admin/users/${userId}/unverify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        fetchUsers();
        alert('User verification removed!');
      }
    } catch (error) {
      console.error('Error unverifying user:', error);
      alert('Failed to unverify user');
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirm = window.confirm(
      'Are you sure you want to delete this user? This will also delete all their posts and remove them from groups.'
    );

    if (!confirm) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstance.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        fetchUsers();
        alert('User deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    const confirm = window.confirm(
      'Are you sure you want to promote this user to admin? They will receive admin access.'
    );

    if (!confirm) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstance.post(
        `/api/admin/users/${userId}/promote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(
          `User promoted to admin!\n\nTemporary Password: ${response.data.tempPassword}\n\nPlease share this with the new admin.`
        );
        fetchUsers();
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      alert(error.response?.data?.message || 'Failed to promote user');
    }
  };

  const handleLogout = async () => {
    const confirm = window.confirm('Are you sure you want to logout?');
    if (confirm) {
      await logout();
      navigate('/admin-login');
    }
  };

  if (loading && users.length === 0) {
    return (
      <FindOutLoader />
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
              className="w-full flex items-center gap-3 px-4 py-3 text-white bg-blue-500/20 border border-blue-500/50 rounded-xl transition-colors"
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
            User Management
          </h1>
          <p className="text-gray-400">Manage and moderate platform users</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600/50 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            >
              <option value="all">All Status</option>
              <option value="Ready To Teach">Teachers</option>
              <option value="Ready To Learn">Learners</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-700/50">
                <tr>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">User</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Status</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Reputation</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Verified</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Online</th>
                  <th className="text-right p-4 text-gray-400 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-700/30 hover:bg-gray-900/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
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
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Ready To Teach'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-purple-500/20 text-purple-400'
                        }`}>
                        {user.status === 'Ready To Teach' ? '👨‍🏫 Teacher' : '📚 Learner'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-yellow-400 font-bold">⭐ {user.reputation || 0}</span>
                    </td>
                    <td className="p-4">
                      {user.isVerified ? (
                        <CheckCircle size={20} className="text-green-400" />
                      ) : (
                        <XCircle size={20} className="text-gray-600" />
                      )}
                    </td>
                    <td className="p-4">
                      {user.isOnline ? (
                        <span className="flex items-center gap-2 text-green-400 text-sm">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          Online
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">Offline</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {!user.isVerified ? (
                          <button
                            onClick={() => handleVerifyUser(user._id)}
                            className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium"
                          >
                            Verify
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnverifyUser(user._id)}
                            className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm font-medium"
                          >
                            Unverify
                          </button>
                        )}

                        {admin?.isSuperAdmin && (
                          <button
                            onClick={() => handlePromoteToAdmin(user._id)}
                            className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium"
                          >
                            Promote
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-gray-700/50">
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
      </div>
    </div>
  );
};

export default AdminUsers;