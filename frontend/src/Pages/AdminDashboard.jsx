import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Activity, Flag, Users as GroupIcon, Award, BookOpen } from 'lucide-react';
import { useAdminContext } from '../Context/AdminContext';
import axiosInstance from '../utils/axiosInstance';
import FindOutLoader from '../Loader/FindOutLoader';
import { resolveImage } from './AdminLayout';

// The sidebar, mobile menu, login guard, logout and toasts now live in
// AdminLayout. This page only contains the dashboard content itself.
const AdminDashboard = () => {
  const { admin } = useAdminContext();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!admin) return;

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) return;
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
    fetchStats();
  }, [admin, navigate]);

  const postTypeCounts = [
    { label: 'Resources', value: stats?.posts?.byType?.find(t => t._id === 'resource')?.count || 0 },
    { label: 'Help', value: stats?.posts?.byType?.find(t => t._id === 'help')?.count || 0 },
    { label: 'Explanations', value: stats?.posts?.byType?.find(t => t._id === 'explanation')?.count || 0 },
  ];
  const card = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 };

  // FIX: `list?.map(...) || <empty message>` never showed the empty message,
  // because an empty array is "truthy". These lists make the check explicit.
  const topSubjects = (stats?.topSubjects || []).slice(0, 5);
  const topContributors = (stats?.topContributors || []).slice(0, 5);

  if (loading) return <FindOutLoader />;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: '#f1f5f9' }}>Dashboard</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Welcome back, {admin?.name}</p>
        </div>
        <button
          onClick={() => navigate('/admin-reports')}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}
        >
          <Flag size={15} color="#eab308" />
          View Reports
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div style={card}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Users size={17} color="rgba(255,255,255,0.4)" />
            </div>
            <span className="text-xs font-medium" style={{ color: 'rgba(34,197,94,0.9)' }}>
              +{stats?.users?.recentSignups || 0} this week
            </span>
          </div>
          <h3 className="text-2xl font-semibold mb-0.5" style={{ color: '#f1f5f9' }}>{stats?.users?.total || 0}</h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Total Users</p>
          <div className="mt-4 pt-3 flex items-center gap-4 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.2)' }}>
            <span>{stats?.users?.teachers || 0} Teachers</span>
            <span>{stats?.users?.learners || 0} Learners</span>
          </div>
        </div>

        <div style={card}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <FileText size={17} color="rgba(255,255,255,0.4)" />
            </div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>All time</span>
          </div>
          <h3 className="text-2xl font-semibold mb-0.5" style={{ color: '#f1f5f9' }}>{stats?.posts?.total || 0}</h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Total Posts</p>
          <div className="mt-4 pt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.2)' }}>
            {postTypeCounts.map(t => <span key={t.label}>{t.label} {t.value}</span>)}
          </div>
        </div>

        <div style={card}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <GroupIcon size={17} color="rgba(255,255,255,0.4)" />
            </div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Active</span>
          </div>
          <h3 className="text-2xl font-semibold mb-0.5" style={{ color: '#f1f5f9' }}>{stats?.groups?.total || 0}</h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Learning Groups</p>
        </div>

        <div style={card}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Activity size={17} color="rgba(255,255,255,0.4)" />
            </div>
            <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
          </div>
          <h3 className="text-2xl font-semibold mb-0.5" style={{ color: '#f1f5f9' }}>{stats?.users?.online || 0}</h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Users Online</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div style={card}>
          <div className="flex items-center gap-2.5 mb-5">
            <BookOpen size={17} color="rgba(255,255,255,0.2)" />
            <h3 className="text-base font-semibold" style={{ color: '#f1f5f9' }}>Popular Subjects</h3>
          </div>
          <div className="space-y-1">
            {topSubjects.length > 0 ? topSubjects.map((subject, index) => (
              <div key={index} className="flex items-center justify-between py-2.5 px-1" style={{ borderBottom: index < topSubjects.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium w-4" style={{ color: 'rgba(255,255,255,0.2)' }}>{index + 1}</span>
                  <span className="text-sm font-medium" style={{ color: '#f1f5f9' }}>{subject._id}</span>
                </div>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>{subject.count} posts</span>
              </div>
            )) : <p className="text-sm text-center py-8" style={{ color: 'rgba(255,255,255,0.2)' }}>No subjects yet</p>}
          </div>
        </div>

        <div style={card}>
          <div className="flex items-center gap-2.5 mb-5">
            <Award size={17} color="rgba(255,255,255,0.2)" />
            <h3 className="text-base font-semibold" style={{ color: '#f1f5f9' }}>Top Contributors</h3>
          </div>
          <div className="space-y-1">
            {topContributors.length > 0 ? topContributors.map((user, index) => (
              <div key={user._id} className="flex items-center justify-between py-2.5 px-1" style={{ borderBottom: index < topContributors.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {user.profilePicture ? (
                      <img src={resolveImage(user.profilePicture)} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-medium text-xs" style={{ color: '#f1f5f9' }}>{user.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#f1f5f9' }}>{user.name}</p>
                    <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.2)' }}>{user.email}</p>
                  </div>
                </div>
                <span className="text-sm font-medium flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>{user.reputation} pts</span>
              </div>
            )) : <p className="text-sm text-center py-8" style={{ color: 'rgba(255,255,255,0.2)' }}>No contributors yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;