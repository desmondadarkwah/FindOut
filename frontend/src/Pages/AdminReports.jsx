import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FiAlertTriangle, FiTrash2, FiCheckCircle, FiUser, FiFileText, FiUsers } from 'react-icons/fi';
import { IoArrowBack } from 'react-icons/io5';
import moment from 'moment';

const AdminReports = () => {
  const navigate = useNavigate();
  const [toastState, setToastState] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (message, type = 'success', persistent = false) => {
    clearTimeout(toastTimer.current);
    setToastState({ message, type, persistent });
    if (!persistent) toastTimer.current = setTimeout(() => setToastState(null), 3000);
  };
  const toast = showToast;
  const confirm = (message) => Promise.resolve(window.confirm(message));

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
      if (response.data.success) setReports(response.data.reports);
    } catch (error) {
      console.error('Fetch reports error:', error);
      toast('Failed to fetch reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const ok = await confirm('Delete this user permanently?');
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
    const ok = await confirm('Delete this post permanently?');
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
    const ok = await confirm('Delete this group permanently?');
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


  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#f1f5f9',
      fontFamily: "'Inter', sans-serif",
      padding: '32px 24px',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <button
          onClick={() => navigate('/admin-dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 500,
            padding: '8px 0', marginBottom: 16, transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          <IoArrowBack size={18} /> Back to Dashboard
        </button>

    <div>
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

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
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
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 5 }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {user.profilePicture ? (
                        <img src={`${import.meta.env.VITE_BACKEND_URL}${user.profilePicture}`} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : <FiUser size={16} color="rgba(255,255,255,0.5)" />}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>{user.name}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{user.email}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteUser(user._id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: 'none', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <FiTrash2 size={13} /> Delete User
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {user.reports.map((report, i) => (
                    <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.05)' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#f87171' }}>{report.reason}</span>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: '3px 0 0' }}>
                        Reported by {report.reportedBy?.name || 'Unknown'} · {moment(report.reportedAt).fromNow()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {activeTab === 'posts' && (
            reports.posts.length === 0 ? renderEmpty('No post reports') : reports.posts.map(post => (
              <div key={post._id} style={card}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: '0 0 4px' }}>
                      {post.caption?.substring(0, 80) || 'No caption'}...
                    </p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                      By {post.author?.name || 'Unknown'} · {post.postType}
                    </p>
                  </div>
                  <button onClick={() => handleDeletePost(post._id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: 'none', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0, marginLeft: 12 }}>
                    <FiTrash2 size={13} /> Delete Post
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {post.reports.map((report, i) => (
                    <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(234,179,8,0.05)' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#eab308' }}>{report.reason}</span>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: '3px 0 0' }}>
                        Reported by {report.reportedBy?.name || 'Unknown'} · {moment(report.reportedAt).fromNow()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {activeTab === 'groups' && (
            reports.groups.length === 0 ? renderEmpty('No group reports') : reports.groups.map(group => (
              <div key={group._id} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: '0 0 4px' }}>{group.groupName}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                      Admin: {group.groupAdmin?.name || 'Unknown'} · {group.privacy}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteGroup(group._id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: 'none', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0, marginLeft: 12 }}>
                    <FiTrash2 size={13} /> Delete Group
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {group.reports.map((report, i) => (
                    <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(99,102,241,0.05)' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#818cf8' }}>{report.reason}</span>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: '3px 0 0' }}>
                        Reported by {report.reportedBy?.name || 'Unknown'} · {moment(report.reportedAt).fromNow()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}
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

export default AdminReports;