import React, { useState, useEffect, useRef, useContext } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, User, Clock, BookOpen, Filter, Home, Menu, X, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import DashSidebar from '../components/DashSidebar';
import MobileViewIcons from '../components/MobileViewIcons';
import MobileViewBar from '../components/MobileViewBar';
import PostComment from './PostComment';
import PostSettings from './PostSettings';
import { usePostContext } from '../Context/PostContext';
import { ChatContext } from '../Context/ChatContext';
import FindOutLoader from '../Loader/FindOutLoader';

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
  const [showFilters, setShowFilters] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const dropdownRef = useRef(null);

  const uniqueSubjects = ['all', ...new Set(posts.map(p => p.subject))];

  const postTypeOptions = [
    { value: 'all',         label: 'All',          icon: '📝' },
    { value: 'resource',    label: 'Resources',    icon: '📚' },
    { value: 'help',        label: 'Help',         icon: '❓' },
    { value: 'explanation', label: 'Explanations', icon: '💡' },
    { value: 'challenge',   label: 'Challenges',   icon: '🎯' },
    { value: 'general',     label: 'General',      icon: '📋' },
  ];

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setActiveDropdown(null);
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

  const toggleDropdown   = (postId) => setActiveDropdown(activeDropdown === postId ? null : postId);
  const handleCloseDropdown  = () => setActiveDropdown(null);
  const handleOpenComments   = (postId) => setActiveCommentModal(postId);
  const handleCloseComments  = () => setActiveCommentModal(null);
  const handleRetry          = () => fetchPosts();

  const filteredPosts = posts.filter(post => {
    const matchesSubject = subjectFilter === 'all' || post.subject === subjectFilter;
    const matchesType    = postTypeFilter === 'all' || post.postType === postTypeFilter;
    return matchesSubject && matchesType;
  });

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

  /* ── POSTS LIST ── */
  const PostsList = () => (
    <div>
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
              {filteredPosts.length} posts
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
                  color:'#fff', borderRadius:10, fontSize:13, outline:'none',
                  cursor:'pointer',
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
      {filteredPosts.length > 0 ? (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {filteredPosts.map((post) => {
            const badge = getPostTypeBadge(post.postType);
            return (
              <article
                key={post._id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
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
                    {/* Avatar */}
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

                  <div style={{ position:'relative' }} ref={dropdownRef}>
                    <button
                      onClick={() => toggleDropdown(post._id)}
                      style={{
                        background:'none', border:'1px solid rgba(255,255,255,0.07)',
                        borderRadius:8, cursor:'pointer', padding:'6px 8px',
                        color:'rgba(255,255,255,0.35)', transition:'all 0.2s',
                        display:'flex', alignItems:'center',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; }}
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
                    background: badge.gradient,
                    color:'#fff',
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
                  <img
                    src={`http://localhost:5000/${post.image}`}
                    alt="Post content"
                    style={{ width:'100%', height:340, objectFit:'cover', display:'block' }}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found'; }}
                  />
                  {/* subtle gradient overlay at bottom */}
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

                    {/* Share */}
                    <button
                      style={{
                        display:'flex', alignItems:'center', justifyContent:'center',
                        width:34, height:34, borderRadius:'50%', cursor:'pointer',
                        border:'1px solid rgba(255,255,255,0.07)',
                        background:'rgba(255,255,255,0.03)',
                        color:'rgba(255,255,255,0.4)', transition:'all 0.2s',
                        marginLeft:'auto',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; e.currentTarget.style.color='#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.color='rgba(255,255,255,0.4)'; }}
                    >
                      <Share2 size={14} />
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
        fontSize: 28, fontWeight:800, margin:'0 0 4px',
        background:'linear-gradient(135deg,#60a5fa,#a78bfa)',
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        letterSpacing:'-0.02em',
      }}>FindOut</h1>
      <p style={{ fontSize:13, color:'rgba(255,255,255,0.3)', margin:0, fontWeight:500 }}>
        Share knowledge · Ask questions · Help others learn
      </p>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0f0f1a 0%,#0a0a0f 50%,#0d0d1a 100%)' }}>

      {/* ── MOBILE ── */}
      <div className="lg:hidden">
        <MobileViewBar />
        <div style={{ maxWidth:520, margin:'0 auto', padding:'80px 16px 100px' }}>
          <PageHeader />
          <PostsList />
        </div>
        <MobileViewIcons />
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden lg:block">
        {/* Sidebar toggle */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          style={{
            position:'fixed', top:16, left:16, zIndex:50,
            display:'flex', alignItems:'center', justifyContent:'center',
            width:40, height:40,
            background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:10, cursor:'pointer', color:'rgba(255,255,255,0.6)',
            transition:'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='rgba(255,255,255,0.6)'; }}
        >
          {showSidebar ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Sidebar overlay */}
        {showSidebar && (
          <>
            <div
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:40, backdropFilter:'blur(4px)' }}
              onClick={() => setShowSidebar(false)}
            />
            <div style={{ position:'fixed', left:0, top:0, height:'100%', width:256, zIndex:50 }}>
              <DashSidebar />
            </div>
          </>
        )}

        {/* Main */}
        <div style={{ display:'flex', justifyContent:'center' }}>
          <div style={{ width:'100%', maxWidth:620, padding:'32px 20px' }}>

            {/* Top nav bar */}
            <div style={{
              marginBottom:28,
              display:'flex', alignItems:'center', justifyContent:'space-between',
              background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:14, padding:'10px 16px',
            }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  display:'flex', alignItems:'center', gap:7,
                  background:'none', border:'none', cursor:'pointer',
                  color:'rgba(255,255,255,0.4)', fontSize:13, fontWeight:600,
                  padding:0, transition:'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color='#fff'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.4)'}
              >
                <Home size={16} />
                Dashboard
              </button>

              <span style={{
                fontWeight:800, fontSize:15,
                background:'linear-gradient(135deg,#60a5fa,#a78bfa)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                letterSpacing:'-0.01em',
              }}>FindOut</span>

              <div style={{ width:80 }} />
            </div>

            <PostsList />
          </div>
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