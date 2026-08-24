import React, { useState, useEffect, useRef, useContext } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, User, Clock, BookOpen, Filter, Home, ChevronDown, TrendingUp, Plus, Award, Sparkles, Flame, Compass, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import MobileViewIcons from '../components/MobileViewIcons';
import MobileViewBar from '../components/MobileViewBar';
import PostComment from './PostComment';
import PostSettings from './PostSettings';
import { usePostContext } from '../Context/PostContext';
import { ChatContext } from '../Context/ChatContext';
import FindOutLoader from '../Loader/FindOutLoader';

const AllPost = () => {
  const { posts, postsLoading, postsError, fetchPosts, markHelpful, formatTimeAgo } = usePostContext();
  const { setSelectedChat, setChats, userId } = useContext(ChatContext);
  const navigate = useNavigate();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeCommentModal, setActiveCommentModal] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [postTypeFilter, setPostTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const dropdownRef = useRef(null);

  const uniqueSubjects = ['all', ...new Set(posts.map(p => p.subject).filter(Boolean))];

  const postTypeOptions = [
    { value: 'all', label: 'All', icon: '📝' },
    { value: 'resource', label: 'Resources', icon: '📚' },
    { value: 'help', label: 'Help', icon: '❓' },
    { value: 'explanation', label: 'Explanations', icon: '💡' },
    { value: 'challenge', label: 'Challenges', icon: '🎯' },
    { value: 'general', label: 'General', icon: '📋' },
  ];

  const sortOptions = [
    { value: 'recent', label: 'Recent', icon: Clock },
    { value: 'top', label: 'Top', icon: Flame },
    { value: 'discussed', label: 'Discussed', icon: MessageCircle },
  ];

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setActiveDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkHelpful = async (postId) => {
    try { await markHelpful(postId); }
    catch (e) { console.error('Error marking helpful:', e); }
  };

  const handleAuthorClick = async (authorId) => {
    if (authorId === userId) { alert("That's you!"); return; }
    try {
      const response = await axiosInstance.post("/api/start-new-chat", { userIdToChat: authorId });
      const newChatId = response.data.chat._id;

      const allChatsResponse = await axiosInstance.get('/api/chats');
      const allChats = allChatsResponse.data.chats;
      const fullChat = allChats.find(chat => chat._id === newChatId);

      if (fullChat) {
        setSelectedChat(fullChat);
        setChats(prev => prev.some(c => c._id === fullChat._id) ? prev : [...prev, fullChat]);
        navigate("/inbox");
      }
    } catch (e) {
      if (e.response?.data?.isBlocked) { alert(e.response.data.message); return; }
      console.error("Error starting chat:", e);
      alert('Failed to start chat');
    }
  };

  const toggleDropdown = (postId) => setActiveDropdown(activeDropdown === postId ? null : postId);
  const handleCloseDropdown = () => setActiveDropdown(null);
  const handleOpenComments = (postId) => setActiveCommentModal(postId);
  const handleCloseComments = () => setActiveCommentModal(null);

  const filteredPosts = posts.filter(post => {
    const matchesSubject = subjectFilter === 'all' || post.subject === subjectFilter;
    const matchesType = postTypeFilter === 'all' || post.postType === postTypeFilter;
    return matchesSubject && matchesType;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'discussed') return (b.commentCount || 0) - (a.commentCount || 0);
    if (sortBy === 'top') return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Right rail data
  const trendingSubjects = Object.entries(
    posts.reduce((acc, p) => { if (p.subject) acc[p.subject] = (acc[p.subject] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const topContributors = Object.values(
    posts.reduce((acc, p) => {
      const a = p.author;
      if (!a?._id) return acc;
      if (!acc[a._id]) acc[a._id] = { ...a, postCount: 0 };
      acc[a._id].postCount += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.postCount - a.postCount).slice(0, 5);

  const communityStats = {
    posts: posts.length,
    helpful: posts.reduce((s, p) => s + (p.helpfulCount || 0), 0),
    comments: posts.reduce((s, p) => s + (p.commentCount || 0), 0),
    subjects: new Set(posts.map(p => p.subject).filter(Boolean)).size,
  };

  const getPostTypeBadge = (type) => {
    // Match dashboard vibe: keep it subtle like the gray/blue-glow style there
    const badges = {
      resource: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', color: '#60a5fa', label: '📚 Resource' },
      help: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', color: '#818cf8', label: '❓ Help' },
      explanation: { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', color: '#a78bfa', label: '💡 Explanation' },
      challenge: { bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.22)', color: '#93c5fd', label: '🎯 Challenge' },
      general: { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.55)', label: '📝 General' },
    };
    return badges[type] || badges.general;
  };

  if (postsLoading) return <FindOutLoader />;

  if (postsError) return (
    <div style={{ minHeight: '100vh' }} className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen">
      <div style={{ textAlign: 'center', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div>
          <p style={{ color: '#f87171', marginBottom: 16 }}>{postsError}</p>
          <button
            onClick={() => fetchPosts()}
            style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  // Dashboard-matching card idea (gray panels + subtle borders/glow)
  const card = {
    background: 'rgba(31,41,55,0.35)',        // ~ gray-800/50 vibe
    border: '1px solid rgba(55,65,81,0.60)', // ~ gray-700/50 vibe
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
    backdropFilter: 'blur(6px)',
  };

  /* ─────────────────────────────────────────
     LEFT RAIL
  ───────────────────────────────────────── */
  const LeftRail = () => (
    <aside style={{
      position: 'sticky', top: 24,
      maxHeight: 'calc(100vh - 48px)', overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ ...card, padding: '20px 18px' }}>
        <h1 style={{
          fontSize: 22, fontWeight: 800, margin: '0 0 4px',
          background: 'linear-gradient(135deg,#60a5fa,#a78bfa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
        }}>FindOut</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.5 }}>
          Share knowledge · Ask questions · Help others learn
        </p>
      </div>

      <button
        onClick={() => navigate('/add-post')}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
          color: '#fff', fontWeight: 800, fontSize: 14,
          boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
          transition: 'opacity 0.2s, transform 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
      >
        <Plus size={17} /> Create Post
      </button>

      <nav style={{ ...card, padding: 8 }}>
        {[
          { label: 'Home', icon: Home, to: '/dashboard' },
          { label: 'Feed', icon: Sparkles, to: '/feed', active: true },
          { label: 'Chats', icon: MessageCircle, to: '/inbox' },
          { label: 'Explore', icon: Compass, to: '/explore-groups' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                background: item.active ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: item.active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                width: '100%', textAlign: 'left',
                color: item.active ? '#a5b4fc' : 'rgba(255,255,255,0.55)',
                fontSize: 14, fontWeight: item.active ? 800 : 600,
                transition: 'all 0.15s', marginBottom: 2,
              }}
              onMouseEnter={e => {
                if (!item.active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff'; }
              }}
              onMouseLeave={e => {
                if (!item.active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }
              }}
            >
              <Icon size={17} /> {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );

  /* ─────────────────────────────────────────
     RIGHT RAIL
  ───────────────────────────────────────── */
  const RightRail = () => (
    <aside style={{
      position: 'sticky', top: 24,
      maxHeight: 'calc(100vh - 48px)', overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Community Pulse */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <TrendingUp size={15} color="#818cf8" />
          <span style={{ fontWeight: 800, fontSize: 13, color: '#f1f5f9' }}>Community Pulse</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Posts', value: communityStats.posts, icon: '✨' },
            { label: 'Subjects', value: communityStats.subjects, icon: '📚' },
            { label: 'Helpful', value: communityStats.helpful, icon: '💙' },
            { label: 'Comments', value: communityStats.comments, icon: '💬' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.12)',
              borderRadius: 12, padding: 12,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3, fontWeight: 700 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {trendingSubjects.length > 0 && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Flame size={15} color="#60a5fa" />
            <span style={{ fontWeight: 800, fontSize: 13, color: '#f1f5f9' }}>Trending Subjects</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {trendingSubjects.map(([subject, count], i) => (
              <button
                key={subject}
                onClick={() => setSubjectFilter(subject)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: 8, cursor: 'pointer', width: '100%',
                  border: 'none', textAlign: 'left', transition: 'background 0.15s',
                  background: subjectFilter === subject ? 'rgba(99,102,241,0.12)' : 'transparent',
                  color: 'rgba(255,255,255,0.85)',
                }}
                onMouseEnter={e => { if (subjectFilter !== subject) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (subjectFilter !== subject) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.25)', width: 14 }}>{i + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: subjectFilter === subject ? '#a5b4fc' : 'rgba(255,255,255,0.65)' }}>
                    #{subject}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', fontWeight: 700 }}>
                  {count} {count === 1 ? 'post' : 'posts'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {topContributors.length > 0 && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Award size={15} color="#a5b4fc" />
            <span style={{ fontWeight: 800, fontSize: 13, color: '#f1f5f9' }}>Top Contributors</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topContributors.map(c => (
              <button
                key={c._id}
                onClick={() => handleAuthorClick(c._id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'none', border: 'none', cursor: 'pointer',
                  width: '100%', textAlign: 'left', padding: '6px 6px',
                  borderRadius: 10, transition: 'background 0.15s',
                  color: '#fff',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  boxShadow: '0 0 0 2px rgba(99,102,241,0.18)',
                }}>
                  {c.profilePicture
                    ? <img src={`${import.meta.env.VITE_BACKEND_URL}${c.profilePicture}`} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <User size={15} color="#fff" />}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </span>
                    {c.isVerified && <span style={{ fontSize: 10, color: '#60a5fa', flexShrink: 0, fontWeight: 900 }}>✓</span>}
                  </div>

                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>
                    {c.postCount} {c.postCount === 1 ? 'post' : 'posts'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );

  /* ─────────────────────────────────────────
     CENTER FEED
  ───────────────────────────────────────── */
  const PostsList = () => (
    <div>
      {/* Sort Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 14,
        background: 'rgba(31,41,55,0.35)',
        border: '1px solid rgba(55,65,81,0.60)',
        borderRadius: 14, padding: 5,
        backdropFilter: 'blur(6px)',
      }}>
        {sortOptions.map(opt => {
          const Icon = opt.icon;
          const active = sortBy === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 8px', borderRadius: 10, cursor: 'pointer',
                fontSize: 13, fontWeight: 900, border: 'none', transition: 'all 0.2s',
                background: active ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                boxShadow: active ? '0 2px 10px rgba(99,102,241,0.25)' : 'none',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
            >
              <Icon size={14} />{opt.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{
        marginBottom: 20,
        background: 'rgba(31,41,55,0.35)',
        border: '1px solid rgba(55,65,81,0.60)',
        borderRadius: 14, overflow: 'hidden',
        backdropFilter: 'blur(6px)',
      }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '12px 16px',
            background: 'none', border: 'none', cursor: 'pointer', color: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={14} style={{ color: '#818cf8' }} />
            <span style={{ fontWeight: 900, fontSize: 13 }}>Filters</span>
            {(subjectFilter !== 'all' || postTypeFilter !== 'all') && (
              <span style={{
                background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                color: '#fff', fontSize: 9, fontWeight: 900,
                padding: '2px 7px', borderRadius: 99,
              }}>ACTIVE</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 800 }}>
              {sortedPosts.length} posts
            </span>
            <ChevronDown
              size={14}
              style={{
                color: 'rgba(255,255,255,0.30)',
                transform: showFilters ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          </div>
        </button>

        {showFilters && (
          <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ marginTop: 12 }}>
              <label style={{
                display: 'block', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)', marginBottom: 8
              }}>
                Subject
              </label>

              <select
                value={subjectFilter}
                onChange={e => setSubjectFilter(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px',
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff', borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer',
                }}
              >
                {uniqueSubjects.map(s => (
                  <option key={s} value={s} style={{ background: '#1a1a2e' }}>
                    {s === 'all' ? 'All Subjects' : s}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{
                display: 'block', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)', marginBottom: 8
              }}>
                Post Type
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                {postTypeOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPostTypeFilter(opt.value)}
                    style={{
                      padding: '7px 4px', borderRadius: 8, fontSize: 11, fontWeight: 800,
                      cursor: 'pointer', transition: 'all 0.15s',
                      border: postTypeFilter === opt.value ? '1px solid rgba(99,102,241,0.40)' : '1px solid rgba(255,255,255,0.08)',
                      background: postTypeFilter === opt.value ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)',
                      color: postTypeFilter === opt.value ? '#a5b4fc' : 'rgba(255,255,255,0.45)',
                    }}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Posts */}
      {sortedPosts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sortedPosts.map(post => {
            const badge = getPostTypeBadge(post.postType);

            return (
              <article
                key={post._id}
                style={{
                  background: 'rgba(31,41,55,0.35)',
                  border: '1px solid rgba(55,65,81,0.60)',
                  borderRadius: 18, overflow: 'hidden',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  backdropFilter: 'blur(6px)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(55,65,81,0.60)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Post Header */}
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, overflow: 'hidden',
                      boxShadow: '0 0 0 2px rgba(99,102,241,0.15)',
                    }}>
                      {post.author?.profilePicture
                        ? <img src={`${import.meta.env.VITE_BACKEND_URL}${post.author.profilePicture}`} alt={post.author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <User size={16} color="#fff" />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={() => handleAuthorClick(post.author?._id)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#f1f5f9', fontWeight: 900, fontSize: 14,
                            padding: 0, transition: 'color 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
                          onMouseLeave={e => e.currentTarget.style.color = '#f1f5f9'}
                        >
                          {post.author?.name || 'Anonymous'}
                        </button>

                        {post.author?.isVerified && (
                          <span style={{
                            fontSize: 10, fontWeight: 900,
                            background: 'rgba(59,130,246,0.12)',
                            color: '#60a5fa',
                            border: '1px solid rgba(59,130,246,0.2)',
                            padding: '1px 6px', borderRadius: 99,
                          }}>✓ Verified</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <Clock size={10} color="rgba(255,255,255,0.25)" />
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 700 }}>
                          {formatTimeAgo(post.createdAt)}
                        </span>
                        {post.author?.reputation > 0 && (
                          <>
                            <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                            <span style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 900 }}>
                              ⭐ {post.author.reputation}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <button
                      onClick={() => toggleDropdown(post._id)}
                      style={{
                        background: 'none',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 8, cursor: 'pointer', padding: '5px 7px',
                        color: 'rgba(255,255,255,0.35)', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                    >
                      <MoreVertical size={15} />
                    </button>

                    {activeDropdown === post._id && (
                      <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 50 }}>
                        <PostSettings postId={post._id} authorId={post.author?._id} onClose={handleCloseDropdown} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div style={{ padding: '0 16px 10px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 900, padding: '3px 10px', borderRadius: 99,
                    background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color,
                  }}>{badge.label}</span>

                  {post.subject && (
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.40)',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <BookOpen size={10} />{post.subject}
                    </span>
                  )}
                </div>

                {/* Image */}
                {post.image && (
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}/${post.image}`}
                      alt="Post"
                      style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: 50,
                      background: 'linear-gradient(to top, rgba(10,10,20,0.7), transparent)',
                      pointerEvents: 'none',
                    }} />
                  </div>
                )}

                {/* Caption */}
                {post.caption && (
                  <div style={{ padding: '12px 16px 4px' }}>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.70)', lineHeight: 1.6, margin: 0 }}>
                      <span style={{ fontWeight: 900, color: '#f1f5f9', marginRight: 6 }}>{post.author?.name}</span>
                      {post.caption}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div style={{ padding: '10px 16px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* Helpful */}
                  <button
                    onClick={() => handleMarkHelpful(post._id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 99, cursor: 'pointer',
                      border: post.isHelpful ? '1px solid rgba(59,130,246,0.45)' : '1px solid rgba(255,255,255,0.08)',
                      background: post.isHelpful ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                      color: post.isHelpful ? '#60a5fa' : 'rgba(255,255,255,0.45)',
                      fontSize: 12, fontWeight: 900, transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (!post.isHelpful) {
                        e.currentTarget.style.borderColor = 'rgba(59,130,246,0.30)';
                        e.currentTarget.style.color = '#60a5fa';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!post.isHelpful) {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                      }
                    }}
                  >
                    <Heart size={13} style={{ fill: post.isHelpful ? '#60a5fa' : 'none' }} />
                    {post.helpfulCount || 0} helpful
                  </button>

                  {/* Comments */}
                  <button
                    onClick={() => handleOpenComments(post._id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 99, cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.03)',
                      color: 'rgba(255,255,255,0.45)',
                      fontSize: 12, fontWeight: 900, transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; e.currentTarget.style.color = '#a5b4fc'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                  >
                    <MessageCircle size={13} />
                    {post.commentCount || 0}
                  </button>

                  {/* Views */}
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    color: 'rgba(255,255,255,0.25)', fontSize: 12, fontWeight: 800,
                    padding: '6px 8px',
                  }}>
                    <Eye size={13} />{post.viewCount || 0}
                  </span>

                  {/* Share */}
                  <button
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.03)',
                      color: 'rgba(255,255,255,0.35)', transition: 'all 0.2s',
                      marginLeft: 'auto',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; e.currentTarget.style.color = '#a5b4fc'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
                  >
                    <Share2 size={13} />
                  </button>
                </div>

                {/* View comments */}
                {post.commentCount > 0 && (
                  <div style={{ padding: '0 16px 12px' }}>
                    <button
                      onClick={() => handleOpenComments(post._id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 12, color: 'rgba(255,255,255,0.25)', padding: 0, transition: 'color 0.2s',
                        fontWeight: 800,
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
                    >
                      View all {post.commentCount} comments
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div style={{
          background: 'rgba(31,41,55,0.35)',
          border: '1px solid rgba(55,65,81,0.60)',
          borderRadius: 18, padding: '48px 32px', textAlign: 'center',
          backdropFilter: 'blur(6px)',
        }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>
            {subjectFilter !== 'all' || postTypeFilter !== 'all' ? '🔍' : '✨'}
          </div>
          <h3 style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 17, margin: '0 0 8px' }}>No posts found</h3>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0, fontWeight: 700 }}>
            {subjectFilter !== 'all' || postTypeFilter !== 'all' ? 'Try adjusting your filters' : 'Be the first to share something!'}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen">
      {/* Mobile */}
      <div className="lg:hidden">
        <MobileViewBar />
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '80px 16px 100px' }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{
              fontSize: 24, fontWeight: 900, margin: '0 0 4px',
              background: 'linear-gradient(135deg,#60a5fa,#a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>FindOut</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, fontWeight: 700 }}>
              Share knowledge · Ask questions · Help others learn
            </p>
          </div>
          <PostsList />
        </div>
        <MobileViewIcons />
      </div>

      {/* Desktop - 3 column */}
      <div className="hidden lg:block">
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '28px 24px 60px',
          display: 'grid',
          gridTemplateColumns: '240px minmax(0,1fr) 300px',
          gap: 24, alignItems: 'start',
        }}>
          <LeftRail />
          <main><PostsList /></main>
          <RightRail />
        </div>
      </div>

      {/* Comment Modal */}
      {activeCommentModal && (
        <PostComment
          postId={activeCommentModal}
          isOpen={!!activeCommentModal}
          onClose={handleCloseComments}
          comments={posts.find(p => p._id === activeCommentModal)?.comments || []}
        />
      )}
    </div>
  );
};

export default AllPost;