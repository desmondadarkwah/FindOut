import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, Users as GroupIcon, Activity,
  TrendingUp, Award, BookOpen, LogOut, Menu, X,
  Shield, Flag
} from 'lucide-react';
import { useAdminContext } from '../Context/AdminContext';
import axiosInstance from '../utils/axiosInstance';
import FindOutLoader from '../Loader/FindOutLoader';

const AdminDashboard = () => {
  const { admin, logout } = useAdminContext();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  // Only redirect if no admin AND no token
  useEffect(() => {
    if (admin) return; // Admin already set from login

    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
    }
  }, [admin, navigate]);

  // Fetch stats when admin is set
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
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      await logout();
      navigate('/admin-login');
    }
  };

  if (statsLoading) {
    return <FindOutLoader />;
  }

  const navItems = [
    { label: 'Dashboard', icon: Activity, to: '/admin-dashboard', active: true },
    { label: 'Users', icon: Users, to: '/admin-users' },
    { label: 'Posts', icon: FileText, to: '/admin-posts' },
    { label: 'Reports', icon: Flag, to: '/admin-reports' },
    { label: 'Analytics', icon: TrendingUp, to: '/admin-analytics' },
  ];

  const postTypeCounts = [
    { label: 'Resources', value: stats?.posts?.byType?.find(t => t._id === 'resource')?.count || 0 },
    { label: 'Help', value: stats?.posts?.byType?.find(t => t._id === 'help')?.count || 0 },
    { label: 'Explanations', value: stats?.posts?.byType?.find(t => t._id === 'explanation')?.count || 0 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)]"
      >
        {showSidebar ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-[var(--bg-secondary)] border-r border-[var(--border)] z-40
        transform transition-transform duration-200 lg:translate-x-0
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-5 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8 px-1">
            <div className="w-8 h-8 bg-white/[0.06] border border-[var(--border)] rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-[var(--text-secondary)]" />
            </div>
            <div>
              <h2 className="text-[var(--text-primary)] font-semibold text-sm leading-tight">FindOut</h2>
              <p className="text-[var(--text-muted)] text-xs leading-tight">Admin</p>
            </div>
          </div>

          {/* Admin Info */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3.5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/[0.06] border border-[var(--border)] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[var(--text-primary)] font-semibold text-xs">
                  {admin?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[var(--text-primary)] font-medium text-sm truncate">{admin?.name}</p>
                <p className="text-[var(--text-muted)] text-xs truncate">{admin?.email}</p>
              </div>
            </div>
            {admin?.isSuperAdmin && (
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <span className="inline-flex items-center gap-1.5 text-xs text-amber-400/90">
                  <Shield size={12} />
                  Super Admin
                </span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-0.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.to)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-l-2 ${
                    item.active
                      ? 'text-white bg-white/[0.05] border-[#6366f1]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.03] border-transparent'
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
            className="w-full flex items-center gap-3 px-3 py-2.5 text-[var(--text-muted)] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 px-4 py-6 lg:px-10 lg:py-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">Dashboard</h1>
            <p className="text-[var(--text-muted)] text-sm">Welcome back, {admin?.name}</p>
          </div>

          <button
            onClick={() => navigate('/admin-reports')}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 rounded-lg text-[var(--text-secondary)] text-sm font-medium transition-colors"
          >
            <Flag size={15} className="text-[#eab308]" />
            View Reports
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Users */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 bg-white/[0.05] rounded-lg flex items-center justify-center">
                <Users size={17} className="text-[var(--text-secondary)]" />
              </div>
              <span className="text-[#22c55e]/90 text-xs font-medium">
                +{stats?.users?.recentSignups || 0} this week
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-[var(--text-primary)] mb-0.5">
              {stats?.users?.total || 0}
            </h3>
            <p className="text-[var(--text-muted)] text-sm">Total Users</p>
            <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-4 text-xs text-[var(--text-muted)]">
              <span>{stats?.users?.teachers || 0} Teachers</span>
              <span>{stats?.users?.learners || 0} Learners</span>
            </div>
          </div>

          {/* Total Posts */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 bg-white/[0.05] rounded-lg flex items-center justify-center">
                <FileText size={17} className="text-[var(--text-secondary)]" />
              </div>
              <span className="text-xs text-[var(--text-muted)]">All time</span>
            </div>
            <h3 className="text-2xl font-semibold text-[var(--text-primary)] mb-0.5">
              {stats?.posts?.total || 0}
            </h3>
            <p className="text-[var(--text-muted)] text-sm">Total Posts</p>
            <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-3 text-xs text-[var(--text-muted)]">
              {postTypeCounts.map((t) => (
                <span key={t.label}>{t.label} {t.value}</span>
              ))}
            </div>
          </div>

          {/* Total Groups */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 bg-white/[0.05] rounded-lg flex items-center justify-center">
                <GroupIcon size={17} className="text-[var(--text-secondary)]" />
              </div>
              <span className="text-xs text-[var(--text-muted)]">Active</span>
            </div>
            <h3 className="text-2xl font-semibold text-[var(--text-primary)] mb-0.5">
              {stats?.groups?.total || 0}
            </h3>
            <p className="text-[var(--text-muted)] text-sm">Learning Groups</p>
          </div>

          {/* Online Users */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 bg-white/[0.05] rounded-lg flex items-center justify-center">
                <Activity size={17} className="text-[var(--text-secondary)]" />
              </div>
              <span className="w-2 h-2 bg-[#22c55e] rounded-full" />
            </div>
            <h3 className="text-2xl font-semibold text-[var(--text-primary)] mb-0.5">
              {stats?.users?.online || 0}
            </h3>
            <p className="text-[var(--text-muted)] text-sm">Users Online</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Subjects */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <BookOpen size={17} className="text-[var(--text-muted)]" />
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Popular Subjects</h3>
            </div>

            <div className="space-y-1">
              {stats?.topSubjects?.slice(0, 5).map((subject, index) => (
                <div key={index} className="flex items-center justify-between py-2.5 px-1 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-[var(--text-muted)] w-4">{index + 1}</span>
                    <span className="text-[var(--text-primary)] text-sm font-medium">{subject._id}</span>
                  </div>
                  <span className="text-[var(--text-muted)] text-sm">{subject.count} posts</span>
                </div>
              )) || (
                <p className="text-[var(--text-muted)] text-sm text-center py-8">No subjects yet</p>
              )}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <Award size={17} className="text-[var(--text-muted)]" />
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Top Contributors</h3>
            </div>

            <div className="space-y-1">
              {stats?.topContributors?.slice(0, 5).map((user) => (
                <div key={user._id} className="flex items-center justify-between py-2.5 px-1 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-white/[0.06] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {user.profilePicture ? (
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}${user.profilePicture}`}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[var(--text-primary)] font-medium text-xs">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[var(--text-primary)] text-sm font-medium truncate">{user.name}</p>
                      <p className="text-[var(--text-muted)] text-xs truncate">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-[var(--text-muted)] text-sm font-medium flex-shrink-0">{user.reputation} pts</span>
                </div>
              )) || (
                <p className="text-[var(--text-muted)] text-sm text-center py-8">No contributors yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;