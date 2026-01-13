import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, User, Clock } from 'lucide-react';
import UserProfile from '../components/UserProfile';
import DashSidebar from '../components/DashSidebar';
import MobileViewIcons from '../components/MobileViewIcons';
import MobileViewBar from '../components/MobileViewBar';
import PostComment from './PostComment';
import PostSettings from './PostSettings';
import { usePostContext } from '../Context/PostContext';
import FindOutLoader from '../Loader/FindOutLoader';

const AllPost = () => {
  // Get everything from PostContext
  const {
    posts,
    postsLoading,
    postsError,
    fetchPosts,
    likePost,
    formatTimeAgo
  } = usePostContext();

  // Local state for UI interactions
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeCommentModal, setActiveCommentModal] = useState(null);
  const dropdownRef = useRef(null);

  // Load posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Close dropdown when clicking outside
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

  // Handle like post using context
  const handleLike = async (postId) => {
    try {
      await likePost(postId);
    } catch (error) {
      console.error('Error liking post:', error);
      // You could show a toast notification here
    }
  };

  // Handle dropdown toggle
  const toggleDropdown = (postId) => {
    setActiveDropdown(activeDropdown === postId ? null : postId);
  };

  // Handle closing dropdown
  const handleCloseDropdown = () => {
    setActiveDropdown(null);
  };

  // Handle opening comment modal
  const handleOpenComments = (postId) => {
    setActiveCommentModal(postId);
  };

  // Handle closing comment modal
  const handleCloseComments = () => {
    setActiveCommentModal(null);
  };

  // Handle retry
  const handleRetry = () => {
    fetchPosts();
  };

  if (postsLoading) {
    return (
      <FindOutLoader />
    );
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 ml-0 md:ml-60">

      <div className=''>
        <DashSidebar />
      </div>

      <div>
        <MobileViewBar />
      </div>

      <div>
        <div className="max-w-xl mx-auto p-4">
          {/* Header */}
          <div className="text-center mb-8 pt-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Social Feed
            </h1>
            <p className="text-gray-400">Discover amazing moments from the community</p>
          </div>

          {/* Posts Feed */}
          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
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
                        <h3 className="text-white font-semibold">{post.author?.name || 'Anonymous'}</h3>
                        <div className="flex items-center text-gray-400 text-sm">
                          <Clock size={12} className="mr-1" />
                          {formatTimeAgo(post.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Dropdown Menu */}
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

                  {/* Post Image */}
                  <div className="relative">
                    <img
                      src={`http://localhost:5000/${post.image}`}
                      // src={`${import.meta.env.VITE_BACKEND_URL}${post.image}`}
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
                          onClick={() => handleLike(post._id)}
                          className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Heart size={20} className={post.isLiked ? 'fill-red-500 text-red-500' : ''} />
                          <span>{post.likeCount || 0}</span>
                        </button>
                        <button
                          onClick={() => handleOpenComments(post._id)}
                          className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <MessageCircle size={20} />
                          <span>{post.commentCount || 0}</span>
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
                        {post.comments.slice(0, 2).map((comment, index) => (
                          <div key={index} className="text-sm">
                            <span className="text-white font-semibold mr-2">
                              {comment.user?.name}
                            </span>
                            <span className="text-gray-300">{comment.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* No Posts Message */
            <div className="text-center mt-12">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                <p className="text-gray-400 mb-4">Be the first to share something amazing!</p>
                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors">
                  Create Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <MobileViewIcons />
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