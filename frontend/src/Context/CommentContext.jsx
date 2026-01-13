import { createContext, useState, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';

export const CommentContext = createContext();

const CommentContextProvider = ({ children }) => {
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

  // Replies state
  const [replies, setReplies] = useState({});
  const [repliesLoading, setRepliesLoading] = useState({});
  const [repliesError, setRepliesError] = useState(null);

  // NEW: Function to populate replies from comments data
  const populateRepliesFromComments = useCallback((commentsData) => {
    console.log('Populating replies from comments:', commentsData);
    
    const repliesData = {};
    commentsData.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        repliesData[comment._id] = comment.replies;
        console.log(`Populated ${comment.replies.length} replies for comment ${comment._id}`);
      }
    });
    
    setReplies(prevReplies => ({
      ...prevReplies,
      ...repliesData
    }));
    
    console.log('Total replies populated:', Object.keys(repliesData).length);
  }, []);

  // Add a reply to a comment
  const addReply = useCallback(async (commentId, text) => {
    try {
      // console.log('Adding reply to comment:', commentId, 'text:', text);
      setRepliesError(null);
      
      const response = await axiosInstance.post(`/api/comments/${commentId}/reply`, {
        text: text.trim()
      });

      console.log('Add reply response:', response.data);

      if (response.data.success) {
        const newReply = response.data.reply;
        
        console.log('New reply added:', newReply);
        
        // Update replies state
        setReplies(prevReplies => {
          const updatedReplies = {
            ...prevReplies,
            [commentId]: [
              ...(prevReplies[commentId] || []),
              newReply
            ]
          };
          console.log('Updated replies state:', updatedReplies[commentId]);
          return updatedReplies;
        });
        
        // Update the comment's reply count in comments state
        setComments(prevComments =>
          prevComments.map(comment =>
            comment._id === commentId
              ? { 
                  ...comment, 
                  replyCount: response.data.replyCount || (comment.replyCount || 0) + 1
                }
              : comment
          )
        );
        
        return newReply;
      } else {
        throw new Error(response.data.message || 'Failed to add reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add reply';
      setRepliesError(errorMessage);
      throw error;
    }
  }, []);

  // Fetch replies for a specific comment
  const fetchReplies = useCallback(async (commentId, page = 1, limit = 10) => {
    try {
      console.log('Fetching replies for comment:', commentId, 'page:', page);
      
      setRepliesLoading(prev => ({ ...prev, [commentId]: true }));
      setRepliesError(null);
      
      const response = await axiosInstance.get(`/api/comments/${commentId}/replies`, {
        params: { page, limit }
      });

      console.log('Fetch replies response:', response.data);
      
      if (response.data.success) {
        const fetchedReplies = response.data.replies;
        
        console.log('Fetched replies:', fetchedReplies);
        
        // Update replies state
        setReplies(prevReplies => {
          const updatedReplies = {
            ...prevReplies,
            [commentId]: page === 1 ? fetchedReplies : [
              ...(prevReplies[commentId] || []),
              ...fetchedReplies
            ]
          };
          console.log('Updated replies state after fetch:', updatedReplies[commentId]);
          return updatedReplies;
        });
        
        return {
          replies: fetchedReplies,
          totalReplies: response.data.totalReplies,
          hasMore: response.data.hasMore,
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch replies');
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch replies';
      setRepliesError(errorMessage);
      throw error;
    } finally {
      setRepliesLoading(prev => ({ ...prev, [commentId]: false }));
    }
  }, []);

  // Delete a reply
  const deleteReply = useCallback(async (commentId, replyId) => {
    try {
      console.log('Deleting reply:', replyId, 'from comment:', commentId);
      
      setRepliesError(null);
      const response = await axiosInstance.delete(`/api/comments/${commentId}/replies/${replyId}`);
      
      if (response.data.success) {
        console.log('Reply deleted successfully');
        
        // Remove reply from state
        setReplies(prevReplies => ({
          ...prevReplies,
          [commentId]: (prevReplies[commentId] || []).filter(reply => reply._id !== replyId)
        }));
        
        // Update comment's reply count
        setComments(prevComments =>
          prevComments.map(comment =>
            comment._id === commentId
              ? { 
                  ...comment, 
                  replyCount: response.data.replyCount || Math.max(0, (comment.replyCount || 1) - 1)
                }
              : comment
          )
        );
        
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to delete reply');
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete reply';
      setRepliesError(errorMessage);
      throw error;
    }
  }, []);

  // Utility functions
  const getRepliesForComment = useCallback((commentId) => {
    const commentReplies = replies[commentId] || [];
    // console.log('Getting replies for comment:', commentId, 'found:', commentReplies.length);
    return commentReplies;
  }, [replies]);

  const clearRepliesForComment = useCallback((commentId) => {
    // console.log('Clearing replies for comment:', commentId);
    setReplies(prevReplies => {
      const newReplies = { ...prevReplies };
      delete newReplies[commentId];
      return newReplies;
    });
  }, []);

  const clearAllReplies = useCallback(() => {
    console.log('Clearing all replies');
    setReplies({});
    setRepliesError(null);
    setRepliesLoading({});
  }, []);

  const getRepliesCount = useCallback((commentId) => {
    const count = (replies[commentId] || []).length;
    console.log('Getting replies count for comment:', commentId, 'count:', count);
    return count;
  }, [replies]);

  const areRepliesLoaded = useCallback((commentId) => {
    const loaded = replies.hasOwnProperty(commentId);
    console.log('Are replies loaded for comment:', commentId, '?', loaded);
    return loaded;
  }, [replies]);

  const isLoadingReplies = useCallback((commentId) => {
    return repliesLoading[commentId] || false;
  }, [repliesLoading]);

  const value = {
    // Comments state
    comments,
    commentsLoading,
    commentsError,
    setComments,
    setCommentsLoading,
    setCommentsError,
    
    // Replies state
    replies,
    repliesLoading,
    repliesError,
    setReplies,
    setRepliesLoading,
    setRepliesError,
    
    // Reply operations
    addReply,
    fetchReplies,
    deleteReply,
    getRepliesForComment,
    clearRepliesForComment,
    clearAllReplies,
    getRepliesCount,
    areRepliesLoaded,
    isLoadingReplies,
    
    // NEW: Function to populate replies from comments
    populateRepliesFromComments
  };

  return (
    <CommentContext.Provider value={value}>
      {children}
    </CommentContext.Provider>
  );
};

export default CommentContextProvider;