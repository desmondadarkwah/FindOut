import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Activity, ArrowUp, BarChart3, PieChart } from 'lucide-react';
import { useAdminContext } from '../Context/AdminContext';
import axiosInstance from '../utils/axiosInstance';
import FindOutLoader from '../Loader/FindOutLoader';

// The sidebar, mobile menu, login guard and logout now live in AdminLayout.
const AdminAnalytics = () => {
  const { admin } = useAdminContext();
  const navigate = useNavigate();

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

  const totalUsers = stats?.users?.total || 0;
  const totalPosts = stats?.posts?.total || 0;
  const teachers = stats?.users?.teachers || 0;
  const learners = stats?.users?.learners || 0;
  const online = stats?.users?.online || 0;
  const percentOf = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

  // This average only covers the top contributors the server sends back,
  // so it is labelled that way below instead of "Average Reputation".
  const topContributors = stats?.topContributors || [];
  const avgTopReputation = topContributors.length > 0
    ? (topContributors.reduce((sum, u) => sum + (u.reputation || 0), 0) / topContributors.length).toFixed(1)
    : 0;

  return (
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
          <h3 className="text-2xl font-semibold mb-1" style={{ color: '#f1f5f9' }}>{totalUsers}</h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Total Users</p>
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>+{stats?.users?.recentSignups || 0} this week</p>
        </div>

        <div style={card}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Activity size={19} color="rgba(255,255,255,0.4)" />
            </div>
            {/* FIX: the green "up arrow" suggested growth, but this number is just
                how many people are online right now - shown as a plain live dot */}
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#4ade80' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />{online}
            </div>
          </div>
          <h3 className="text-2xl font-semibold mb-1" style={{ color: '#f1f5f9' }}>
            {percentOf(online, totalUsers)}%
          </h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Online Rate</p>
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>{online} users online now</p>
        </div>

        <div style={card}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <FileText size={19} color="rgba(255,255,255,0.4)" />
            </div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>All time</span>
          </div>
          <h3 className="text-2xl font-semibold mb-1" style={{ color: '#f1f5f9' }}>{totalPosts}</h3>
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
                <span className="font-semibold" style={{ color: '#60a5fa' }}>{teachers}</span>
              </div>
              <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ background: '#3b82f6', width: `${percentOf(teachers, totalUsers)}%` }} />
              </div>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {percentOf(teachers, totalUsers)}% of total users
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Learners (Ready to Learn)</span>
                <span className="font-semibold" style={{ color: '#818cf8' }}>{learners}</span>
              </div>
              <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ background: '#6366f1', width: `${percentOf(learners, totalUsers)}%` }} />
              </div>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {percentOf(learners, totalUsers)}% of total users
              </p>
            </div>

            <div className="mt-6 p-4 rounded-lg" style={{ background: '#0a0a0f' }}>
              <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Teacher : Learner Ratio</p>
              {/* FIX: with zero teachers this used to show "1 : 0", which reads
                  as if there were no learners. It now shows a dash. */}
              <p className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>
                {teachers > 0 ? `1 : ${(learners / teachers).toFixed(1)}` : '—'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {teachers === 0
                  ? 'No teachers yet'
                  : learners > teachers ? 'More learners than teachers' : 'Balanced community'}
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
                  <div className="h-full rounded-full transition-all duration-500" style={{ background: '#6366f1', width: `${percentOf(type.count, totalPosts)}%` }} />
                </div>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {percentOf(type.count, totalPosts)}% of total posts
                </p>
              </div>
            ))}
            {(!stats?.posts?.byType || stats.posts.byType.length === 0) && (
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
            {/* FIX: renamed - this is the average of the top contributors only,
                not of every user on the platform */}
            <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Avg. Top Contributor Reputation</p>
            <p className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>{avgTopReputation}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: '#0a0a0f' }}>
            <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Posts per User</p>
            {/* FIX: `stats.posts.total` here could crash if `posts` was missing */}
            <p className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>
              {totalUsers > 0 ? (totalPosts / totalUsers).toFixed(1) : 0}
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: '#0a0a0f' }}>
            {/* FIX: renamed - this counts the top subjects the server returns,
                not every subject on the platform */}
            <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Top Subjects Tracked</p>
            <p className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>{stats?.topSubjects?.length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;