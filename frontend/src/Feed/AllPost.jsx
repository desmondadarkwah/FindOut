import React, { useState, useEffect, useRef, useContext } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, User, Clock, BookOpen, Filter, Home, Menu, X } from 'lucide-react';
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
    { value: 'all', label: 'All Posts', icon: '📝' },
    { value: 'resource', label: 'Resources', icon: '📚' },
    { value: 'help', label: 'Help Requests', icon: '❓' },
    { value: 'explanation', label: 'Explanations', icon: '💡' },
    { value: 'challenge', label: 'Challenges', icon: '🎯' },
    { value: 'general', label: 'General', icon: '📋' }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkHelpful = async (postId) => {
    try {
      await markHelpful(postId);
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const handleAuthorClick = async (authorId, authorName) => {
    if (authorId === userId) {
      alert("That's you!");
      return;
    }

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
      } else {
        console.error('Could not find the newly created chat');
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      alert('Failed to start chat');
    }
  };

  const toggleDropdown = (postId) => {
    setActiveDropdown(activeDropdown === postId ? null : postId);
  };

  const handleCloseDropdown = () => {
    setActiveDropdown(null);
  };

  const handleOpenComments = (postId) => {
    setActiveCommentModal(postId);
  };

  const handleCloseComments = () => {
    setActiveCommentModal(null);
  };

  const handleRetry = () => {
    fetchPosts();
  };

  const filteredPosts = posts.filter(post => {
    const matchesSubject = subjectFilter === 'all' || post.subject === subjectFilter;
    const matchesType = postTypeFilter === 'all' || post.postType === postTypeFilter;
    return matchesSubject && matchesType;
  });

  const getPostTypeBadge = (type) => {
    const badges = {
      resource: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: '📚 Resource' },
      help: { bg: 'bg-red-500/20', text: 'text-red-400', label: '❓ Help' },
      explanation: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: '💡 Explanation' },
      challenge: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: '🎯 Challenge' },
      general: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: '📝 General' }
    };
    return badges[type] || badges.general;
  };

  if (postsLoading) {
    return <FindOutLoader />;
  }

  if (postsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4">{postsError}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ✅ RENDER POSTS COMPONENT (Used by both mobile and desktop)
  const PostsList = () => (
    <>
      {/* Filters */}
      <div className="mb-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-between w-full text-white"
        >
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-blue-400" />
            <span className="font-medium">Filters</span>
          </div>
          <span className="text-sm text-gray-400">
            {filteredPosts.length} posts
          </span>
        </button>

        {showFilters && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Subject</label>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full p-2 bg-gray-900/50 border border-gray-600/50 text-white rounded-lg focus:ring-2 focus:ring-blue-500/50"
              >
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Post Type</label>
              <div className="grid grid-cols-2 gap-2">
                {postTypeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setPostTypeFilter(option.value)}
                    className={`p-2 rounded-lg text-sm transition-all ${
                      postTypeFilter === option.value
                        ? 'bg-blue-500/20 border-2 border-blue-500 text-white'
                        : 'bg-gray-900/50 border border-gray-600/50 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <span className="mr-1">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Posts Feed */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-6">
          {filteredPosts.map((post) => {
            const badge = getPostTypeBadge(post.postType);
            
            return (
              <div key={post._id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      {post.author?.profilePicture ? (
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}${post.author.profilePicture}`}
                          alt={post.author.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User size={20} className="text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAuthorClick(post.author?._id, post.author?.name)}
                          className="text-white font-semibold hover:text-blue-400 transition-colors"
                        >
                          {post.author?.name || 'Anonymous'}
                        </button>
                        {post.author?.isVerified && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock size={12} />
                        {formatTimeAgo(post.createdAt)}
                        {post.author?.reputation > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-yellow-400">⭐ {post.author.reputation}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => toggleDropdown(post._id)}
                      className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700/50"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {activeDropdown === post._id && (
                      <div className="absolute right-0 top-full mt-2 z-50">
                        <PostSettings
                          postId={post._id}
                          authorId={post.author?._id}
                          onClose={handleCloseDropdown}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Type & Subject Badge */}
                <div className="px-4 pb-2 flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-700/50 text-gray-300 flex items-center gap-1">
                    <BookOpen size={12} />
                    {post.subject}
                  </span>
                </div>

                {/* Post Image */}
                <div className="relative">
                  <img
                    src={`http://localhost:5000/${post.image}`}
                    alt="Post content"
                    className="w-full h-96 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
                    }}
                  />
                </div>

                {/* Post Actions */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleMarkHelpful(post._id)}
                        className="flex items-center space-x-2 text-gray-400 hover:text-green-500 transition-colors"
                      >
                        <Heart size={20} className={post.isHelpful ? 'fill-green-500 text-green-500' : ''} />
                        <span className="text-sm">
                          {post.helpfulCount || 0} helpful
                        </span>
                      </button>
                      <button
                        onClick={() => handleOpenComments(post._id)}
                        className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <MessageCircle size={20} />
                        <span className="text-sm">{post.commentCount || 0}</span>
                      </button>
                      <button className="text-gray-400 hover:text-green-400 transition-colors">
                        <Share2 size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Post Caption */}
                  {post.caption && (
                    <div className="mb-3">
                      <p className="text-white">
                        <span className="font-semibold mr-2">{post.author?.name}</span>
                        {post.caption}
                      </p>
                    </div>
                  )}

                  {/* Comments Preview */}
                  {post.comments?.length > 0 && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleOpenComments(post._id)}
                        className="text-gray-400 text-sm hover:text-white transition-colors"
                      >
                        View all {post.commentCount} comments
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center mt-12">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
            <p className="text-gray-400 mb-4">
              {subjectFilter !== 'all' || postTypeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Be the first to share something amazing!'}
            </p>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* ✅ MOBILE VIEW */}
      <div className="lg:hidden">
        <MobileViewBar />
        
        <div className="max-w-xl mx-auto p-4">
          <div className="text-center mb-6 pt-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Learning Hub
            </h1>
            <p className="text-gray-400">Share knowledge, ask questions, help others learn</p>
          </div>

          <PostsList />
        </div>

        <MobileViewIcons />
      </div>

      {/* ✅ DESKTOP VIEW */}
      <div className="hidden lg:block">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="fixed top-4 left-4 z-50 p-3 bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white hover:bg-gray-700/90 transition-all shadow-lg"
        >
          {showSidebar ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Sidebar Overlay */}
        {showSidebar && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowSidebar(false)}
            />
            <div className="fixed left-0 top-0 h-full w-64 z-50">
              <DashSidebar />
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl px-4 py-8">
            {/* Top Navigation Bar */}
            <div className="mb-6 flex items-center justify-between bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Home size={20} />
                <span className="font-medium">Dashboard</span>
              </button>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Learning Hub
              </h2>
              <div className="w-24"></div>
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