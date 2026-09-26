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
  // FIX: was a single shared useRef reused for every post in the map loop,
  // so only the last-mounted post's dropdown was ever tracked correctly.
  // Now keyed per post id.
  const dropdownRefs = useRef({});

  const uniqueSubjects = ['all', ...new Set(posts.map(p => p.subject).filter(Boolean))];

  const postTypeOptions = [
    { value: 'all', label: 'All' },
    { value: 'resource', label: 'Resources' },
    { value: 'help', label: 'Help' },
    { value: 'explanation', label: 'Explanations' },
    { value: 'challenge', label: 'Challenges' },
    { value: 'general', label: 'General' },
  ];

  const sortOptions = [
    { value: 'recent', label: 'Recent', icon: Clock },
    { value: 'top', label: 'Top', icon: Flame },
    { value: 'discussed', label: 'Discussed', icon: MessageCircle },
  ];

  useEffect(() => { fetchPosts(); }, []);

  // FIX: previously used `mousedown` with an empty dependency array, so
  // (a) it always compared against the single shared ref's stale/wrong node,
  // and (b) it fired before the button's own `click` event, closing the
  // dropdown (and unmounting PostSettings/ReportModal) before the click
  // handler on "Report" ever ran. Now it looks up the correct per-post node
  // and re-subscribes whenever activeDropdown changes.
  useEffect(() => {
    if (!activeDropdown) return;

    const handleClickOutside = (e) => {
      const node = dropdownRefs.current[activeDropdown];
      if (node && !node.contains(e.target)) setActiveDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

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

  // Post-type badges no longer carry five different hues + emoji - a
  // single neutral treatment with just the label reads calmer and avoids
  // the "mixed colors everywhere" look. The label itself still carries the
  // information.
  const getPostTypeLabel = (type) => {
    const labels = {
      resource: 'Resource',
      help: 'Help',
      explanation: 'Explanation',
      challenge: 'Challenge',
      general: 'General',
    };
    return labels[type] || 'General';
  };

  if (postsLoading) return <FindOutLoader />;

  if (postsError) return (
    <div style={{ minHeight: '100vh' }} className="relative bg-[var(--bg-primary)] min-h-screen">
      <div style={{ textAlign: 'center', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div>
          <p style={{ color: '#ef4444', marginBottom: 16 }}>{postsError}</p>
          <button
            onClick={() => fetchPosts()}
            style={{ padding: '10px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  // Flat card: border + faint fill, no blur, no heavy shadow - a real
  // panel rather than a glass effect.
  const card = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 16,
  };

  /* -----------------------------------------
     LEFT RAIL
  ----------------------------------------- */
  const LeftRail = () => (
    <aside style={{
      position: 'sticky', top: 24,
      maxHeight: 'calc(100vh - 48px)', overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ ...card, padding: '20px 18px' }}>
        <h1 style={{
          fontSize: 20, fontWeight: 700, margin: '0 0 4px',
          color: 'var(--text-primary)', letterSpacing: '-0.01em',
        }}>FindOut</h1>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          Share knowledge · Ask questions · Help others learn
        </p>
      </div>

      {/* The one deliberate gradient on this page - reserved for the single
          primary action, not spread across every accent. */}
      <button
        onClick={() => navigate('/add-post')}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
          color: '#fff', fontWeight: 600, fontSize: 14,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
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
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                background: item.active ? 'rgba(99,102,241,0.12)' : 'transparent',
                borderLeft: item.active ? '2px solid #6366f1' : '2px solid transparent',
                width: '100%', textAlign: 'left',
                color: item.active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 14, fontWeight: item.active ? 600 : 500,
                transition: 'all 0.15s', marginBottom: 2,
              }}
              onMouseEnter={e => {
                if (!item.active) { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }
              }}
              onMouseLeave={e => {
                if (!item.active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }
              }}
            >
              <Icon size={17} /> {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );

  /* -----------------------------------------
     RIGHT RAIL
  ----------------------------------------- */
  const RightRail = () => (
    <aside style={{
      position: 'sticky', top: 24,
      maxHeight: 'calc(100vh - 48px)', overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Community Pulse */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <TrendingUp size={15} color="var(--text-secondary)" />
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>Community Pulse</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Posts', value: communityStats.posts, icon: Sparkles },
            { label: 'Subjects', value: communityStats.subjects, icon: BookOpen },
            { label: 'Helpful', value: communityStats.helpful, icon: Heart },
            { label: 'Comments', value: communityStats.comments, icon: MessageCircle },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 10, padding: 12,
                textAlign: 'center',
              }}>
                <Icon size={15} color="var(--text-muted)" style={{ marginBottom: 6 }} />
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {trendingSubjects.length > 0 && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Flame size={15} color="var(--text-secondary)" />
            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>Trending Subjects</span>
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
                  background: subjectFilter === subject ? 'rgba(99,102,241,0.10)' : 'transparent',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={e => { if (subjectFilter !== subject) e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                onMouseLeave={e => { if (subjectFilter !== subject) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', width: 14 }}>{i + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: subjectFilter === subject ? '#6366f1' : 'var(--text-secondary)' }}>
                    {subject}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
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
            <Award size={15} color="var(--text-secondary)" />
            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>Top Contributors</span>
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
                  borderRadius: 8, transition: 'background 0.15s',
                  color: '#fff',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--border)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                  {c.profilePicture
                    ? <img src={`${import.meta.env.VITE_BACKEND_URL}${c.profilePicture}`} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <User size={15} color="var(--text-secondary)" />}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </span>
                    {c.isVerified && <span style={{ fontSize: 10, color: '#3b82f6', flexShrink: 0, fontWeight: 700 }}>✓</span>}
                  </div>

                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
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

  /* -----------------------------------------
     CENTER FEED
  ----------------------------------------- */
  const PostsList = () => (
    <div>
      {/* Sort Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 14,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10, padding: 4,
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
                padding: '8px', borderRadius: 8, cursor: 'pointer',
                fontSize: 13, fontWeight: 600, border: 'none', transition: 'all 0.2s',
                background: active ? '#6366f1' : 'transparent',
                color: active ? '#fff' : 'var(--text-secondary)',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Icon size={14} />{opt.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{
        marginBottom: 20,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10, overflow: 'hidden',
      }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '12px 16px',
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontWeight: 600, fontSize: 13 }}>Filters</span>
            {(subjectFilter !== 'all' || postTypeFilter !== 'all') && (
              <span style={{
                background: '#6366f1',
                color: '#fff', fontSize: 9, fontWeight: 700,
                padding: '2px 7px', borderRadius: 99,
              }}>ACTIVE</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              {sortedPosts.length} posts
            </span>
            <ChevronDown
              size={14}
              style={{
                color: 'var(--text-muted)',
                transform: showFilters ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          </div>
        </button>

        {showFilters && (
          <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ marginTop: 12 }}>
              <label style={{
                display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8
              }}>
                Subject
              </label>

              <select
                value={subjectFilter}
                onChange={e => setSubjectFilter(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px',
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid var(--border)',
                  color: '#fff', borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer',
                }}
              >
                {uniqueSubjects.map(s => (
                  <option key={s} value={s} style={{ background: '#0a0a0f' }}>
                    {s === 'all' ? 'All Subjects' : s}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{
                display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8
              }}>
                Post Type
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                {postTypeOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPostTypeFilter(opt.value)}
                    style={{
                      padding: '7px 4px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                      border: postTypeFilter === opt.value ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)',
                      background: postTypeFilter === opt.value ? 'rgba(99,102,241,0.12)' : 'var(--bg-card)',
                      color: postTypeFilter === opt.value ? '#818cf8' : 'var(--text-secondary)',
                    }}
                  >
                    {opt.label}
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
          {sortedPosts.map(post => (
              <article
                key={post._id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 14, overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                {/* Post Header */}
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'var(--border)',
                      border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, overflow: 'hidden',
                    }}>
                      {post.author?.profilePicture
                        ? <img src={`${import.meta.env.VITE_BACKEND_URL}${post.author.profilePicture}`} alt={post.author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <User size={16} color="var(--text-secondary)" />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={() => handleAuthorClick(post.author?._id)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-primary)', fontWeight: 600, fontSize: 14,
                            padding: 0, transition: 'color 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#818cf8'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                        >
                          {post.author?.name || 'Anonymous'}
                        </button>

                        {post.author?.isVerified && (
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            background: 'rgba(59,130,246,0.1)',
                            color: '#3b82f6',
                            border: '1px solid rgba(59,130,246,0.2)',
                            padding: '1px 6px', borderRadius: 99,
                          }}>Verified</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <Clock size={10} color="var(--text-muted)" />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                          {formatTimeAgo(post.createdAt)}
                        </span>
                        {post.author?.reputation > 0 && (
                          <>
                            <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {post.author.reputation} rep
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FIX: ref is now keyed per post id via a callback ref
                      instead of the single shared `dropdownRef` */}
                  <div style={{ position: 'relative' }} ref={(el) => { dropdownRefs.current[post._id] = el; }}>
                    <button
                      onClick={() => toggleDropdown(post._id)}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border)',
                        borderRadius: 8, cursor: 'pointer', padding: '5px 7px',
                        color: 'var(--text-secondary)', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
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

                {/* Badges - one neutral style, no per-type colors */}
                <div style={{ padding: '0 16px 10px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}>{getPostTypeLabel(post.postType)}</span>

                  {post.subject && (
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 99,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
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
                  </div>
                )}

                {/* Caption */}
                {post.caption && (
                  <div style={{ padding: '12px 16px 4px' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginRight: 6 }}>{post.author?.name}</span>
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
                      border: post.isHelpful ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)',
                      background: post.isHelpful ? 'rgba(99,102,241,0.12)' : 'var(--bg-card)',
                      color: post.isHelpful ? '#818cf8' : 'var(--text-secondary)',
                      fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (!post.isHelpful) {
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                        e.currentTarget.style.color = '#818cf8';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!post.isHelpful) {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    <Heart size={13} style={{ fill: post.isHelpful ? '#818cf8' : 'none' }} />
                    {post.helpfulCount || 0} helpful
                  </button>

                  {/* Comments */}
                  <button
                    onClick={() => handleOpenComments(post._id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 99, cursor: 'pointer',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-secondary)',
                      fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.color = '#818cf8'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    <MessageCircle size={13} />
                    {post.commentCount || 0}
                  </button>

                  {/* Views */}
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    color: 'var(--text-muted)', fontSize: 12, fontWeight: 500,
                    padding: '6px 8px',
                  }}>
                    <Eye size={13} />{post.viewCount || 0}
                  </span>

                  {/* Share */}
                  <button
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 30, height: 30, borderRadius: '50%', cursor: 'pointer',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-secondary)', transition: 'all 0.2s',
                      marginLeft: 'auto',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.color = '#818cf8'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
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
                        fontSize: 12, color: 'var(--text-muted)', padding: 0, transition: 'color 0.2s',
                        fontWeight: 500,
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      View all {post.commentCount} comments
                    </button>
                  </div>
                )}
              </article>
          ))}
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 14, padding: '48px 32px', textAlign: 'center',
        }}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 16, margin: '0 0 6px' }}>No posts found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
            {subjectFilter !== 'all' || postTypeFilter !== 'all' ? 'Try adjusting your filters' : 'Be the first to share something'}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative bg-[var(--bg-primary)] min-h-screen">
      {/* Mobile */}
      <div className="lg:hidden">
        <MobileViewBar />
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '80px 16px 100px' }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>FindOut</h1>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
              Share knowledge · Ask questions · Help others learn
            </p>
          </div>
          {PostsList()}
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
          {LeftRail()}
          <main>{PostsList()}</main>
          {RightRail()}
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