import React, { createContext, useContext, useState } from "react";
import axiosInstance from '../utils/axiosInstance';

export const PostContext = createContext();

// Custom hook to use the PostContext
export const usePostContext = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePostContext must be used within a PostContextProvider');
  }
  return context;
};

const PostContextProvider = ({ children }) => {
  // Posts state
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(null);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      setPostsError(null);
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get('/api/getallposts');

      if (response.data.success) {
        setPosts(response.data.posts);
        return response.data.posts;
      } else {
        throw new Error('Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch posts. Please check if the server is running.';
      setPostsError(errorMessage);
      setError(errorMessage);
      setPosts([]);
      return [];
    } finally {
      setPostsLoading(false);
      setLoading(false);
    }
  };

  const likePost = async (postId) => {
    try {
      const response = await axiosInstance.post(`/api/posts/${postId}/like`);
      if (response.data.success) {
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === postId
              ? {
                  ...post,
                  likeCount: response.data.likeCount,
                  isLiked: response.data.liked // Note: using 'liked' from backend response
                }
              : post
          )
        );
        return {
          liked: response.data.liked,
          likeCount: response.data.likeCount
        };
      } else {
        throw new Error(response.data.message || 'Failed to like post');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      setError(error.message || 'Failed to like post');
      throw error;
    }
  };

  const deletePost = async (postId) => {
    try {
      setError(null);
      const response = await axiosInstance.delete(`/api/posts/delete-post/${postId}`);
      
      if (response.data.success) {
        setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete post';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getPostById = (postId) => {
    return posts.find(post => post._id === postId);
  };

  const updatePost = (postId, updates) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId
          ? { ...post, ...updates }
          : post
      )
    );
  };

  const removePost = (postId) => {
    setPosts(prevPosts =>
      prevPosts.filter(post => post._id !== postId)
    );
  };

  const addPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const clearPosts = () => {
    setPosts([]);
    setPostsError(null);
  };

  const getPostsCount = () => {
    return posts.length;
  };


  const fetchComments = async (postId) => {
    try {
      setCommentsLoading(true);
      setCommentsError(null);
      const response = await axiosInstance.get(`/api/posts/${postId}/get-comments`);
      if (response.data.success) {
        setComments(response.data.comments);
        return response.data.comments;
      } else {
        throw new Error(response.data.message || 'Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      const errorMessage = error.message || 'Failed to fetch comments';
      setCommentsError(errorMessage);
      setComments([]);
      return [];
    } finally {
      setCommentsLoading(false);
    }
  };

  const addComment = async (postId, text) => {
    try {
      setCommentsError(null);
      const response = await axiosInstance.post(`/api/posts/${postId}/comments`, {
        text: text.trim()
      });

      if (response.data.success) {
        const newComment = response.data.comment;
        setComments(prevComments => [newComment, ...prevComments]);
        
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === postId
              ? { ...post, commentCount: (post.commentCount || 0) + 1 }
              : post
          )
        );
        
        return newComment;
      } else {
        throw new Error(response.data.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setCommentsError(error.message || 'Failed to add comment');
      throw error;
    }
  };

  const likeComment = async (commentId) => {
    try {
      setCommentsError(null);
      const response = await axiosInstance.post(`/api/comments/${commentId}/like`);
      
      if (response.data.success) {
        setComments(prevComments =>
          prevComments.map(comment =>
            comment._id === commentId
              ? {
                  ...comment,
                  likeCount: response.data.likeCount,
                  isLiked: response.data.liked
                }
              : comment
          )
        );
        return {
          liked: response.data.liked,
          likeCount: response.data.likeCount
        };
      } else {
        throw new Error(response.data.message || 'Failed to like comment');
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      setCommentsError(error.message || 'Failed to like comment');
      throw error;
    }
  };

  const clearComments = () => {
    setComments([]);
    setCommentsError(null);
  };

  const getCommentsCount = () => {
    return comments.length;
  };

  const hasComment = (commentId) => {
    return comments.some(comment => comment._id === commentId);
  };

  const getCommentById = (commentId) => {
    return comments.find(comment => comment._id === commentId);
  };

  const updateComment = (commentId, updates) => {
    setComments(prevComments =>
      prevComments.map(comment =>
        comment._id === commentId
          ? { ...comment, ...updates }
          : comment
      )
    );
  };

  const removeComment = (commentId) => {
    setComments(prevComments =>
      prevComments.filter(comment => comment._id !== commentId)
    );
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return postDate.toLocaleDateString();
  };

  const clearErrors = () => {
    setError(null);
    setPostsError(null);
    setCommentsError(null);
  };

  const clearAllData = () => {
    setPosts([]);
    setComments([]);
    clearErrors();
  };

  const value = {
    // Posts state
    posts,
    postsLoading,
    postsError,
    
    // Comments state
    comments,
    commentsLoading,
    commentsError,
    
    // General state
    loading,
    error,
    
    // Post operations
    fetchPosts,
    likePost,
    deletePost, // New delete functionality
    getPostById,
    updatePost,
    removePost,
    addPost,
    clearPosts,
    getPostsCount,
    
    // Comment operations
    fetchComments,
    addComment,
    likeComment,
    clearComments,
    updateComment,
    removeComment,
    getCommentsCount,
    hasComment,
    getCommentById,
    
    // Utility functions
    formatTimeAgo,
    clearErrors,
    clearAllData,
    
    // State setters (for direct manipulation if needed)
    setPosts,
    setComments,
    setLoading,
    setError,
    setPostsLoading,
    setPostsError,
    setCommentsLoading,
    setCommentsError
  };

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
};

export default PostContextProvider;