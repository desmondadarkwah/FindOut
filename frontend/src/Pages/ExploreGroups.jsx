import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter, Users, Lock, Unlock, TrendingUp,
  Clock, Sparkles, UserPlus, CheckCircle, Home,
  ChevronLeft, ChevronRight, Search
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import DashSidebar from '../components/DashSidebar';
import MobileViewBar from '../components/MobileViewBar';
import MobileViewIcons from '../components/MobileViewIcons';
import FindOutLoader from '../Loader/FindOutLoader';
import { useToast } from '../Context/ToastContext';

/* ─────────────────────────────────────────────
   MODULE-SCOPE PRESENTATIONAL PIECES

   FIX: these (PrivacyBadge, JoinButton, GroupCard, SectionHead) used to be
   declared *inside* the ExploreGroups component body, then passed down as
   props to GroupContent. A component declared inside another component's
   body gets a brand-new function identity every render, so React treats
   it as a completely different component type each time — it tears down
   and remounts the whole subtree instead of just updating it. Every filter
   change, page change, or sidebar toggle was silently remounting every
   group card on screen. Same root cause as the flashing bug fixed earlier
   in AllPost.jsx. Declaring them here, once, at module scope fixes it.
───────────────────────────────────────────── */

const selectStyle = {
  width: '100%', padding: '10px 14px',
  background: 'var(--bg-primary)', border: '1px solid var(--border)',
  color: 'var(--text-primary)', borderRadius: 10, fontSize: 13, outline: 'none', cursor: 'pointer',
  fontFamily: 'inherit',
};

const labelStyle = {
  display: 'block', fontSize: 10, fontWeight: 600,
  letterSpacing: '0.1em', textTransform: 'uppercase',
  color: 'var(--text-muted)', marginBottom: 8,
};

// Private = primary (indigo), Public = secondary (blue) — matches the same
// badge convention already used for group privacy in ManageGroup.jsx.
const PrivacyBadge = ({ privacy }) => {
  if (privacy === 'private') return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600,
      background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8',
    }}>
      <Lock size={9} />Private
    </span>
  );

  if (privacy === 'public') return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600,
      background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa',
    }}>
      <Unlock size={9} />Public
    </span>
  );

  // Secret groups never appear here but just in case
  return null;
};

// Already joined = success (green, "you're in"). Pending = warning (amber,
// matches the amber "Request Pending" state it leads into). Join/Request =
// one consistent brand color — the two flows are distinguished by icon and
// label, not by inventing a second CTA color.
const JoinButton = ({ group, onJoin, onOpen }) => {
  if (group.isMember) return (
    <button
      onClick={onOpen}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '9px 0', borderRadius: 10, cursor: 'pointer',
        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
        color: '#4ade80', fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.18)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}
    >
      <CheckCircle size={14} />Already Joined
    </button>
  );

  if (group.hasPendingRequest) return (
    <button disabled style={{
      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      padding: '9px 0', borderRadius: 10, border: '1px solid rgba(234,179,8,0.25)',
      background: 'rgba(234,179,8,0.08)', color: '#eab308',
      fontSize: 12, fontWeight: 600, cursor: 'not-allowed', letterSpacing: '0.02em',
    }}>
      <Clock size={14} />Request Pending
    </button>
  );

  return (
    <button
      onClick={() => onJoin(group._id)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
        background: '#6366f1',
        color: '#fff', fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
        transition: 'opacity 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <UserPlus size={14} />
      {group.privacy === 'private' ? 'Request to Join' : 'Join Group'}
    </button>
  );
};

const GroupCard = ({ group, showBadge = false, onJoin, onOpen }) => (
  <div
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 14, padding: '20px',
      transition: 'border-color 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
  >
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      {/* Avatar */}
      <div style={{
        width: 52, height: 52, borderRadius: 12, flexShrink: 0, overflow: 'hidden',
        background: 'var(--bg-card-hover)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {group.groupPicture
          ? <img src={`${import.meta.env.VITE_BACKEND_URL}${group.groupPicture}`} alt={group.groupName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Users size={22} color="var(--text-secondary)" />
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <h3 style={{
            color: 'var(--text-primary)', fontWeight: 600, fontSize: 15,
            margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{group.groupName}</h3>

          {showBadge && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 99, flexShrink: 0,
              background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)',
              color: '#eab308', fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
            }}>
              <Sparkles size={10} />SUGGESTED
            </span>
          )}
        </div>

        <p style={{
          color: 'var(--text-secondary)', fontSize: 12, margin: '0 0 12px', lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {group.description || 'No description'}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500,
          }}>
            <Users size={11} />{group.memberCount} members
          </span>

          <PrivacyBadge privacy={group.privacy} />

          {group.subject && (
            <span style={{
              padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600,
              background: 'var(--bg-card-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
            }}>{group.subject}</span>
          )}
        </div>

        <JoinButton group={group} onJoin={onJoin} onOpen={onOpen} />
      </div>
    </div>
  </div>
);

// One consistent chip style for every section head instead of a different
// color per section (amber / green / indigo) — the icon and label carry
// the distinction, the color doesn't need to change with it.
const SectionHead = ({ icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
    <div style={{
      width: 30, height: 30, borderRadius: 8,
      background: 'var(--bg-card-hover)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>{icon}</div>
    <h2 style={{
      color: 'var(--text-primary)', fontWeight: 600, fontSize: 17,
      margin: 0,
    }}>{label}</h2>
  </div>
);

/* ─────────────────────────────────────────────
   SHARED CONTENT
───────────────────────────────────────────── */
const GroupContent = ({
  loading, suggested, popular, recentlyActive, allGroups,
  subjectFilter, setSubjectFilter, privacyFilter, setPrivacyFilter,
  sortBy, setSortBy, currentPage, setCurrentPage, totalPages,
  showFilters, setShowFilters, onJoin, onOpen,
}) => {
  const hasFiltersActive = subjectFilter !== 'all' || privacyFilter !== 'all' || sortBy !== 'newest';

  return (
    <div>
      {/* FILTER PANEL */}
      <div style={{
        marginBottom: 24,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '14px 18px',
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={15} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Filters</span>
            {hasFiltersActive && (
              <span style={{
                background: '#6366f1',
                color: '#fff', fontSize: 10, fontWeight: 600,
                padding: '2px 8px', borderRadius: 99, letterSpacing: '0.04em',
              }}>ACTIVE</span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSubjectFilter('all'); setPrivacyFilter('all'); setSortBy('newest'); setCurrentPage(1);
            }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: 600, color: '#818cf8',
              letterSpacing: '0.04em', textTransform: 'uppercase', padding: '4px 8px',
            }}
          >Reset</button>
        </button>

        {showFilters && (
          <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 14 }}>
              <div>
                <label style={labelStyle}>Subject</label>
                <input
                  type="text"
                  placeholder="Any subject…"
                  value={subjectFilter === 'all' ? '' : subjectFilter}
                  onChange={(e) => { setSubjectFilter(e.target.value || 'all'); setCurrentPage(1); }}
                  style={{ ...selectStyle }}
                />
              </div>
              <div>
                <label style={labelStyle}>Privacy</label>
                <select
                  value={privacyFilter}
                  onChange={(e) => { setPrivacyFilter(e.target.value); setCurrentPage(1); }}
                  style={selectStyle}
                >
                  <option value="all"     style={{ background: '#0a0a0f' }}>All Groups</option>
                  <option value="public"  style={{ background: '#0a0a0f' }}>Public Only</option>
                  <option value="private" style={{ background: '#0a0a0f' }}>Private Only</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                  style={selectStyle}
                >
                  <option value="newest"  style={{ background: '#0a0a0f' }}>Newest First</option>
                  <option value="popular" style={{ background: '#0a0a0f' }}>Most Popular</option>
                  <option value="active"  style={{ background: '#0a0a0f' }}>Recently Active</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LOADING */}
      {loading && allGroups.length === 0 ? (
        <FindOutLoader />
      ) : (
        <>
          {/* Suggested */}
          {suggested.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionHead icon={<Sparkles size={16} color="var(--text-secondary)" />} label="Suggested for You" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
                {suggested.map(g => <GroupCard key={g._id} group={g} showBadge onJoin={onJoin} onOpen={onOpen} />)}
              </div>
            </div>
          )}

          {/* Popular */}
          {popular.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionHead icon={<TrendingUp size={16} color="var(--text-secondary)" />} label="Popular Groups" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
                {popular.slice(0, 4).map(g => <GroupCard key={g._id} group={g} onJoin={onJoin} onOpen={onOpen} />)}
              </div>
            </div>
          )}

          {/* Recently Active */}
          {recentlyActive.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionHead icon={<Clock size={16} color="var(--text-secondary)" />} label="Recently Active" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
                {recentlyActive.slice(0, 4).map(g => <GroupCard key={g._id} group={g} onJoin={onJoin} onOpen={onOpen} />)}
              </div>
            </div>
          )}

          {/* All Groups */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 17, margin: 0 }}>
                All Groups
              </h2>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                {allGroups.length} groups
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
              {allGroups.map(g => <GroupCard key={g._id} group={g} onJoin={onJoin} onOpen={onOpen} />)}
            </div>
          </div>

          {/* Empty */}
          {allGroups.length === 0 && !loading && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '60px 32px', textAlign: 'center',
            }}>
              <Search size={28} color="var(--text-muted)" style={{ marginBottom: 12 }} />
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 16, margin: '0 0 6px' }}>No groups found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>Try adjusting your filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 32 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', borderRadius: 10, border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: 13, fontWeight: 500, transition: 'color 0.2s',
                }}
              ><ChevronLeft size={14} />Prev</button>

              <span style={{
                fontSize: 12, color: 'var(--text-muted)', fontWeight: 500,
                padding: '9px 16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)', borderRadius: 10,
              }}>
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', borderRadius: 10, border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-secondary)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: 13, fontWeight: 500, transition: 'color 0.2s',
                }}
              >Next<ChevronRight size={14} /></button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
const ExploreGroups = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [suggested, setSuggested] = useState([]);
  const [popular, setPopular] = useState([]);
  const [recentlyActive, setRecentlyActive] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [subjectFilter, setSubjectFilter] = useState('all');
  const [privacyFilter, setPrivacyFilter] = useState('all'); // 'all' | 'public' | 'private'
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchGroups(); }, [subjectFilter, privacyFilter, sortBy, currentPage]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage, limit: 20, sortBy });
      if (subjectFilter !== 'all') params.append('subject', subjectFilter);
      if (privacyFilter !== 'all') params.append('privacy', privacyFilter);
      const response = await axiosInstance.get(`/api/explore/groups?${params}`);
      if (response.data.success) {
        setSuggested(response.data.suggested || []);
        setPopular(response.data.popular || []);
        setRecentlyActive(response.data.recentlyActive || []);
        setAllGroups(response.data.allGroups || []);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (e) { console.error('Error fetching groups:', e); }
    finally { setLoading(false); }
  };

  // FIX: replaced every alert() with toast, matching the rest of the app
  // (Suggestions.jsx, ManageGroup.jsx, etc. all use useToast — this page
  // was the odd one out still using native browser alerts).
  const handleJoinGroup = async (groupId) => {
    try {
      const response = await axiosInstance.post('/api/join-group', { groupId });
      if (response.data.success) {
        if (response.data.isPending) {
          toast.info('Wait for admin approval.', 'Join request sent');
        } else if (response.data.alreadyMember) {
          toast.info('You are already a member.', 'Already Joined');
          navigate('/inbox');
        } else {
          toast.success('You joined the group!', 'Successfully joined');
          navigate('/inbox');
        }
        fetchGroups();
      }
    } catch (e) {
      console.error('Error joining group:', e);
      if (e.response?.data?.isPending) {
        toast.info('Your join request is already pending.');
      } else {
        toast.error(e.response?.data?.message || 'Failed to join group');
      }
    }
  };

  const handleOpenGroup = () => navigate('/inbox');

  const contentProps = {
    loading, suggested, popular, recentlyActive, allGroups,
    subjectFilter, setSubjectFilter,
    privacyFilter, setPrivacyFilter,
    sortBy, setSortBy,
    currentPage, setCurrentPage, totalPages,
    showFilters, setShowFilters,
    onJoin: handleJoinGroup, onOpen: handleOpenGroup,
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">

      {/* MOBILE */}
      <div className="lg:hidden">
        <MobileViewBar />
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '80px 16px 100px' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
              Explore Groups
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              Discover communities that match your interests
            </p>
          </div>
          <GroupContent {...contentProps} />
        </div>
        <MobileViewIcons />
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:block">
        {/*
          FIX: this used to render its own sidebar-toggle button, its own
          backdrop, and a fixed-position wrapper around <DashSidebar />.
          DashSidebar now manages its own open/close state and toggle
          button internally (see DashSidebar.jsx) — this duplicate
          scaffolding would have rendered a second, conflicting toggle
          button on top of DashSidebar's own one. It's now rendered plainly,
          the same way Dashboard.jsx does.
        */}
        <DashSidebar />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 900, padding: '32px 24px' }}>
            <div style={{
              marginBottom: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12, padding: '10px 16px',
            }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, padding: 0,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <Home size={16} />Dashboard
              </button>
              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                Explore Groups
              </span>
              <div style={{ width: 80 }} />
            </div>

            <GroupContent {...contentProps} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreGroups;