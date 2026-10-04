import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, Activity, TrendingUp, LogOut, Menu, X, Shield, Flag, ArrowUp, BarChart3, PieChart
} from 'lucide-react';
import { useAdminContext } from '../Context/AdminContext';
import axiosInstance from '../utils/axiosInstance';
import FindOutLoader from '../Loader/FindOutLoader';

const ACTIVE_KEY = 'analytics';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: Activity, to: '/admin-dashboard' },
  { key: 'users', label: 'Users', icon: Users, to: '/admin-users' },
  { key: 'posts', label: 'Posts', icon: FileText, to: '/admin-posts' },
  { key: 'reports', label: 'Reports', icon: Flag, to: '/admin-reports' },
  { key: 'analytics', label: 'Analytics', icon: TrendingUp, to: '/admin-analytics' },
];

const AdminAnalytics = () => {
  const { admin, logout } = useAdminContext();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (admin) fetchStats();
  }, [admin]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstance.get('/api/admin/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setStats(response.data.stats);
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
  const card = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 };

  if (loading) return <FindOutLoader />;

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
        <h1 className="text-2xl font-semibold mb-1" style={{ color: '#f1f5f9' }}>Analytics & Insights</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Platform performance and user engagement metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div style={card}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Users size={19} color="rgba(255,255,255,0.4)" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium" style={{ color: '#4ade80' }}>
              <ArrowUp size={15} />{stats?.users?.recentSignups || 0}
            </div>
          </div>
          <h3 className="text-2xl font-semibold mb-1" style={{ color: '#f1f5f9' }}>{stats?.users?.total || 0}</h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Total Users</p>
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>+{stats?.users?.recentSignups || 0} this week</p>
        </div>

        <div style={card}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Activity size={19} color="rgba(255,255,255,0.4)" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium" style={{ color: '#4ade80' }}>
              <ArrowUp size={15} />{stats?.users?.online || 0}
            </div>
          </div>
          <h3 className="text-2xl font-semibold mb-1" style={{ color: '#f1f5f9' }}>
            {stats?.users?.total > 0 ? Math.round((stats?.users?.online / stats?.users?.total) * 100) : 0}%
          </h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Online Rate</p>
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>{stats?.users?.online || 0} users online now</p>
        </div>

        <div style={card}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <FileText size={19} color="rgba(255,255,255,0.4)" />
            </div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>All time</span>
          </div>
          <h3 className="text-2xl font-semibold mb-1" style={{ color: '#f1f5f9' }}>{stats?.posts?.total || 0}</h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Total Posts</p>
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>Learning content shared</p>
        </div>

        <div style={card}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Users size={19} color="rgba(255,255,255,0.4)" />
            </div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Active</span>
          </div>
          <h3 className="text-2xl font-semibold mb-1" style={{ color: '#f1f5f9' }}>{stats?.groups?.total || 0}</h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Learning Groups</p>
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>Active communities</p>
        </div>
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* User Distribution */}
        <div style={card}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <PieChart size={18} color="rgba(255,255,255,0.4)" />
            </div>
            <h3 className="text-base font-semibold" style={{ color: '#f1f5f9' }}>User Distribution</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Teachers (Ready to Teach)</span>
                <span className="font-semibold" style={{ color: '#60a5fa' }}>{stats?.users?.teachers || 0}</span>
              </div>
              <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{
                  background: '#3b82f6',
                  width: `${stats?.users?.total > 0 ? (stats?.users?.teachers / stats?.users?.total) * 100 : 0}%`
                }} />
              </div>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {stats?.users?.total > 0 ? Math.round((stats?.users?.teachers / stats?.users?.total) * 100) : 0}% of total users
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Learners (Ready to Learn)</span>
                <span className="font-semibold" style={{ color: '#818cf8' }}>{stats?.users?.learners || 0}</span>
              </div>
              <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{
                  background: '#6366f1',
                  width: `${stats?.users?.total > 0 ? (stats?.users?.learners / stats?.users?.total) * 100 : 0}%`
                }} />
              </div>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {stats?.users?.total > 0 ? Math.round((stats?.users?.learners / stats?.users?.total) * 100) : 0}% of total users
              </p>
            </div>

            <div className="mt-6 p-4 rounded-lg" style={{ background: '#0a0a0f' }}>
              <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Teacher : Learner Ratio</p>
              <p className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>
                1 : {stats?.users?.teachers > 0 ? (stats?.users?.learners / stats?.users?.teachers).toFixed(1) : 0}
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {stats?.users?.teachers > 0 && stats?.users?.learners > stats?.users?.teachers ? 'More learners than teachers' : 'Balanced community'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Distribution */}
        <div style={card}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <BarChart3 size={18} color="rgba(255,255,255,0.4)" />
            </div>
            <h3 className="text-base font-semibold" style={{ color: '#f1f5f9' }}>Content Distribution</h3>
          </div>

          <div className="space-y-4">
            {stats?.posts?.byType?.map((type) => (
              <div key={type._id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm capitalize" style={{ color: 'rgba(255,255,255,0.3)' }}>{type._id}</span>
                  <span className="font-semibold" style={{ color: '#818cf8' }}>{type.count}</span>
                </div>
                <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{
                    background: '#6366f1',
                    width: `${stats?.posts?.total > 0 ? (type.count / stats?.posts?.total) * 100 : 0}%`
                  }} />
                </div>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {stats?.posts?.total > 0 ? Math.round((type.count / stats?.posts?.total) * 100) : 0}% of total posts
                </p>
              </div>
            ))}
            {(!stats?.posts?.byType || stats?.posts?.byType.length === 0) && (
              <p className="text-center py-8" style={{ color: 'rgba(255,255,255,0.2)' }}>No post data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Platform Health */}
      <div style={card}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <Activity size={18} color="rgba(255,255,255,0.4)" />
          </div>
          <h3 className="text-base font-semibold" style={{ color: '#f1f5f9' }}>Platform Health</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg" style={{ background: '#0a0a0f' }}>
            <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Average Reputation</p>
            <p className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>
              {stats?.topContributors?.length > 0
                ? (stats.topContributors.reduce((sum, u) => sum + (u.reputation || 0), 0) / stats.topContributors.length).toFixed(1)
                : 0}
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: '#0a0a0f' }}>
            <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Posts per User</p>
            <p className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>
              {stats?.users?.total > 0 ? (stats.posts.total / stats.users.total).toFixed(1) : 0}
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: '#0a0a0f' }}>
            <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Active Subjects</p>
            <p className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>{stats?.topSubjects?.length || 0}</p>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;