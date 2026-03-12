import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, Users, MessageCircle, FileText, Sparkles,
  Clock, TrendingUp, CheckCircle, Lock, Unlock, UserPlus
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const GlobalSearch = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

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
        
        // Save to recent searches
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

  const handleStartDM = async (userId) => {
    try {
      const response = await axiosInstance.post('/api/start-new-chat', { userId });
      if (response.data.success) {
        navigate('/inbox');
        onClose();
      }
    } catch (error) {
      console.error('Error starting DM:', error);
      alert('Failed to start conversation');
    }
  };

  const handleJoinGroup = async (groupId, isPrivate) => {
    try {
      const response = await axiosInstance.post('/api/join-group', { groupId });

      if (response.data.success) {
        if (response.data.isPending) {
          alert('Join request sent!');
        } else if (response.data.alreadyMember) {
          navigate('/inbox');
        } else {
          alert('Joined successfully!');
          navigate('/inbox');
        }
        onClose();
      }
    } catch (error) {
      console.error('Error joining group:', error);
      alert(error.response?.data?.message || 'Failed to join group');
    }
  };

  const handleViewPost = (postId) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm pt-20 px-4">
      {/* Modal */}
      <div className="w-full max-w-3xl bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search users, groups, posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              />
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-gray-800/50 text-gray-400 hover:text-white rounded-xl transition-colors"
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
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
                <Clock size={16} className="text-gray-400" />
                <h3 className="text-white font-medium">Recent Searches</h3>
              </div>
              {recentSearches.length > 0 ? (
                <div className="space-y-2">
                  {recentSearches.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(query)}
                      className="w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent searches</p>
              )}
            </div>
          ) : loading ? (
            /* Loading */
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : displayResults.length === 0 ? (
            /* No Results */
            <div className="flex flex-col items-center justify-center py-12">
              <Search size={48} className="text-gray-600 mb-4" />
              <p className="text-gray-400">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            /* Results List */
            <div className="divide-y divide-gray-700/30">
              {displayResults.map((item, index) => {
                if (item.type === 'user' || (!item.type && item.email)) {
                  return (
                    <div key={`user-${item._id || index}`} className="p-4 hover:bg-gray-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          {item.profilePicture ? (
                            <img
                              src={`${import.meta.env.VITE_BACKEND_URL}${item.profilePicture}`}
                              alt={item.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold">
                              {item.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{item.name}</p>
                            {item.isVerified && (
                              <CheckCircle size={16} className="text-blue-400" />
                            )}
                            {item.isOnline && (
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">{item.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              item.status === 'Ready To Teach'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-purple-500/20 text-purple-400'
                            }`}>
                              {item.status === 'Ready To Teach' ? '👨‍🏫 Teacher' : '📚 Learner'}
                            </span>
                            {item.reputation > 0 && (
                              <span className="text-xs text-yellow-400">⭐ {item.reputation}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartDM(item._id)}
                          className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors text-sm font-medium"
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  );
                }

                if (item.type === 'group' || (!item.type && item.groupName)) {
                  return (
                    <div key={`group-${item._id || index}`} className="p-4 hover:bg-gray-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          {item.groupPicture ? (
                            <img
                              src={`${import.meta.env.VITE_BACKEND_URL}${item.groupPicture}`}
                              alt={item.groupName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <Users size={24} className="text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium">{item.groupName}</p>
                          <p className="text-gray-400 text-sm line-clamp-1">{item.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              {item.memberCount} members
                            </span>
                            {item.isPrivate ? (
                              <Lock size={12} className="text-orange-400" />
                            ) : (
                              <Unlock size={12} className="text-green-400" />
                            )}
                          </div>
                        </div>
                        {item.isMember ? (
                          <button
                            onClick={() => {
                              navigate('/inbox');
                              onClose();
                            }}
                            className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-sm font-medium"
                          >
                            Open
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinGroup(item._id, item.isPrivate)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium"
                          >
                            {item.isPrivate ? 'Request' : 'Join'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }

                if (item.type === 'post' || (!item.type && item.caption)) {
                  return (
                    <div key={`post-${item._id || index}`} className="p-4 hover:bg-gray-800/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                          {item.author?.profilePicture ? (
                            <img
                              src={`${import.meta.env.VITE_BACKEND_URL}${item.author.profilePicture}`}
                              alt={item.author.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold">
                              {item.author?.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium">{item.author?.name}</p>
                          <p className="text-gray-300 text-sm line-clamp-2 mt-1">{item.caption}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                              {item.subject}
                            </span>
                            <span>👍 {item.helpfulCount || 0}</span>
                            <span>💬 {item.comments?.length || 0}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewPost(item._id)}
                          className="px-4 py-2 bg-gray-700/50 text-white rounded-xl hover:bg-gray-600/50 transition-colors text-sm font-medium"
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