import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, Activity, TrendingUp, LogOut, Menu, X, Shield, Flag, Search, CheckCircle, XCircle, Trash2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAdminContext } from '../Context/AdminContext';
import axiosInstance from '../utils/axiosInstance';
import FindOutLoader from '../Loader/FindOutLoader';

const ACTIVE_KEY = 'users';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: Activity, to: '/admin-dashboard' },
  { key: 'users', label: 'Users', icon: Users, to: '/admin-users' },
  { key: 'posts', label: 'Posts', icon: FileText, to: '/admin-posts' },
  { key: 'reports', label: 'Reports', icon: Flag, to: '/admin-reports' },
  { key: 'analytics', label: 'Analytics', icon: TrendingUp, to: '/admin-analytics' },
];

const AdminUsers = () => {
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

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (admin) fetchUsers();
  }, [admin, searchQuery, statusFilter, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({ page: currentPage, limit: 20 });
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
      const response = await axiosInstance.patch(`/api/admin/users/${userId}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) { fetchUsers(); toast('User verified successfully!'); }
    } catch (error) {
      toast('Failed to verify user', 'error');
    }
  };

  const handleUnverifyUser = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstance.patch(`/api/admin/users/${userId}/unverify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) { fetchUsers(); toast('User verification removed'); }
    } catch (error) {
      toast('Failed to unverify user', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    const ok = await confirm('Delete this user? This will also delete all their posts and remove them from groups.');
    if (!ok) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstance.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) { fetchUsers(); toast('User deleted successfully'); }
    } catch (error) {
      toast('Failed to delete user', 'error');
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    const ok = await confirm('Promote this user to admin? They will receive admin access.');
    if (!ok) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstance.post(`/api/admin/users/${userId}/promote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast(`User promoted. Temporary password: ${response.data.tempPassword}`, 'success', true);
        fetchUsers();
      }
    } catch (error) {
      toast(error.response?.data?.message || 'Failed to promote user', 'error');
    }
  };

  if (loading && users.length === 0) {
    return <FindOutLoader />;
  }


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
        <h1 className="text-2xl font-semibold mb-1" style={{ color: '#f1f5f9' }}>User Management</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Manage and moderate platform users</p>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} color="rgba(255,255,255,0.3)" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none text-sm"
              style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
            style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
          >
            <option value="all">All Status</option>
            <option value="Ready To Teach">Teachers</option>
            <option value="Ready To Learn">Learners</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <tr>
                <th className="text-left p-4 font-medium text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>User</th>
                <th className="text-left p-4 font-medium text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Status</th>
                <th className="text-left p-4 font-medium text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Reputation</th>
                <th className="text-left p-4 font-medium text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Verified</th>
                <th className="text-left p-4 font-medium text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Online</th>
                <th className="text-right p-4 font-medium text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        {user.profilePicture ? (
                          <img src={`${import.meta.env.VITE_BACKEND_URL}${user.profilePicture}`} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-semibold text-xs" style={{ color: '#f1f5f9' }}>{user.name?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: '#f1f5f9' }}>{user.name}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: user.status === 'Ready To Teach' ? 'rgba(59,130,246,0.15)' : 'rgba(99,102,241,0.15)',
                        color: user.status === 'Ready To Teach' ? '#60a5fa' : '#818cf8',
                      }}
                    >
                      {user.status === 'Ready To Teach' ? 'Teacher' : 'Learner'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-sm" style={{ color: '#eab308' }}>{user.reputation || 0}</span>
                  </td>
                  <td className="p-4">
                    {user.isVerified ? <CheckCircle size={18} color="#4ade80" /> : <XCircle size={18} color="rgba(255,255,255,0.2)" />}
                  </td>
                  <td className="p-4">
                    {user.isOnline ? (
                      <span className="flex items-center gap-2 text-sm" style={{ color: '#4ade80' }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
                        Online
                      </span>
                    ) : (
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Offline</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {!user.isVerified ? (
                        <button onClick={() => handleVerifyUser(user._id)} className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>
                          Verify
                        </button>
                      ) : (
                        <button onClick={() => handleUnverifyUser(user._id)} className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: 'rgba(234,179,8,0.12)', color: '#eab308' }}>
                          Unverify
                        </button>
                      )}
                      {admin?.isSuperAdmin && (
                        <button onClick={() => handlePromoteToAdmin(user._id)} className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                          Promote
                        </button>
                      )}
                      <button onClick={() => handleDeleteUser(user._id)} className="p-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Page {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg disabled:opacity-40"
              style={{ background: '#0a0a0f', color: 'rgba(255,255,255,0.3)' }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg disabled:opacity-40"
              style={{ background: '#0a0a0f', color: 'rgba(255,255,255,0.3)' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
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

export default AdminUsers;