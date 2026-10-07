import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FiAlertTriangle, FiTrash2, FiCheckCircle, FiUser, FiFileText, FiUsers } from 'react-icons/fi';
import moment from 'moment';
import { useAdminUI, resolveImage } from './AdminLayout';

// Short preview of a post caption - adds "..." only when it was really cut
const previewCaption = (caption) => {
  if (!caption) return 'No caption';
  return caption.length > 80 ? `${caption.substring(0, 80)}...` : caption;
};

const AdminReports = () => {
  const navigate = useNavigate();
  const { toast, confirm } = useAdminUI();

  const [reports, setReports] = useState({ users: [], posts: [], groups: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      const response = await axiosInstance.get('/api/reports/all', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (response.data.success) {
        // FIX: tolerate a missing list so one empty section can't crash the page
        const r = response.data.reports || {};
        setReports({ users: r.users || [], posts: r.posts || [], groups: r.groups || [] });
      }
    } catch (error) {
      console.error('Fetch reports error:', error);
      // FIX: an expired admin login now sends you back to the login page
      // (the other admin pages already did this; this one didn't)
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin-login');
        return;
      }
      toast('Failed to fetch reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const ok = await confirm('Delete this user permanently?', { title: 'Delete User', confirmText: 'Delete' });
    if (!ok) return;
    try {
      const adminToken = localStorage.getItem('adminToken');
      await axiosInstance.delete(`/api/admin/users/${userId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      setReports(prev => ({ ...prev, users: prev.users.filter(u => u._id !== userId) }));
      toast('User deleted successfully');
    } catch (e) {
      toast('Failed to delete user', 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    const ok = await confirm('Delete this post permanently?', { title: 'Delete Post', confirmText: 'Delete' });
    if (!ok) return;
    try {
      const adminToken = localStorage.getItem('adminToken');
      await axiosInstance.delete(`/api/admin/posts/${postId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      setReports(prev => ({ ...prev, posts: prev.posts.filter(p => p._id !== postId) }));
      toast('Post deleted successfully');
    } catch (e) {
      toast('Failed to delete post', 'error');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    const ok = await confirm('Delete this group permanently?', { title: 'Delete Group', confirmText: 'Delete' });
    if (!ok) return;
    try {
      const adminToken = localStorage.getItem('adminToken');
      await axiosInstance.delete(`/api/admin/groups/${groupId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      setReports(prev => ({ ...prev, groups: prev.groups.filter(g => g._id !== groupId) }));
      toast('Group deleted successfully');
    } catch (e) {
      toast('Failed to delete group', 'error');
    }
  };

  const card = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20, marginBottom: 12 };

  const tabs = [
    { key: 'users', label: 'User Reports', icon: <FiUser size={15} />, count: reports.users.length },
    { key: 'posts', label: 'Post Reports', icon: <FiFileText size={15} />, count: reports.posts.length },
    { key: 'groups', label: 'Group Reports', icon: <FiUsers size={15} />, count: reports.groups.length },
  ];

  const renderEmpty = (label) => (
    <div style={{ ...card, textAlign: 'center', padding: 48 }}>
      <FiCheckCircle size={32} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto 12px' }} />
      <p style={{ color: 'rgba(255,255,255,0.3)', margin: 0 }}>{label}</p>
    </div>
  );

  // One report line, shared by all three tabs
  const renderReportLine = (report, i, color, bg) => (
    <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: bg }}>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{report.reason}</span>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: '3px 0 0' }}>
        Reported by {report.reportedBy?.name || 'Unknown'} · {moment(report.reportedAt).fromNow()}
      </p>
    </div>
  );

  const deleteButtonStyle = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
    background: 'rgba(239,68,68,0.12)', border: 'none', color: '#f87171',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', color: '#f1f5f9', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FiAlertTriangle size={19} color="#eab308" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: '#f1f5f9', margin: 0 }}>Reports</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
              {reports.users.length + reports.posts.length + reports.groups.length} total reports
            </p>
          </div>
        </div>
      </div>

      {/* Stats (FIX: wraps on narrow screens instead of squeezing 3 fixed columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'User Reports', value: reports.users.length, color: '#f87171', bg: 'rgba(239,68,68,0.08)' },
          { label: 'Post Reports', value: reports.posts.length, color: '#eab308', bg: 'rgba(234,179,8,0.08)' },
          { label: 'Group Reports', value: reports.groups.length, color: '#818cf8', bg: 'rgba(99,102,241,0.08)' },
        ].map(stat => (
          <div key={stat.label} style={{ background: stat.bg, borderRadius: 12, padding: '16px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 5, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: '1 1 120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '9px 8px', borderRadius: 8, cursor: 'pointer', border: 'none',
              background: activeTab === tab.key ? '#6366f1' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'rgba(255,255,255,0.4)',
              fontSize: 13, fontWeight: 600,
            }}
          >
            {tab.icon} {tab.label}
            {tab.count > 0 && (
              <span style={{
                background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'rgba(99,102,241,0.2)',
                color: activeTab === tab.key ? '#fff' : '#a5b4fc',
                fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>Loading reports...</div>
      ) : (
        <>
          {activeTab === 'users' && (
            reports.users.length === 0 ? renderEmpty('No user reports') : reports.users.map(user => (
              <div key={user._id} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {user.profilePicture ? (
                        <img src={resolveImage(user.profilePicture)} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : <FiUser size={16} color="rgba(255,255,255,0.5)" />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>{user.name}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteUser(user._id)} style={deleteButtonStyle}>
                    <FiTrash2 size={13} /> Delete User
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(user.reports || []).map((report, i) => renderReportLine(report, i, '#f87171', 'rgba(239,68,68,0.05)'))}
                </div>
              </div>
            ))
          )}

          {activeTab === 'posts' && (
            reports.posts.length === 0 ? renderEmpty('No post reports') : reports.posts.map(post => (
              <div key={post._id} style={card}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: '0 0 4px' }}>
                      {previewCaption(post.caption)}
                    </p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                      By {post.author?.name || 'Unknown'} · {post.postType}
                    </p>
                  </div>
                  <button onClick={() => handleDeletePost(post._id)} style={deleteButtonStyle}>
                    <FiTrash2 size={13} /> Delete Post
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(post.reports || []).map((report, i) => renderReportLine(report, i, '#eab308', 'rgba(234,179,8,0.05)'))}
                </div>
              </div>
            ))
          )}

          {activeTab === 'groups' && (
            reports.groups.length === 0 ? renderEmpty('No group reports') : reports.groups.map(group => (
              <div key={group._id} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: '0 0 4px' }}>{group.groupName}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                      Admin: {group.groupAdmin?.name || 'Unknown'} · {group.privacy}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteGroup(group._id)} style={deleteButtonStyle}>
                    <FiTrash2 size={13} /> Delete Group
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(group.reports || []).map((report, i) => renderReportLine(report, i, '#818cf8', 'rgba(99,102,241,0.05)'))}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default AdminReports;