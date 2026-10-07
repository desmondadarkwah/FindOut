import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminContext } from '../Context/AdminContext';
import axiosInstance from '../utils/axiosInstance';
import FindOutLoader from '../Loader/FindOutLoader';
import { useAdminUI, useDebouncedValue, resolveImage } from './AdminLayout';

const STATUS_LABELS = {
  'Ready To Teach': 'Teacher',
  'Ready To Learn': 'Learner',
};

const AdminUsers = () => {
  const { admin } = useAdminContext();
  const navigate = useNavigate();
  const { toast, confirm } = useAdminUI();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // FIX: the full-page loader must only show for the FIRST load. It used to
  // replace the whole page whenever a search had no results yet, which removed
  // the search box from the screen and made it lose focus while you typed.
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // FIX: waits until you stop typing before asking the server (was one request
  // per keystroke), and ignores slow older responses (see requestIdRef).
  const searchQuery = useDebouncedValue(searchInput, 400);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (admin) fetchUsers();
  }, [admin, searchQuery, statusFilter, currentPage]);

  const fetchUsers = async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({ page: currentPage, limit: 20 });
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await axiosInstance.get(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (requestId !== requestIdRef.current) return; // a newer request replaced this one
      if (response.data.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin-login');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  };

  // After removing someone, go back a page if that was the last row on it
  const refreshAfterRemoval = () => {
    if (users.length === 1 && currentPage > 1) setCurrentPage(p => p - 1);
    else fetchUsers();
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
    const ok = await confirm('Delete this user? This will also delete all their posts and remove them from groups.', {
      title: 'Delete User',
      confirmText: 'Delete',
    });
    if (!ok) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstance.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) { refreshAfterRemoval(); toast('User deleted successfully'); }
    } catch (error) {
      toast('Failed to delete user', 'error');
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    const ok = await confirm('Promote this user to admin? They will receive admin access.', {
      title: 'Promote to Admin',
      confirmText: 'Promote',
    });
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

  if (initialLoad && loading) {
    return <FindOutLoader />;
  }

  return (
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
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setCurrentPage(1); }}
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

      {/* Users Table (dims slightly while new results load) */}
      <div
        className="rounded-xl overflow-hidden transition-opacity"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', opacity: loading ? 0.6 : 1 }}
      >
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
                          <img src={resolveImage(user.profilePicture)} alt={user.name} className="w-full h-full object-cover" />
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
                      {/* FIX: users whose status is "Later" used to be labelled "Learner" */}
                      {STATUS_LABELS[user.status] || user.status || 'Unknown'}
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
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        aria-label={`Delete ${user.name}`}
                        className="p-1.5 rounded-lg"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}
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

        {/* FIX: the table used to just be empty when nothing matched */}
        {users.length === 0 && !loading && (
          <div className="text-center py-14">
            <p className="font-semibold mb-1" style={{ color: '#f1f5f9' }}>No users found</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Try a different search or filter</p>
          </div>
        )}

        <div className="flex items-center justify-between p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Page {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="p-2 rounded-lg disabled:opacity-40"
              style={{ background: '#0a0a0f', color: 'rgba(255,255,255,0.3)' }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="p-2 rounded-lg disabled:opacity-40"
              style={{ background: '#0a0a0f', color: 'rgba(255,255,255,0.3)' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;