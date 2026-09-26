import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FiAlertTriangle, FiTrash2, FiCheckCircle, FiUser, FiFileText, FiUsers } from 'react-icons/fi';
import { IoArrowBack } from 'react-icons/io5';
import moment from 'moment';

const AdminReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState({ users: [], posts: [], groups: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error('Fetch reports error:', error);
      showToast('Failed to fetch reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      const adminToken = localStorage.getItem('adminToken');
      await axiosInstance.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setReports(prev => ({
        ...prev,
        users: prev.users.filter(u => u._id !== userId)
      }));
      showToast('User deleted successfully');
    } catch (e) {
      showToast('Failed to delete user', 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      const adminToken = localStorage.getItem('adminToken');
      await axiosInstance.delete(`/api/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setReports(prev => ({
        ...prev,
        posts: prev.posts.filter(p => p._id !== postId)
      }));
      showToast('Post deleted successfully');
    } catch (e) {
      showToast('Failed to delete post', 'error');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Delete this group permanently?')) return;
    try {
      const adminToken = localStorage.getItem('adminToken');
      await axiosInstance.delete(`/api/admin/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setReports(prev => ({
        ...prev,
        groups: prev.groups.filter(g => g._id !== groupId)
      }));
      showToast('Group deleted successfully');
    } catch (e) {
      showToast('Failed to delete group', 'error');
    }
  };

  const card = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16, padding: 20, marginBottom: 12,
  };

  const tabs = [
    { key: 'users',  label: 'User Reports',  icon: <FiUser size={15} />,      count: reports.users.length },
    { key: 'posts',  label: 'Post Reports',  icon: <FiFileText size={15} />,   count: reports.posts.length },
    { key: 'groups', label: 'Group Reports', icon: <FiUsers size={15} />,      count: reports.groups.length },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#0f0f1a,#0a0a0f)',
      color: '#f1f5f9',
      fontFamily: "'Inter', sans-serif",
      padding: '32px 24px',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <button
            onClick={() => navigate('/admin-dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 600,
              padding: '8px 0', marginBottom: 16, transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            <IoArrowBack size={18} /> Back to Dashboard
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(234,179,8,0.1)',
              border: '1px solid rgba(234,179,8,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiAlertTriangle size={20} color="#fbbf24" />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Reports
              </h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                {reports.users.length + reports.posts.length + reports.groups.length} total reports
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
          gap: 14, marginBottom: 28,
        }}>
          {[
            { label: 'User Reports',  value: reports.users.length,  color: '#f87171', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.15)' },
            { label: 'Post Reports',  value: reports.posts.length,  color: '#fbbf24', bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.15)' },
            { label: 'Group Reports', value: reports.groups.length, color: '#a78bfa', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.15)' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: stat.bg,
              border: `1px solid ${stat.border}`,
              borderRadius: 14, padding: '18px 20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 20,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12, padding: 5,
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 7,
                padding: '9px 8px', borderRadius: 9, cursor: 'pointer',
                background: activeTab === tab.key
                  ? 'linear-gradient(135deg,#3b82f6,#6366f1)'
                  : 'transparent',
                border: 'none',
                color: activeTab === tab.key ? '#fff' : 'rgba(255,255,255,0.4)',
                fontSize: 13, fontWeight: 700,
                transition: 'all 0.2s',
              }}
            >
              {tab.icon} {tab.label}
              {tab.count > 0 && (
                <span style={{
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'rgba(99,102,241,0.2)',
                  color: activeTab === tab.key ? '#fff' : '#a5b4fc',
                  fontSize: 10, fontWeight: 800,
                  padding: '1px 6px', borderRadius: 99,
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>
            Loading reports...
          </div>
        ) : (

          <>
            {/* ── USER REPORTS ── */}
            {activeTab === 'users' && (
              <div>
                {reports.users.length === 0 ? (
                  <div style={{ ...card, textAlign: 'center', padding: '48px' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                    <p style={{ color: 'rgba(255,255,255,0.3)', margin: 0 }}>No user reports</p>
                  </div>
                ) : (
                  reports.users.map(user => (
                    <div key={user._id} style={card}>
                      {/* User info */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 42, height: 42, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden',
                          }}>
                            {user.profilePicture ? (
                              <img src={`${import.meta.env.VITE_BACKEND_URL}${user.profilePicture}`} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <FiUser size={18} color="#fff" />
                            )}
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{user.name}</p>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{user.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '7px 14px', borderRadius: 8,
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            color: '#f87171', fontSize: 12, fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        >
                          <FiTrash2 size={13} /> Delete User
                        </button>
                      </div>

                      {/* Reports */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {user.reports.map((report, i) => (
                          <div key={i} style={{
                            padding: '10px 14px', borderRadius: 10,
                            background: 'rgba(239,68,68,0.05)',
                            border: '1px solid rgba(239,68,68,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          }}>
                            <div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#f87171' }}>
                                {report.reason}
                              </span>
                              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '3px 0 0' }}>
                                Reported by {report.reportedBy?.name || 'Unknown'} · {moment(report.reportedAt).fromNow()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── POST REPORTS ── */}
            {activeTab === 'posts' && (
              <div>
                {reports.posts.length === 0 ? (
                  <div style={{ ...card, textAlign: 'center', padding: '48px' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                    <p style={{ color: 'rgba(255,255,255,0.3)', margin: 0 }}>No post reports</p>
                  </div>
                ) : (
                  reports.posts.map(post => (
                    <div key={post._id} style={card}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' }}>
                            {post.caption?.substring(0, 80) || 'No caption'}...
                          </p>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                            By {post.author?.name || 'Unknown'} · {post.postType}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '7px 14px', borderRadius: 8,
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            color: '#f87171', fontSize: 12, fontWeight: 700,
                            cursor: 'pointer', flexShrink: 0, marginLeft: 12,
                          }}
                        >
                          <FiTrash2 size={13} /> Delete Post
                        </button>
                      </div>

                      {/* Reports */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {post.reports.map((report, i) => (
                          <div key={i} style={{
                            padding: '10px 14px', borderRadius: 10,
                            background: 'rgba(234,179,8,0.05)',
                            border: '1px solid rgba(234,179,8,0.1)',
                          }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#fbbf24' }}>
                              {report.reason}
                            </span>
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '3px 0 0' }}>
                              Reported by {report.reportedBy?.name || 'Unknown'} · {moment(report.reportedAt).fromNow()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── GROUP REPORTS ── */}
            {activeTab === 'groups' && (
              <div>
                {reports.groups.length === 0 ? (
                  <div style={{ ...card, textAlign: 'center', padding: '48px' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                    <p style={{ color: 'rgba(255,255,255,0.3)', margin: 0 }}>No group reports</p>
                  </div>
                ) : (
                  reports.groups.map(group => (
                    <div key={group._id} style={card}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' }}>
                            {group.groupName}
                          </p>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                            Admin: {group.groupAdmin?.name || 'Unknown'} · {group.privacy}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteGroup(group._id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '7px 14px', borderRadius: 8,
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            color: '#f87171', fontSize: 12, fontWeight: 700,
                            cursor: 'pointer', flexShrink: 0, marginLeft: 12,
                          }}
                        >
                          <FiTrash2 size={13} /> Delete Group
                        </button>
                      </div>

                      {/* Reports */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {group.reports.map((report, i) => (
                          <div key={i} style={{
                            padding: '10px 14px', borderRadius: 10,
                            background: 'rgba(139,92,246,0.05)',
                            border: '1px solid rgba(139,92,246,0.1)',
                          }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#a78bfa' }}>
                              {report.reason}
                            </span>
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '3px 0 0' }}>
                              Reported by {report.reportedBy?.name || 'Unknown'} · {moment(report.reportedAt).fromNow()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, padding: '12px 22px', borderRadius: 12,
          background: toast.type === 'error' ? '#dc2626' : 'rgba(30,30,48,0.98)',
          border: toast.type === 'error' ? 'none' : '1px solid rgba(99,102,241,0.3)',
          color: '#fff', fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AdminReports;