import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter, Users, Lock, Unlock, TrendingUp,
  Clock, Sparkles, UserPlus, CheckCircle, Menu, X, Home
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import DashSidebar from '../components/DashSidebar';
import MobileViewBar from '../components/MobileViewBar';
import MobileViewIcons from '../components/MobileViewIcons';
import FindOutLoader from '../Loader/FindOutLoader';

const ExploreGroups = () => {
  const navigate = useNavigate();

  const [suggested, setSuggested] = useState([]);
  const [popular, setPopular] = useState([]);
  const [recentlyActive, setRecentlyActive] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [subjectFilter, setSubjectFilter] = useState('all');
  const [privacyFilter, setPrivacyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showSidebar, setShowSidebar] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchGroups(); }, [subjectFilter, privacyFilter, sortBy, currentPage]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage, limit: 20, sortBy });
      if (subjectFilter !== 'all') params.append('subject', subjectFilter);
      if (privacyFilter !== 'all') params.append('isPrivate', privacyFilter);
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

  const handleJoinGroup = async (groupId, isPrivate) => {
    try {
      const response = await axiosInstance.post('/api/join-group', { groupId });
      if (response.data.success) {
        if (response.data.isPending) alert('Join request sent! Wait for admin approval.');
        else if (response.data.alreadyMember) { alert('You are already a member!'); navigate('/inbox'); }
        else { alert('Successfully joined!'); navigate('/inbox'); }
        fetchGroups();
      }
    } catch (e) {
      console.error('Error joining group:', e);
      if (e.response?.data?.isPending) alert('Your join request is already pending.');
      else alert(e.response?.data?.message || 'Failed to join group');
    }
  };

  /* ── GROUP CARD ── */
  const GroupCard = ({ group, showBadge = false }) => (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 18,
        padding: '20px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{
          width: 56, height: 56, borderRadius: 14, flexShrink: 0, overflow: 'hidden',
          background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 0 2px rgba(99,102,241,0.2)',
        }}>
          {group.groupPicture
            ? <img src={`${import.meta.env.VITE_BACKEND_URL}${group.groupPicture}`} alt={group.groupName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Users size={26} color="#fff" />
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <h3 style={{
              color: '#f1f5f9', fontWeight: 700, fontSize: 15,
              margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              letterSpacing: '-0.01em',
            }}>{group.groupName}</h3>

            {showBadge && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 99, flexShrink: 0,
                background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)',
                color: '#fbbf24', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
              }}>
                <Sparkles size={10} />SUGGESTED
              </span>
            )}
          </div>

          <p style={{
            color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: '0 0 12px', lineHeight: 1.55,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {group.description || 'No description'}
          </p>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600,
            }}>
              <Users size={11} />{group.memberCount} members
            </span>

            {group.isPrivate ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: '#fb923c',
              }}><Lock size={9} />Private</span>
            ) : (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80',
              }}><Unlock size={9} />Public</span>
            )}

            {group.subject && (
              <span style={{
                padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8',
              }}>{group.subject}</span>
            )}
          </div>

          {/* CTA */}
          {group.isMember ? (
            <button
              onClick={() => navigate('/inbox')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                color: '#60a5fa', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
            >
              <CheckCircle size={14} />Already Joined
            </button>
          ) : group.hasPendingRequest ? (
            <button disabled style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 0', borderRadius: 10, border: '1px solid rgba(234,179,8,0.2)',
              background: 'rgba(234,179,8,0.08)', color: '#fbbf24',
              fontSize: 12, fontWeight: 700, cursor: 'not-allowed', letterSpacing: '0.04em',
            }}>
              <Clock size={14} />Request Pending
            </button>
          ) : (
            <button
              onClick={() => handleJoinGroup(group._id, group.isPrivate)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <UserPlus size={14} />
              {group.isPrivate ? 'Request to Join' : 'Join Group'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  /* ── SECTION HEADER ── */
  const SectionHead = ({ icon, label, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: `rgba(${color},0.1)`, border: `1px solid rgba(${color},0.2)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>{icon}</div>
      <h2 style={{
        color: '#f1f5f9', fontWeight: 800, fontSize: 18,
        margin: 0, letterSpacing: '-0.02em',
      }}>{label}</h2>
    </div>
  );

  /* ── FILTER ROW ── */
  const selectStyle = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#f1f5f9', borderRadius: 10, fontSize: 13, outline: 'none', cursor: 'pointer',
    fontFamily: 'inherit',
  };
  const labelStyle = {
    display: 'block', fontSize: 10, fontWeight: 700,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.3)', marginBottom: 8,
  };

  return (
    <>
      <style>{`
        @keyframes eg-spin { to { transform:rotate(360deg); } }
        .eg-root { min-height:100vh; background:linear-gradient(135deg,#0f0f1a 0%,#0a0a0f 50%,#0d0d1a 100%); }
      `}</style>

      <div className="eg-root">

        {/* ── MOBILE ── */}
        <div className="lg:hidden">
          <MobileViewBar />
          <div style={{ maxWidth: 520, margin: '0 auto', padding: '80px 16px 100px' }}>

            <div style={{ marginBottom: 24 }}>
              <h1 style={{
                fontSize: 26, fontWeight: 800, margin: '0 0 4px',
                background: 'linear-gradient(135deg,#60a5fa,#a78bfa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}>Explore Groups</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                Discover communities that match your interests
              </p>
            </div>

            <GroupContent
              loading={loading} suggested={suggested} popular={popular}
              recentlyActive={recentlyActive} allGroups={allGroups}
              subjectFilter={subjectFilter} setSubjectFilter={setSubjectFilter}
              privacyFilter={privacyFilter} setPrivacyFilter={setPrivacyFilter}
              sortBy={sortBy} setSortBy={setSortBy}
              currentPage={currentPage} setCurrentPage={setCurrentPage}
              totalPages={totalPages} showFilters={showFilters} setShowFilters={setShowFilters}
              GroupCard={GroupCard} SectionHead={SectionHead}
              selectStyle={selectStyle} labelStyle={labelStyle}
            />
          </div>
          <MobileViewIcons />
        </div>

        {/* ── DESKTOP ── */}
        <div className="hidden lg:block">
          {/* Sidebar toggle — same pattern as AllPost */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            style={{
              position: 'fixed', top: 16, left: 16, zIndex: 50,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            {showSidebar ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Sidebar overlay */}
          {showSidebar && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(4px)' }}
                onClick={() => setShowSidebar(false)}
              />
              <div style={{ position: 'fixed', left: 0, top: 0, height: '100%', width: 256, zIndex: 50 }}>
                <DashSidebar />
              </div>
            </>
          )}

          {/* Main */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 900, padding: '32px 24px' }}>

              {/* Top nav bar */}
              <div style={{
                marginBottom: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '10px 16px',
              }}>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600, padding: 0,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >
                  <Home size={16} />Dashboard
                </button>

                <div>
                  <span style={{
                    fontWeight: 800, fontSize: 15,
                    background: 'linear-gradient(135deg,#60a5fa,#a78bfa)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.01em',
                  }}>Explore Groups</span>
                </div>

                <div style={{ width: 80 }} />
              </div>

              <GroupContent
                loading={loading} suggested={suggested} popular={popular}
                recentlyActive={recentlyActive} allGroups={allGroups}
                subjectFilter={subjectFilter} setSubjectFilter={setSubjectFilter}
                privacyFilter={privacyFilter} setPrivacyFilter={setPrivacyFilter}
                sortBy={sortBy} setSortBy={setSortBy}
                currentPage={currentPage} setCurrentPage={setCurrentPage}
                totalPages={totalPages} showFilters={showFilters} setShowFilters={setShowFilters}
                GroupCard={GroupCard} SectionHead={SectionHead}
                selectStyle={selectStyle} labelStyle={labelStyle}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   SHARED CONTENT (mobile + desktop)
───────────────────────────────────────────── */
const GroupContent = ({
  loading, suggested, popular, recentlyActive, allGroups,
  subjectFilter, setSubjectFilter, privacyFilter, setPrivacyFilter,
  sortBy, setSortBy, currentPage, setCurrentPage, totalPages,
  showFilters, setShowFilters, GroupCard, SectionHead,
  selectStyle, labelStyle,
}) => {
  const hasFiltersActive = subjectFilter !== 'all' || privacyFilter !== 'all' || sortBy !== 'newest';

  return (
    <div>
      {/* ── FILTER PANEL ── */}
      <div style={{
        marginBottom: 24,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '14px 18px',
            background: 'none', border: 'none', cursor: 'pointer', color: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={15} style={{ color: '#818cf8' }} />
            <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: '0.02em' }}>Filters</span>
            {hasFiltersActive && (
              <span style={{
                background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                color: '#fff', fontSize: 10, fontWeight: 700,
                padding: '2px 8px', borderRadius: 99, letterSpacing: '0.06em',
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
              fontSize: 11, fontWeight: 700, color: 'rgba(99,102,241,0.7)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '4px 8px',
            }}
          >Reset</button>
        </button>

        {showFilters && (
          <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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
                <select value={privacyFilter} onChange={(e) => { setPrivacyFilter(e.target.value); setCurrentPage(1); }} style={selectStyle}>
                  <option value="all" style={{ background: '#1a1a2e' }}>All Groups</option>
                  <option value="false" style={{ background: '#1a1a2e' }}>Public Only</option>
                  <option value="true" style={{ background: '#1a1a2e' }}>Private Only</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Sort By</label>
                <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }} style={selectStyle}>
                  <option value="newest" style={{ background: '#1a1a2e' }}>Newest First</option>
                  <option value="popular" style={{ background: '#1a1a2e' }}>Most Popular</option>
                  <option value="active" style={{ background: '#1a1a2e' }}>Recently Active</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── LOADING ── */}
      {loading && allGroups.length === 0 ? (
        <FindOutLoader />
      ) : (
        <>
          {/* Suggested */}
          {suggested.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionHead icon={<Sparkles size={16} color="#fbbf24" />} label="Suggested for You" color="234,179,8" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
                {suggested.map(g => <GroupCard key={g._id} group={g} showBadge />)}
              </div>
            </div>
          )}

          {/* Popular */}
          {popular.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionHead icon={<TrendingUp size={16} color="#4ade80" />} label="Popular Groups" color="34,197,94" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
                {popular.slice(0, 4).map(g => <GroupCard key={g._id} group={g} />)}
              </div>
            </div>
          )}

          {/* Recently Active */}
          {recentlyActive.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionHead icon={<Clock size={16} color="#60a5fa" />} label="Recently Active" color="99,102,241" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
                {recentlyActive.slice(0, 4).map(g => <GroupCard key={g._id} group={g} />)}
              </div>
            </div>
          )}

          {/* All Groups */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 18, margin: 0, letterSpacing: '-0.02em' }}>All Groups</h2>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>{allGroups.length} groups</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
              {allGroups.map(g => <GroupCard key={g._id} group={g} />)}
            </div>
          </div>

          {/* Empty */}
          {allGroups.length === 0 && !loading && (
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20, padding: '60px 32px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18, margin: '0 0 8px' }}>No groups found</h3>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: 0 }}>Try adjusting your filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 32 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '9px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)', color: currentPage === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                }}
              >← Prev</button>

              <span style={{
                fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600,
                padding: '9px 16px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10,
              }}>
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '9px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)', color: currentPage === totalPages ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                }}
              >Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExploreGroups;