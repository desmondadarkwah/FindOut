import React, { useState, useEffect, useRef, useContext } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, User, Clock, BookOpen, Filter, Home, ChevronDown, TrendingUp, Plus, Award, Sparkles, Flame, Inbox as InboxIcon, Compass, Eye, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import MobileViewIcons from '../components/MobileViewIcons';
import MobileViewBar from '../components/MobileViewBar';
import PostComment from './PostComment';
import PostSettings from './PostSettings';
import { usePostContext } from '../Context/PostContext';
import { ChatContext } from '../Context/ChatContext';
import FindOutLoader from '../Loader/FindOutLoader';
import { sharePost } from '../utils/share';
import { BrandMark } from '../components/BrandMark';

const AllPost = () => {
  const {
    posts,
    postsLoading,
    postsError,
    fetchPosts,
    markHelpful,
    formatTimeAgo
  } = usePostContext();

  const { setSelectedChat, setChats, userId } = useContext(ChatContext);
  const navigate = useNavigate();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeCommentModal, setActiveCommentModal] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [postTypeFilter, setPostTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [shareState, setShareState] = useState({});
  const shareTimers = useRef({});

  const uniqueSubjects = ['all', ...new Set(posts.map(p => p.subject))];

  const postTypeOptions = [
    { value: 'all',         label: 'All',          icon: '📝' },
    { value: 'resource',    label: 'Resources',    icon: '📚' },
    { value: 'help',        label: 'Help',         icon: '❓' },
    { value: 'explanation', label: 'Explanations', icon: '💡' },
    { value: 'challenge',   label: 'Challenges',   icon: '🎯' },
    { value: 'general',     label: 'General',      icon: '📋' },
  ];

  const sortOptions = [
    { value: 'recent',    label: 'Recent',    icon: Clock },
    { value: 'viewed',    label: 'Viewed',    icon: Eye },
    { value: 'discussed', label: 'Discussed', icon: MessageCircle },
    { value: 'top',       label: 'Top',       icon: Flame },
  ];

  /**
   * Uses the native share sheet where there is one and copies the link
   * otherwise. The outcome is shown on the button itself: an alert would
   * interrupt, and on the share sheet path it would fire behind the sheet.
   */
  const handleShare = async (post) => {
    const outcome = await sharePost({
      postId: post._id,
      title: `${post.author?.name || 'A student'} on FindOut`,
      text: post.caption || 'Shared from FindOut',
    });

    if (outcome === 'shared' || outcome === 'cancelled') return;

    setShareState(prev => ({ ...prev, [post._id]: outcome }));
    clearTimeout(shareTimers.current[post._id]);
    shareTimers.current[post._id] = setTimeout(
      () => setShareState(prev => {
        const next = { ...prev };
        delete next[post._id];
        return next;
      }),
      2000
    );
  };

  // Clearing the timers on unmount stops a state update landing on a component
  // that is no longer mounted when the user leaves the feed mid-confirmation.
  useEffect(() => () => {
    Object.values(shareTimers.current).forEach(clearTimeout);
  }, []);

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    // Matched by attribute rather than by ref: a single ref assigned inside
    // the post loop only ever holds the last post's menu, so a mousedown in
    // any other post's menu counted as "outside". The menu then unmounted
    // between mousedown and mouseup and the item's onClick never fired —
    // Report, Copy link and Delete all did nothing on every post but the last.
    const handleClickOutside = (e) => {
      if (!e.target.closest?.('[data-post-menu]')) setActiveDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkHelpful = async (postId) => {
    try { await markHelpful(postId); }
    catch (e) { console.error('Error marking helpful:', e); }
  };

  const handleAuthorClick = async (authorId, authorName) => {
    if (authorId === userId) { alert("That's you!"); return; }
    try {
      const response = await axiosInstance.post("/api/start-new-chat", { userIdToChat: authorId });
      const newChatId = response.data.chat._id;
      const allChatsResponse = await axiosInstance.get(`/api/chats`);
      const allChats = allChatsResponse.data.chats;
      const fullChat = allChats.find(chat => chat._id === newChatId);
      if (fullChat) {
        setSelectedChat(fullChat);
        setChats((prevChats) => {
          const chatExists = prevChats.some(chat => chat._id === fullChat._id);
          if (chatExists) return prevChats;
          return [...prevChats, fullChat];
        });
        navigate("/inbox");
      }
    } catch (e) { console.error("Error starting chat:", e); alert('Failed to start chat'); }
  };

  const toggleDropdown      = (postId) => setActiveDropdown(activeDropdown === postId ? null : postId);
  const handleCloseDropdown = () => setActiveDropdown(null);
  const handleOpenComments  = (postId) => setActiveCommentModal(postId);
  const handleCloseComments = () => setActiveCommentModal(null);
  const handleRetry         = () => fetchPosts();

  const filteredPosts = posts.filter(post => {
    const matchesSubject = subjectFilter === 'all' || post.subject === subjectFilter;
    const matchesType    = postTypeFilter === 'all' || post.postType === postTypeFilter;
    return matchesSubject && matchesType;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'viewed')    return (b.viewCount || 0) - (a.viewCount || 0);
    if (sortBy === 'discussed') return (b.commentCount || 0) - (a.commentCount || 0);
    if (sortBy === 'top')       return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  /* ── Right-rail derived data ── */
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
    posts:    posts.length,
    views:    posts.reduce((s, p) => s + (p.viewCount || 0), 0),
    helpful:  posts.reduce((s, p) => s + (p.helpfulCount || 0), 0),
    comments: posts.reduce((s, p) => s + (p.commentCount || 0), 0),
  };

  const getPostTypeBadge = (type) => {
    const badges = {
      resource:    { gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', label: '📚 Resource' },
      help:        { gradient: 'linear-gradient(135deg,#ef4444,#f97316)', label: '❓ Help' },
      explanation: { gradient: 'linear-gradient(135deg,#eab308,#f59e0b)', label: '💡 Explanation' },
      challenge:   { gradient: 'linear-gradient(135deg,#a855f7,#ec4899)', label: '🎯 Challenge' },
      general:     { gradient: 'linear-gradient(135deg,#6b7280,#9ca3af)', label: '📝 General' },
    };
    return badges[type] || badges.general;
  };

  if (postsLoading) return <FindOutLoader />;

  if (postsError) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0f0f1a,#0a0a0f,#111827)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <p style={{ color:'#f87171', marginBottom:16 }}>{postsError}</p>
        <button onClick={handleRetry} style={{ padding:'10px 24px', background:'linear-gradient(135deg,#3b82f6,#6366f1)', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:600 }}>
          Try Again
        </button>
      </div>
    </div>
  );

  /* ── SHARED CARD STYLE ── */
  const card = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: 18,
  };

  /* ── POSTS LIST ── */
  const PostsList = () => (
    <div>
      {/* Sort Tabs */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 16,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, padding: 6,
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
                padding: '9px 10px', borderRadius: 10, cursor: 'pointer',
                fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
                border: 'none',
                background: active ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                boxShadow: active ? '0 2px 12px rgba(99,102,241,0.4)' : 'none',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
            >
              <Icon size={15} />{opt.label}
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div style={{
        marginBottom: 24,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '14px 18px',
            background: 'none', border: 'none', cursor: 'pointer', color: '#fff',
          }}
        >
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Filter size={16} style={{ color:'#818cf8' }} />
            <span style={{ fontWeight:600, fontSize:14, letterSpacing:'0.02em' }}>Filters</span>
            {(subjectFilter !== 'all' || postTypeFilter !== 'all') && (
              <span style={{
                background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                color:'#fff', fontSize:10, fontWeight:700,
                padding:'2px 8px', borderRadius:99, letterSpacing:'0.06em',
              }}>ACTIVE</span>
            )}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)', fontWeight:500 }}>
              {sortedPosts.length} posts
            </span>
            <ChevronDown size={16} style={{ color:'rgba(255,255,255,0.3)', transform: showFilters ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }} />
          </div>
        </button>

        {showFilters && (
          <div style={{ padding:'0 18px 18px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
            {/* Subject */}
            <div style={{ marginTop:14 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:8 }}>
                Subject
              </label>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                style={{
                  width:'100%', padding:'10px 14px',
                  background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.08)',
                  color:'#fff', borderRadius:10, fontSize:13, outline:'none', cursor:'pointer',
                }}
              >
                {uniqueSubjects.map(s => (
                  <option key={s} value={s} style={{ background:'#1a1a2e' }}>
                    {s === 'all' ? 'All Subjects' : s}
                  </option>
                ))}
              </select>
            </div>

            {/* Post Type */}
            <div style={{ marginTop:14 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:8 }}>
                Post Type
              </label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
                {postTypeOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPostTypeFilter(opt.value)}
                    style={{
                      padding:'8px 6px', borderRadius:10, fontSize:11, fontWeight:600,
                      cursor:'pointer', transition:'all 0.2s',
                      border: postTypeFilter === opt.value ? '1.5px solid #6366f1' : '1.5px solid rgba(255,255,255,0.07)',
                      background: postTypeFilter === opt.value ? 'rgba(99,102,241,0.18)' : 'rgba(0,0,0,0.2)',
                      color: postTypeFilter === opt.value ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    <span style={{ marginRight:4 }}>{opt.icon}</span>{opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Posts Feed */}
      {sortedPosts.length > 0 ? (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {sortedPosts.map((post) => {
            const badge = getPostTypeBadge(post.postType);
            return (
              <article
                key={post._id}
                data-post-id={post._id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                  e.currentTarget.style.boxShadow   = '0 8px 40px rgba(99,102,241,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.boxShadow   = 'none';
                }}
              >
                {/* Header */}
                <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{
                      width:42, height:42, borderRadius:'50%',
                      background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      flexShrink:0, overflow:'hidden',
                      boxShadow:'0 0 0 2px rgba(99,102,241,0.25)',
                    }}>
                      {post.author?.profilePicture ? (
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}${post.author.profilePicture}`}
                          alt={post.author.name}
                          style={{ width:'100%', height:'100%', objectFit:'cover' }}
                        />
                      ) : (
                        <User size={18} color="#fff" />
                      )}
                    </div>

                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <button
                          onClick={() => handleAuthorClick(post.author?._id, post.author?.name)}
                          style={{
                            background:'none', border:'none', cursor:'pointer',
                            color:'#f1f5f9', fontWeight:700, fontSize:14,
                            padding:0, transition:'color 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#818cf8'}
                          onMouseLeave={e => e.currentTarget.style.color = '#f1f5f9'}
                        >
                          {post.author?.name || 'Anonymous'}
                        </button>
                        {post.author?.isVerified && (
                          <span style={{
                            fontSize:10, fontWeight:700, letterSpacing:'0.06em',
                            background:'rgba(34,197,94,0.12)', color:'#4ade80',
                            border:'1px solid rgba(34,197,94,0.2)',
                            padding:'2px 7px', borderRadius:99,
                          }}>✓ Verified</span>
                        )}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
                        <Clock size={11} color="rgba(255,255,255,0.3)" />
                        <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{formatTimeAgo(post.createdAt)}</span>
                        {post.author?.reputation > 0 && (
                          <>
                            <span style={{ color:'rgba(255,255,255,0.15)', fontSize:11 }}>·</span>
                            <span style={{ fontSize:11, color:'#fbbf24' }}>⭐ {post.author.reputation}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ position:'relative' }} data-post-menu>
                    <button
                      onClick={() => toggleDropdown(post._id)}
                      style={{
                        background:'none', border:'1px solid rgba(255,255,255,0.07)',
                        borderRadius:8, cursor:'pointer', padding:'6px 8px',
                        color:'rgba(255,255,255,0.35)', transition:'all 0.2s',
                        display:'flex', alignItems:'center',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='rgba(99,102,241,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.35)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeDropdown === post._id && (
                      <div style={{ position:'absolute', right:0, top:'calc(100% + 6px)', zIndex:50 }}>
                        <PostSettings postId={post._id} authorId={post.author?._id} onClose={handleCloseDropdown} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div style={{ padding:'0 16px 12px', display:'flex', gap:6 }}>
                  <span style={{
                    fontSize:11, fontWeight:700, letterSpacing:'0.04em',
                    padding:'3px 10px', borderRadius:99,
                    background: badge.gradient, color:'#fff',
                  }}>{badge.label}</span>
                  <span style={{
                    fontSize:11, fontWeight:600,
                    padding:'3px 10px', borderRadius:99,
                    background:'rgba(255,255,255,0.06)',
                    border:'1px solid rgba(255,255,255,0.08)',
                    color:'rgba(255,255,255,0.5)',
                    display:'flex', alignItems:'center', gap:4,
                  }}>
                    <BookOpen size={11} />{post.subject}
                  </span>
                </div>

                {/* Image */}
                <div style={{ position:'relative', overflow:'hidden' }}>
                  {/* `post.image` is stored root-relative ("/uploads/posts/x.jpg"),
                      so the base URL is joined without an extra slash — the
                      previous `${base}/${post.image}` produced a doubled slash
                      that Express static returns 404 for. The host also comes
                      from the environment now rather than being hardcoded, so
                      images resolve outside local development. */}
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}${post.image}`}
                    alt={post.caption ? `Post: ${post.caption.slice(0, 60)}` : 'Post content'}
                    style={{ width:'100%', height:340, objectFit:'cover', display:'block' }}
                    onError={(e) => {
                      /* Fall back to an inline placeholder rather than an
                         external service, which needs network access and fails
                         silently to a blank area when unavailable. */
                      e.target.onerror = null;
                      e.target.style.objectFit = 'contain';
                      e.target.style.background = 'rgba(255,255,255,0.03)';
                      e.target.src =
                        "data:image/svg+xml;charset=UTF-8," +
                        encodeURIComponent(
                          `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340">
                             <rect width="100%" height="100%" fill="#16161f"/>
                             <text x="50%" y="50%" fill="#828298" font-family="system-ui,sans-serif"
                                   font-size="14" text-anchor="middle" dominant-baseline="middle">
                               Image unavailable
                             </text>
                           </svg>`
                        );
                    }}
                  />
                  <div style={{
                    position:'absolute', bottom:0, left:0, right:0, height:60,
                    background:'linear-gradient(to top, rgba(10,10,20,0.6), transparent)',
                    pointerEvents:'none',
                  }} />
                </div>

                {/* Actions */}
                <div style={{ padding:'12px 16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                    {/* Helpful */}
                    <button
                      onClick={() => handleMarkHelpful(post._id)}
                      style={{
                        display:'flex', alignItems:'center', gap:6,
                        padding:'7px 14px', borderRadius:99, cursor:'pointer',
                        border: post.isHelpful ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.07)',
                        background: post.isHelpful ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                        color: post.isHelpful ? '#4ade80' : 'rgba(255,255,255,0.4)',
                        fontSize:12, fontWeight:600, transition:'all 0.2s',
                      }}
                      onMouseEnter={e => { if (!post.isHelpful) { e.currentTarget.style.borderColor='rgba(34,197,94,0.3)'; e.currentTarget.style.color='#4ade80'; } }}
                      onMouseLeave={e => { if (!post.isHelpful) { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.color='rgba(255,255,255,0.4)'; } }}
                    >
                      <Heart size={14} style={{ fill: post.isHelpful ? '#4ade80' : 'none' }} />
                      {post.helpfulCount || 0} helpful
                    </button>

                    {/* Comments */}
                    <button
                      onClick={() => handleOpenComments(post._id)}
                      style={{
                        display:'flex', alignItems:'center', gap:6,
                        padding:'7px 14px', borderRadius:99, cursor:'pointer',
                        border:'1px solid rgba(255,255,255,0.07)',
                        background:'rgba(255,255,255,0.03)',
                        color:'rgba(255,255,255,0.4)',
                        fontSize:12, fontWeight:600, transition:'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(99,102,241,0.4)'; e.currentTarget.style.color='#818cf8'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.color='rgba(255,255,255,0.4)'; }}
                    >
                      <MessageCircle size={14} />
                      {post.commentCount || 0}
                    </button>

                    {/* Views (read-only) */}
                    <span style={{
                      display:'flex', alignItems:'center', gap:6,
                      padding:'7px 14px', borderRadius:99,
                      color:'rgba(255,255,255,0.4)', fontSize:12, fontWeight:600,
                    }}>
                      <Eye size={14} />
                      {post.viewCount || 0}
                    </span>

                    {/* Share */}
                    <button
                      onClick={() => handleShare(post)}
                      title={shareState[post._id] === 'copied' ? 'Link copied' : 'Share this post'}
                      aria-label="Share this post"
                      style={{
                        display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                        height:34, padding: shareState[post._id] ? '0 12px' : 0,
                        width: shareState[post._id] ? 'auto' : 34,
                        borderRadius:99, cursor:'pointer',
                        border: shareState[post._id] === 'copied'
                          ? '1px solid rgba(34,197,94,0.4)'
                          : shareState[post._id] === 'failed'
                            ? '1px solid rgba(248,113,113,0.4)'
                            : '1px solid rgba(255,255,255,0.07)',
                        background: shareState[post._id] === 'copied'
                          ? 'rgba(34,197,94,0.1)'
                          : shareState[post._id] === 'failed'
                            ? 'rgba(248,113,113,0.1)'
                            : 'rgba(255,255,255,0.03)',
                        color: shareState[post._id] === 'copied'
                          ? '#4ade80'
                          : shareState[post._id] === 'failed'
                            ? '#f87171'
                            : 'rgba(255,255,255,0.4)',
                        fontSize:12, fontWeight:600, whiteSpace:'nowrap',
                        transition:'all 0.2s', marginLeft:'auto',
                      }}
                      onMouseEnter={e => { if (!shareState[post._id]) { e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; e.currentTarget.style.color='#fff'; } }}
                      onMouseLeave={e => { if (!shareState[post._id]) { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.color='rgba(255,255,255,0.4)'; } }}
                    >
                      {shareState[post._id] === 'copied'
                        ? <Check size={14} />
                        : <Share2 size={14} />}
                      {shareState[post._id] === 'copied' && 'Link copied'}
                      {shareState[post._id] === 'failed' && 'Copy failed'}
                    </button>
                  </div>

                  {/* Caption */}
                  {post.caption && (
                    <p style={{ fontSize:13, color:'rgba(255,255,255,0.75)', lineHeight:1.6, marginBottom:8 }}>
                      <span style={{ fontWeight:700, color:'#f1f5f9', marginRight:6 }}>{post.author?.name}</span>
                      {post.caption}
                    </p>
                  )}

                  {/* View comments link */}
                  {post.comments?.length > 0 && (
                    <button
                      onClick={() => handleOpenComments(post._id)}
                      style={{
                        background:'none', border:'none', cursor:'pointer',
                        fontSize:12, color:'rgba(255,255,255,0.25)',
                        padding:0, transition:'color 0.2s', fontWeight:500,
                      }}
                      onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.6)'}
                      onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.25)'}
                    >
                      View all {post.commentCount} comments
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign:'center', paddingTop:48 }}>
          <div style={{
            background:'rgba(255,255,255,0.02)',
            border:'1px solid rgba(255,255,255,0.06)',
            borderRadius:20, padding:'48px 32px',
          }}>
            <div style={{ fontSize:48, marginBottom:16 }}>
              {subjectFilter !== 'all' || postTypeFilter !== 'all' ? '🔍' : '✨'}
            </div>
            <h3 style={{ color:'#f1f5f9', fontWeight:700, fontSize:18, marginBottom:8 }}>No posts found</h3>
            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13, lineHeight:1.6 }}>
              {subjectFilter !== 'all' || postTypeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Be the first to share something amazing!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  /* ── PAGE HEADER ── */
  const PageHeader = () => (
    <div style={{ marginBottom:28 }}>
      <h1 style={{
        fontSize:28, fontWeight:800, margin:'0 0 4px',
        display:'flex', alignItems:'center', gap:10,
        letterSpacing:'-0.02em',
      }}>
        <BrandMark size={30} />
        <span style={{
          background:'linear-gradient(135deg,#60a5fa,#a78bfa)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        }}>FindOut</span>
      </h1>
      <p style={{ fontSize:13, color:'rgba(255,255,255,0.3)', margin:0, fontWeight:500 }}>
        Share knowledge · Ask questions · Help others learn
      </p>
    </div>
  );

  /* ── LEFT RAIL ── */
  const navItems = [
    { label: 'Home',    icon: Home,      to: '/dashboard' },
    { label: 'Feed',    icon: Sparkles,  to: '/feed', active: true },
    { label: 'Chats',   icon: InboxIcon, to: '/inbox' },
    { label: 'Explore', icon: Compass,   to: '/explore-groups' },
  ];

  const LeftRail = () => (
    <aside className="rail-scroll" style={{ position:'sticky', top:24, maxHeight:'calc(100vh - 48px)', overflowY:'auto', display:'flex', flexDirection:'column', gap:16 }}>
      {/* Brand */}
      <div style={{ ...card, paddingTop:20, paddingBottom:20 }}>
        <h1 style={{
          fontSize:24, fontWeight:800, margin:'0 0 4px',
          display:'flex', alignItems:'center', gap:9,
          letterSpacing:'-0.02em',
        }}>
          <BrandMark size={26} />
          <span style={{
            background:'linear-gradient(135deg,#60a5fa,#a78bfa)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>FindOut</span>
        </h1>
        <p style={{ fontSize:11.5, color:'rgba(255,255,255,0.3)', margin:0, fontWeight:500, lineHeight:1.5 }}>
          Share knowledge · Ask questions · Help others learn
        </p>
      </div>

      {/* Create Post */}
      <button
        onClick={() => navigate('/add-post')}
        style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          padding:'14px', borderRadius:14, border:'none', cursor:'pointer',
          background:'linear-gradient(135deg,#3b82f6,#6366f1)',
          color:'#fff', fontWeight:700, fontSize:14,
          boxShadow:'0 4px 16px rgba(99,102,241,0.4)',
          transition:'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(99,102,241,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 4px 16px rgba(99,102,241,0.4)'; }}
      >
        <Plus size={18} /> Create Post
      </button>

      {/* Nav */}
      <nav style={{ ...card, padding:8, display:'flex', flexDirection:'column', gap:2 }}>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'11px 14px', borderRadius:10, cursor:'pointer',
                background: item.active ? 'rgba(99,102,241,0.15)' : 'transparent',
                border:'none', width:'100%', textAlign:'left',
                color: item.active ? '#818cf8' : 'rgba(255,255,255,0.55)',
                fontSize:14, fontWeight:600, transition:'all 0.15s',
              }}
              onMouseEnter={e => { if (!item.active) { e.currentTarget.style.background='rgba(99,102,241,0.08)'; e.currentTarget.style.color='#fff'; } }}
              onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.55)'; } }}
            >
              <Icon size={18} /> {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );

  /* ── RIGHT RAIL ── */
  const statItems = [
    { label:'Posts',    value: communityStats.posts,    icon: Sparkles,      color:'#60a5fa' },
    { label:'Views',    value: communityStats.views,    icon: Eye,           color:'#818cf8' },
    { label:'Helpful',  value: communityStats.helpful,  icon: Heart,         color:'#4ade80' },
    { label:'Comments', value: communityStats.comments, icon: MessageCircle, color:'#a78bfa' },
  ];

  const RightRail = () => (
    <aside className="rail-scroll" style={{ position:'sticky', top:24, maxHeight:'calc(100vh - 48px)', overflowY:'auto', display:'flex', flexDirection:'column', gap:16 }}>
      {/* Community Pulse */}
      <div style={card}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <TrendingUp size={16} style={{ color:'#818cf8' }} />
          <span style={{ fontWeight:700, fontSize:13, color:'#f1f5f9', letterSpacing:'0.01em' }}>Community Pulse</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {statItems.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{
                background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.12)',
                borderRadius:12, padding:'12px 14px',
              }}>
                <Icon size={15} style={{ color:s.color, marginBottom:6 }} />
                <div style={{ fontSize:20, fontWeight:800, color:'#fff', lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontWeight:500, marginTop:3 }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trending Subjects */}
      {trendingSubjects.length > 0 && (
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <Flame size={16} style={{ color:'#f97316' }} />
            <span style={{ fontWeight:700, fontSize:13, color:'#f1f5f9' }}>Trending Subjects</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {trendingSubjects.map(([subject, count], i) => (
              <button
                key={subject}
                onClick={() => setSubjectFilter(subject)}
                style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'9px 12px', borderRadius:10, cursor:'pointer', width:'100%',
                  border:'none', textAlign:'left', transition:'all 0.15s',
                  background: subjectFilter === subject ? 'rgba(99,102,241,0.15)' : 'transparent',
                }}
                onMouseEnter={e => { if (subjectFilter !== subject) e.currentTarget.style.background='rgba(99,102,241,0.06)'; }}
                onMouseLeave={e => { if (subjectFilter !== subject) e.currentTarget.style.background='transparent'; }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                  <span style={{ fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.25)', width:14 }}>{i + 1}</span>
                  <span style={{ fontSize:13, fontWeight:600, color: subjectFilter === subject ? '#818cf8' : 'rgba(255,255,255,0.7)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>#{subject}</span>
                </div>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:600, flexShrink:0 }}>{count} {count === 1 ? 'post' : 'posts'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Top Contributors */}
      {topContributors.length > 0 && (
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <Award size={16} style={{ color:'#fbbf24' }} />
            <span style={{ fontWeight:700, fontSize:13, color:'#f1f5f9' }}>Top Contributors</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {topContributors.map((c) => (
              <button
                key={c._id}
                onClick={() => handleAuthorClick(c._id, c.name)}
                style={{
                  display:'flex', alignItems:'center', gap:12, padding:0,
                  background:'none', border:'none', cursor:'pointer', width:'100%', textAlign:'left',
                }}
              >
                <div style={{
                  width:38, height:38, borderRadius:'50%', flexShrink:0, overflow:'hidden',
                  background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 0 0 2px rgba(99,102,241,0.3)',
                }}>
                  {c.profilePicture
                    ? <img src={`${import.meta.env.VITE_BACKEND_URL}${c.profilePicture}`} alt={c.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <User size={16} color="#fff" />}
                </div>
                <div style={{ minWidth:0, flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</span>
                    {c.isVerified && <span style={{ fontSize:10, color:'#4ade80' }}>✓</span>}
                  </div>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontWeight:500 }}>
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

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0f0f1a 0%,#0a0a0f 50%,#0d0d1a 100%)' }}>

      {/* ── MOBILE ── */}
      <div className="lg:hidden">
        <MobileViewBar />
        <div style={{ maxWidth:520, margin:'0 auto', padding:`80px 16px calc(var(--mobile-nav-h) + env(safe-area-inset-bottom, 0px) + 1rem)` }}>
          <PageHeader />
          <PostsList />
        </div>
        <MobileViewIcons />
      </div>

      {/* ── DESKTOP (3-column) ── */}
      <div className="hidden lg:block">
        <style>{`
          .rail-scroll { scrollbar-width: thin; scrollbar-color: rgba(99,102,241,0.3) transparent; }
          .rail-scroll::-webkit-scrollbar { width: 4px; }
          .rail-scroll::-webkit-scrollbar-track { background: transparent; }
          .rail-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 99px; }
          .rail-scroll::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.5); }
        `}</style>
        <div style={{
          maxWidth:1320, margin:'0 auto', padding:'28px 24px 60px',
          display:'grid', gridTemplateColumns:'248px minmax(0,1fr) 312px',
          gap:28, alignItems:'start',
        }}>
          <LeftRail />
          <main style={{ minWidth:0 }}>
            <PostsList />
          </main>
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