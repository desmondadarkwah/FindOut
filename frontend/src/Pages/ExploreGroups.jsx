import React, { useState, useEffect, useRef } from 'react';
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
   Renders only the layout that matches the screen size.
   FIX: the page used to render BOTH the mobile and desktop layouts at once
   and hide one with CSS, so everything (cards, loader, filters) was in the
   DOM twice. Now only one is mounted.
───────────────────────────────────────────── */
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia('(min-width: 1024px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
};

// Works whether the backend stores "/uploads/x.png", "x.png" or a full URL
const resolveImage = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `${import.meta.env.VITE_BACKEND_URL}${path}`;
  return `${import.meta.env.VITE_BACKEND_URL}/uploads/${path}`;
};

/* ─────────────────────────────────────────────
   MODULE-SCOPE PRESENTATIONAL PIECES

   These are declared once at module scope (not inside the page component)
   so React doesn't remount every card on each render.
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

// FIX: <option> backgrounds were hard-coded dark (#0a0a0f), which made the
// text unreadable in the light theme. They now follow the theme.
const optionStyle = { background: 'var(--bg-primary)', color: 'var(--text-primary)' };

// Group picture with a fallback so a missing/broken file shows the default
// icon instead of a broken-image symbol.
const GroupAvatar = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <Users size={22} color="var(--text-secondary)" />;
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
};

// Private = primary (indigo), Public = secondary (blue)
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

const JoinButton = ({ group, onJoin, onOpen }) => {
  // FIX: "Already Joined" had no text color (default black text on a dark
  // page), a hard-coded dark border and no real hover. It now uses theme colors.
  if (group.isMember) return (
    <button
      onClick={onOpen}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '9px 0', borderRadius: 10, cursor: 'pointer',
        border: '1px solid var(--border)',
        background: 'var(--bg-card-hover)',
        color: 'var(--text-secondary)',
        fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
        transition: 'background 0.2s, color 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
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
        <GroupAvatar
          src={resolveImage(group.groupPicture || group.groupProfile)}
          alt={group.groupName}
        />
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

// FIX: minmax(340px, 1fr) forced a 340px minimum column, which is wider than
// a small phone's content area and caused sideways scrolling. min(340px, 100%)
// lets the column shrink to fit.
const cardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
  gap: 14,
};

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

  // FIX: the subject box used to fire a server request on every single
  // keystroke. It now keeps what you type locally and only applies the
  // filter ~400ms after you stop typing.
  const [subjectInput, setSubjectInput] = useState(subjectFilter === 'all' ? '' : subjectFilter);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = subjectInput.trim() || 'all';
      if (next !== subjectFilter) {
        setSubjectFilter(next);
        setCurrentPage(1);
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectInput]);

  return (
    <div>
      {/* FILTER PANEL */}
      <div style={{
        marginBottom: 24,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        {/* FIX: the Reset button used to be nested INSIDE the toggle button
            (a button inside a button is invalid HTML and React warns about
            it). They are now siblings. */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', gap: 8,
        }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-primary)', padding: 0, textAlign: 'left',
            }}
          >
            <Filter size={15} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Filters</span>
            {hasFiltersActive && (
              <span style={{
                background: '#6366f1',
                color: '#fff', fontSize: 10, fontWeight: 600,
                padding: '2px 8px', borderRadius: 99, letterSpacing: '0.04em',
              }}>ACTIVE</span>
            )}
          </button>
          <button
            onClick={() => {
              setSubjectInput('');
              setSubjectFilter('all'); setPrivacyFilter('all'); setSortBy('newest'); setCurrentPage(1);
            }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: 11, fontWeight: 600,
              letterSpacing: '0.04em', textTransform: 'uppercase', padding: '4px 8px',
            }}
          >Reset</button>
        </div>

        {showFilters && (
          <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)' }}>
            {/* FIX: three fixed columns were too cramped on phones; now wraps */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 14 }}>
              <div>
                <label style={labelStyle}>Subject</label>
                <input
                  type="text"
                  placeholder="Any subject…"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
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
                  <option value="all"     style={optionStyle}>All Groups</option>
                  <option value="public"  style={optionStyle}>Public Only</option>
                  <option value="private" style={optionStyle}>Private Only</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                  style={selectStyle}
                >
                  <option value="newest"  style={optionStyle}>Newest First</option>
                  <option value="popular" style={optionStyle}>Most Popular</option>
                  <option value="active"  style={optionStyle}>Recently Active</option>
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
              <div style={cardGrid}>
                {suggested.map(g => <GroupCard key={g._id} group={g} showBadge onJoin={onJoin} onOpen={onOpen} />)}
              </div>
            </div>
          )}

          {/* Popular */}
          {popular.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionHead icon={<TrendingUp size={16} color="var(--text-secondary)" />} label="Popular Groups" />
              <div style={cardGrid}>
                {popular.slice(0, 4).map(g => <GroupCard key={g._id} group={g} onJoin={onJoin} onOpen={onOpen} />)}
              </div>
            </div>
          )}

          {/* Recently Active */}
          {recentlyActive.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionHead icon={<Clock size={16} color="var(--text-secondary)" />} label="Recently Active" />
              <div style={cardGrid}>
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
            <div style={cardGrid}>
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
  const isDesktop = useIsDesktop();

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

  // FIX: if you changed filters quickly, an older slower response could
  // arrive AFTER a newer one and overwrite it with stale results. Each
  // request now gets an id and only the latest one is allowed to update the page.
  const requestIdRef = useRef(0);

  useEffect(() => { fetchGroups(); }, [subjectFilter, privacyFilter, sortBy, currentPage]);

  // Jump back to the top when you change page, so you don't stay at the
  // bottom of the list looking at the new page's last cards.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const fetchGroups = async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage, limit: 20, sortBy });
      if (subjectFilter !== 'all') params.append('subject', subjectFilter);
      if (privacyFilter !== 'all') params.append('privacy', privacyFilter);
      const response = await axiosInstance.get(`/api/explore/groups?${params}`);
      if (requestId !== requestIdRef.current) return; // a newer request replaced this one
      if (response.data.success) {
        setSuggested(response.data.suggested || []);
        setPopular(response.data.popular || []);
        setRecentlyActive(response.data.recentlyActive || []);
        setAllGroups(response.data.allGroups || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (e) { console.error('Error fetching groups:', e); }
    finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const response = await axiosInstance.post('/api/join-group', { groupId });
      if (response.data.success) {
        if (response.data.isPending) {
          toast.info('Wait for admin approval.', 'Join request sent');
          fetchGroups();
        } else if (response.data.alreadyMember) {
          toast.info('You are already a member.', 'Already Joined');
          navigate('/inbox');
        } else {
          toast.success('You joined the group!', 'Successfully joined');
          navigate('/inbox');
        }
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

      {/* MOBILE (only rendered below 1024px) */}
      {!isDesktop && (
        <div>
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
      )}

      {/* DESKTOP (only rendered at 1024px and up) */}
      {isDesktop && (
        <div>
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
      )}
    </div>
  );
};

export default ExploreGroups;