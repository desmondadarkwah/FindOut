import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Heart, Reply, Smile, Send, User, Clock, X, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { usePostContext } from '../Context/PostContext';
import { CommentContext } from '../Context/CommentContext';

const PostComment = ({ postId, isOpen, onClose }) => {
  const {
    comments,
    loading,
    error,
    fetchComments,
    addComment,
    likeComment,
    clearComments
  } = usePostContext();

  const {
    repliesError,
    addReply,
    fetchReplies,
    deleteReply,
    getRepliesForComment,
    areRepliesLoaded,
    isLoadingReplies,
    clearAllReplies
  } = useContext(CommentContext);

  const [newComment, setNewComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const quickEmojis = ['😀', '😂', '😍', '😭', '👍', '❤️', '🔥', '💯', '🙌', '👏'];

  useEffect(() => {
    if (isOpen && postId) fetchComments(postId);
    if (!isOpen) {
      clearComments(); clearAllReplies();
      setExpandedReplies(new Set()); setReplyingTo(null);
      setReplyText(''); setNewComment(''); setShowEmojiPicker(false);
    }
  }, [isOpen, postId, fetchComments, clearComments, clearAllReplies]);

  useEffect(() => {
    if (comments.length > 0) {
      comments
        .filter(c => c.replyCount > 0 && expandedReplies.has(c._id))
        .forEach(c => { if (!areRepliesLoaded(c._id)) fetchReplies(c._id).catch(console.error); });
    }
  }, [comments, expandedReplies, areRepliesLoaded, fetchReplies]);

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await addComment(postId, newComment.trim());
      setNewComment(''); setShowEmojiPicker(false);
    } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
  }, [newComment, isSubmitting, addComment, postId]);

  const handleLikeComment = useCallback(async (commentId) => {
    try { await likeComment(commentId); } catch (e) { console.error(e); }
  }, [likeComment]);

  const handleAddReply = useCallback(async (commentId) => {
    if (!replyText.trim() || isSubmittingReply) return;
    try {
      setIsSubmittingReply(true);
      await addReply(commentId, replyText.trim());
      setReplyText(''); setReplyingTo(null);
      setExpandedReplies(prev => new Set([...prev, commentId]));
    } catch (e) { console.error(e); } finally { setIsSubmittingReply(false); }
  }, [replyText, isSubmittingReply, addReply]);

  const handleToggleReplies = useCallback(async (commentId) => {
    if (expandedReplies.has(commentId)) {
      setExpandedReplies(prev => { const s = new Set(prev); s.delete(commentId); return s; });
    } else {
      try {
        await fetchReplies(commentId);
        setExpandedReplies(prev => new Set([...prev, commentId]));
      } catch (e) { console.error(e); }
    }
  }, [expandedReplies, fetchReplies]);

  const formatTimeAgo = useCallback((date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return new Date(date).toLocaleDateString();
  }, []);

  const addEmoji = useCallback((emoji) => {
    if (replyingTo) setReplyText(p => p + emoji);
    else setNewComment(p => p + emoji);
    setShowEmojiPicker(false);
  }, [replyingTo]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (replyingTo) handleAddReply(replyingTo);
      else handleAddComment();
    }
  }, [replyingTo, handleAddReply, handleAddComment]);

  const handleReplyToggle = useCallback((commentId) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setReplyText('');
  }, [replyingTo]);

  if (!isOpen) return null;

  /* shared input style */
  const inputStyle = {
    width: '100%',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: 13,
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.55,
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const Avatar = ({ src, name, size = 34 }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--bg-card-hover)',
      border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, overflow: 'hidden',
    }}>
      {src
        ? <img
          src={
            src?.startsWith('http')
              ? src
              : `${import.meta.env.VITE_BACKEND_URL}${src}`
          }
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        : <User size={size * 0.45} color="var(--text-secondary)" />
      }
    </div>
  );

  /* send button */
  const SendBtn = ({ onClick, disabled, loading: spin, size = 16 }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 36, height: 36, borderRadius: 10, border: 'none',
        background: disabled
          ? 'var(--bg-card)'
          : 'linear-gradient(135deg,#3b82f6,#6366f1)',
        color: disabled ? 'var(--text-muted)' : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        flexShrink: 0, transition: 'opacity 0.2s',
      }}
    >
      {spin
        ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'pc-spin 0.7s linear infinite' }} />
        : <Send size={size} />
      }
    </button>
  );

  return (
    <>
      <style>{`
        @keyframes pc-spin { to { transform:rotate(360deg); } }
        @keyframes pc-slide-up { from { opacity:0; transform:translateY(24px) scale(0.98); } to { opacity:1; transform:none; } }

        .pc-modal {
          position: fixed; inset: 0; z-index: 50;
          display: flex; align-items: flex-end; justify-content: center;
          padding: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(6px);
        }
        @media (min-width: 640px) {
          .pc-modal { align-items: center; padding: 16px; }
        }

        .pc-panel {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 24px 24px 0 0;
          width: 100%; max-width: 480px;
          height: 82vh;
          display: flex; flex-direction: column;
          overflow: hidden;
          animation: pc-slide-up 0.3s cubic-bezier(0.34,1.2,0.64,1);
          box-shadow: 0 -8px 60px rgba(0,0,0,0.6);
        }
        @media (min-width: 640px) {
          .pc-panel { border-radius: 24px; height: 78vh; }
        }

        .pc-scroll::-webkit-scrollbar { width: 4px; }
        .pc-scroll::-webkit-scrollbar-track { background: transparent; }
        .pc-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

        .pc-input:focus {
          border-color: rgba(99,102,241,0.5) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08) !important;
        }

        .pc-action-btn {
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 600;
          padding: 4px 8px; border-radius: 6px;
          transition: all 0.15s;
          letter-spacing: 0.02em;
        }
        .pc-action-btn:hover { background: var(--bg-card-hover); }
      `}</style>

      <div className="pc-modal" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="pc-panel">

          {/* HEADER */}
          <div style={{
            position: 'relative',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            {/* FIX: this drag-handle pill used position:absolute with no
                positioned ancestor — it fell back to .pc-modal (the
                full-screen fixed backdrop) instead of this header, so it
                rendered near the top of the viewport instead of at the
                top of the panel. Added position:relative to the header
                itself so it anchors where it visually should. */}
            <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 36, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 99 }} />

            <div>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15, margin: 0, letterSpacing: '-0.01em' }}>Comments</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: 0, marginTop: 2 }}>{comments.length} total</p>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '7px 8px',
                color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <X size={16} />
            </button>
          </div>

          {/* ERROR */}
          {(error || repliesError) && (
            <div style={{
              padding: '10px 20px', flexShrink: 0,
              background: 'rgba(239,68,68,0.08)',
              borderBottom: '1px solid rgba(239,68,68,0.15)',
            }}>
              <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error || repliesError}</p>
            </div>
          )}

          {/* COMMENTS LIST */}
          <div className="pc-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minHeight: 0 }}>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: 32, height: 32, border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'pc-spin 0.7s linear infinite', margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading comments…</p>
              </div>
            ) : comments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {comments.map((comment) => (
                  <div key={comment._id}>

                    {/* COMMENT */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <Avatar src={comment.user?.profilePicture} name={comment.user?.name} size={34} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px 14px 14px 14px',
                          padding: '10px 14px',
                        }}>
                          <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 12, margin: '0 0 4px', letterSpacing: '0.01em' }}>
                            {comment.user?.name || 'Anonymous'}
                          </p>
                          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                            {comment.text}
                          </p>
                        </div>

                        {/* actions row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, paddingLeft: 4 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                            <Clock size={10} />{formatTimeAgo(comment.createdAt)}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>·</span>

                          <button
                            className="pc-action-btn"
                            onClick={() => handleLikeComment(comment._id)}
                            style={{ color: comment.isLiked ? '#f87171' : 'var(--text-secondary)' }}
                          >
                            <Heart size={11} style={{ fill: comment.isLiked ? '#f87171' : 'none' }} />
                            {comment.likeCount || 0}
                          </button>

                          <button
                            className="pc-action-btn"
                            onClick={() => handleReplyToggle(comment._id)}
                            style={{ color: replyingTo === comment._id ? '#818cf8' : 'var(--text-secondary)' }}
                          >
                            <Reply size={11} />Reply
                          </button>

                          {comment.replyCount > 0 && (
                            <button
                              className="pc-action-btn"
                              onClick={() => handleToggleReplies(comment._id)}
                              disabled={isLoadingReplies(comment._id)}
                              style={{ color: '#818cf8', marginLeft: 'auto' }}
                            >
                              {expandedReplies.has(comment._id) ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                              {isLoadingReplies(comment._id) ? 'Loading…' : `${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* REPLY INPUT */}
                    {replyingTo === comment._id && (
                      <div style={{ marginLeft: 44, marginTop: 10, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                        <Avatar size={26} />
                        <div style={{ flex: 1, position: 'relative' }}>
                          <textarea
                            className="pc-input"
                            style={{ ...inputStyle, paddingRight: 44 }}
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Reply to ${comment.user?.name || 'Anonymous'}…`}
                            disabled={isSubmittingReply}
                            rows={2}
                          />
                        </div>
                        <SendBtn
                          onClick={() => handleAddReply(comment._id)}
                          disabled={!replyText.trim() || isSubmittingReply}
                          loading={isSubmittingReply}
                        />
                      </div>
                    )}

                    {/* REPLIES */}
                    {expandedReplies.has(comment._id) && (
                      <div style={{ marginLeft: 44, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {isLoadingReplies(comment._id) ? (
                          <div style={{ textAlign: 'center', padding: '12px 0' }}>
                            <div style={{ width: 20, height: 20, border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'pc-spin 0.7s linear infinite', margin: '0 auto 6px' }} />
                            <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>Loading replies…</p>
                          </div>
                        ) : getRepliesForComment(comment._id).length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: 11, textAlign: 'center', padding: '8px 0' }}>No replies yet</p>
                        ) : (
                          getRepliesForComment(comment._id).map(reply => (
                            <div key={reply._id} style={{ display: 'flex', gap: 8 }}>
                              <Avatar
                                src={reply.user?.profilePicture}
                                name={reply.user?.name}
                                size={26}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  background: 'var(--bg-card)',
                                  border: '1px solid var(--border)',
                                  borderRadius: '4px 12px 12px 12px',
                                  padding: '8px 12px',
                                }}>
                                  <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 11, margin: '0 0 3px' }}>
                                    {reply.user?.name || 'Anonymous'}
                                  </p>
                                  <p style={{ color: 'var(--text-secondary)', fontSize: 12, margin: 0, lineHeight: 1.55 }}>
                                    {reply.text}
                                  </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, paddingLeft: 2 }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--text-muted)' }}>
                                    <Clock size={9} />{formatTimeAgo(reply.createdAt)}
                                  </span>
                                  <button
                                    className="pc-action-btn"
                                    style={{ color: 'var(--text-muted)', fontSize: 10 }}
                                  >
                                    <Heart size={9} />{reply.likeCount || 0}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <MessageCircle size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>No comments yet</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>Be the first to comment!</p>
              </div>
            )}
          </div>

          {/* COMMENT INPUT */}
          <div style={{
            borderTop: '1px solid var(--border)',
            padding: '12px 20px 16px',
            flexShrink: 0,
            background: 'rgba(0,0,0,0.2)',
          }}>
            {/* Emoji picker — real user-facing emoji content, left as-is */}
            {showEmojiPicker && (
              <div style={{
                marginBottom: 10, padding: '10px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                display: 'flex', flexWrap: 'wrap', gap: 6,
              }}>
                {quickEmojis.map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => addEmoji(emoji)}
                    style={{
                      fontSize: 20, background: 'none', border: 'none', cursor: 'pointer',
                      padding: '4px 6px', borderRadius: 8, transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >{emoji}</button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <Avatar size={32} />

              <div style={{ flex: 1, position: 'relative' }}>
                <textarea
                  className="pc-input"
                  style={{ ...inputStyle, paddingRight: 40 }}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a comment…"
                  disabled={isSubmitting}
                  rows={2}
                />
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  disabled={isSubmitting}
                  style={{
                    position: 'absolute', right: 10, top: 10,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: showEmojiPicker ? '#eab308' : 'var(--text-muted)',
                    transition: 'color 0.2s', padding: 0,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <Smile size={16} />
                </button>
              </div>

              <SendBtn
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSubmitting}
                loading={isSubmitting}
              />
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default PostComment;