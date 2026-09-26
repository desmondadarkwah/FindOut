import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, Users, MessageCircle, FileText, Sparkles,
  Clock, CheckCircle, Lock, Unlock, GraduationCap, BookOpen,
  Star, ThumbsUp,
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { useToast } from '../Context/ToastContext';

const GlobalSearch = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState({ users: [], groups: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Search with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResults({ users: [], groups: [], posts: [] });
      return;
    }

    const timer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  const performSearch = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get('/api/search', {
        params: {
          query: searchQuery,
          type: activeTab,
          limit: 10
        }
      });

      if (response.data.success) {
        setResults(response.data.results);
        saveRecentSearch(searchQuery);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRecentSearch = (query) => {
    const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // FIX: replaced alert() with toast — matches the rest of the app.
  const handleStartDM = async (userId) => {
    try {
      const response = await axiosInstance.post('/api/start-new-chat', { userId });
      if (response.data.success) {
        navigate('/inbox');
        onClose();
      }
    } catch (error) {
      console.error('Error starting DM:', error);
      toast.error('Failed to start conversation');
    }
  };

  const handleJoinGroup = async (groupId, privacy) => {
    try {
      const response = await axiosInstance.post('/api/join-group', { groupId });

      if (response.data.success) {
        if (response.data.isPending) {
          toast.info('Join request sent!');
        } else if (response.data.alreadyMember) {
          navigate('/inbox');
        } else {
          toast.success('Joined successfully!');
          navigate('/inbox');
        }
        onClose();
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error(error.response?.data?.message || 'Failed to join group');
    }
  };

  const handleViewPost = (postId) => {
    // NOTE: this navigates to the feed generally rather than deep-linking
    // to this specific post — left as-is since there's no per-post detail
    // route visible in this file to link to; worth wiring up if/when one
    // exists.
    navigate('/feed');
    onClose();
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'groups', label: 'Groups', icon: MessageCircle },
    { id: 'posts', label: 'Posts', icon: FileText }
  ];

  const allResults = [
    ...(results.users || []).map(u => ({ ...u, type: 'user' })),
    ...(results.groups || []).map(g => ({ ...g, type: 'group' })),
    ...(results.posts || []).map(p => ({ ...p, type: 'post' }))
  ];

  const displayResults = activeTab === 'all' ? allResults : results[activeTab] || [];

  // One consistent neutral avatar treatment instead of a different
  // gradient per result type (blue/purple for users, green/blue for
  // groups, yellow/orange for posts) — matches the plain-avatar
  // convention already established across AllPost, ChatSidebar, and
  // Suggestions.
  const Avatar = ({ src, alt, fallback }) => (
    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-[var(--bg-card-hover)] border border-[var(--border)]">
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : fallback}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm pt-20 px-4">
      <div className="w-full max-w-3xl bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Header */}
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search users, groups, posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1]/50"
              />
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/40'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] border border-transparent'
                    }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {searchQuery.trim().length < 2 ? (
            /* Recent Searches */
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-[var(--text-muted)]" />
                <h3 className="text-[var(--text-primary)] font-medium">Recent Searches</h3>
              </div>
              {recentSearches.length > 0 ? (
                <div className="space-y-2">
                  {recentSearches.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(query)}
                      className="w-full text-left px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-xl transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--text-muted)] text-sm">No recent searches</p>
              )}
            </div>
          ) : loading ? (
            /* Loading */
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : displayResults.length === 0 ? (
            /* No Results */
            <div className="flex flex-col items-center justify-center py-12">
              <Search size={40} className="text-[var(--text-muted)] mb-4" />
              <p className="text-[var(--text-secondary)]">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            /* Results List */
            <div className="divide-y divide-[var(--border)]">
              {displayResults.map((item, index) => {
                if (item.type === 'user' || (!item.type && item.email)) {
                  return (
                    <div key={`user-${item._id || index}`} className="p-4 hover:bg-[var(--bg-card-hover)] transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar
                          src={item.profilePicture && `${import.meta.env.VITE_BACKEND_URL}${item.profilePicture}`}
                          alt={item.name}
                          fallback={<span className="text-[var(--text-primary)] font-semibold">{item.name?.charAt(0).toUpperCase()}</span>}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[var(--text-primary)] font-medium">{item.name}</p>
                            {item.isVerified && (
                              <CheckCircle size={16} className="text-[#3b82f6]" />
                            )}
                            {item.isOnline && (
                              <span className="w-2 h-2 bg-[#22c55e] rounded-full"></span>
                            )}
                          </div>
                          <p className="text-[var(--text-secondary)] text-sm">{item.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${item.status === 'Ready To Teach'
                                ? 'bg-[#3b82f6]/15 text-[#60a5fa]'
                                : 'bg-[#6366f1]/15 text-[#818cf8]'
                              }`}>
                              {item.status === 'Ready To Teach'
                                ? <><GraduationCap size={11} />Teacher</>
                                : <><BookOpen size={11} />Learner</>}
                            </span>
                            {item.reputation > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs text-[#eab308]">
                                <Star size={11} />{item.reputation}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartDM(item._id)}
                          className="px-4 py-2 bg-[#6366f1]/15 text-[#818cf8] rounded-xl hover:bg-[#6366f1]/25 transition-colors text-sm font-medium"
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  );
                }

                if (item.type === 'group' || (!item.type && item.groupName)) {
                  return (
                    <div key={`group-${item._id || index}`} className="p-4 hover:bg-[var(--bg-card-hover)] transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar
                          src={item.groupPicture && `${import.meta.env.VITE_BACKEND_URL}${item.groupPicture}`}
                          alt={item.groupName}
                          fallback={<Users size={22} className="text-[var(--text-secondary)]" />}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[var(--text-primary)] font-medium">{item.groupName}</p>
                          <p className="text-[var(--text-secondary)] text-sm line-clamp-1">{item.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-[var(--text-muted)]">
                              {item.memberCount} members
                            </span>
                            {/* Private = indigo, Public = blue — matches the
                                same privacy badge convention used in
                                ManageGroup.jsx and ExploreGroups.jsx */}
                            {item.privacy === 'private' ? (
                              <Lock size={12} className="text-[#818cf8]" />
                            ) : (
                              <Unlock size={12} className="text-[#60a5fa]" />
                            )}
                          </div>
                        </div>
                        {item.isMember ? (
                          <button
                            onClick={() => {
                              navigate('/inbox');
                              onClose();
                            }}
                            className="px-4 py-2 bg-[#22c55e]/15 text-[#4ade80] rounded-xl text-sm font-medium"
                          >
                            Open
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinGroup(item._id, item.privacy === 'private')}
                            className="px-4 py-2 bg-[#6366f1] text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
                          >
                            {item.privacy === 'private' ? 'Request' : 'Join'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }

                if (item.type === 'post' || (!item.type && item.caption)) {
                  return (
                    <div key={`post-${item._id || index}`} className="p-4 hover:bg-[var(--bg-card-hover)] transition-colors">
                      <div className="flex items-start gap-4">
                        <Avatar
                          src={item.author?.profilePicture && `${import.meta.env.VITE_BACKEND_URL}${item.author.profilePicture}`}
                          alt={item.author?.name}
                          fallback={<span className="text-[var(--text-primary)] font-semibold">{item.author?.name?.charAt(0).toUpperCase()}</span>}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[var(--text-primary)] font-medium">{item.author?.name}</p>
                          <p className="text-[var(--text-secondary)] text-sm line-clamp-2 mt-1">{item.caption}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                            <span className="px-2 py-1 bg-[#6366f1]/12 text-[#818cf8] rounded-full">
                              {item.subject}
                            </span>
                            <span className="inline-flex items-center gap-1"><ThumbsUp size={11} />{item.helpfulCount || 0}</span>
                            <span className="inline-flex items-center gap-1"><MessageCircle size={11} />{item.comments?.length || 0}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewPost(item._id)}
                          className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-card-hover)] transition-colors text-sm font-medium"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;