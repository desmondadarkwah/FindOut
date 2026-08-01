import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Share2, User, Eye, ArrowLeft, Check, AlertCircle,
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import PostComment from './PostComment';
import FindOutLoader from '../Loader/FindOutLoader';
import { usePostContext } from '../Context/PostContext';
import { sharePost } from '../utils/share';

/**
 * The destination of a shared post link.
 *
 * "Copy link" produced /post/:postId long before any route answered to it, so
 * every shared link landed on the 404 page. This is that route. It fetches the
 * post on its own rather than reading the feed, so a link to an older post
 * still opens even when that post is not in the loaded feed.
 */
const SinglePost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { markHelpful, formatTimeAgo } = usePostContext();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [shareResult, setShareResult] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axiosInstance.get(`/api/posts/${postId}`);
        if (!cancelled) setPost(data.post);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
            'This post could not be loaded. Check your connection and try again.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    // A second render under StrictMode, or a fast navigation between two post
    // links, must not let the earlier response overwrite the later one.
    return () => { cancelled = true; };
  }, [postId]);

  const handleHelpful = async () => {
    if (!post) return;
    try {
      await markHelpful(post._id);
      setPost(p => ({
        ...p,
        isHelpful: !p.isHelpful,
        helpfulCount: Math.max(0, (p.helpfulCount || 0) + (p.isHelpful ? -1 : 1)),
      }));
    } catch (e) {
      console.error('Error marking helpful:', e);
    }
  };

  const handleShare = async () => {
    const outcome = await sharePost({
      postId,
      title: `${post?.author?.name || 'A student'} on FindOut`,
      text: post?.caption || 'Shared from FindOut',
    });
    if (outcome === 'shared' || outcome === 'cancelled') return;
    setShareResult(outcome);
    setTimeout(() => setShareResult(null), 2000);
  };

  const shell = (children) => (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg,#0f0f1a,#0a0a0f,#111827)',
      padding:'24px 16px',
    }}>
      <div style={{ maxWidth:680, margin:'0 auto' }}>
        <button
          onClick={() => navigate('/feed')}
          style={{
            display:'flex', alignItems:'center', gap:8, marginBottom:20,
            padding:'8px 14px', borderRadius:99, cursor:'pointer',
            border:'1px solid rgba(255,255,255,0.07)',
            background:'rgba(255,255,255,0.03)',
            color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:600,
            transition:'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='rgba(99,102,241,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}
        >
          <ArrowLeft size={15} />
          Back to feed
        </button>
        {children}
      </div>
    </div>
  );

  if (loading) return <FindOutLoader />;

  if (error || !post) {
    return shell(
      <div style={{
        background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
        borderRadius:16, padding:'48px 24px', textAlign:'center',
      }}>
        <AlertCircle size={32} color="#f87171" style={{ margin:'0 auto 14px' }} />
        <h1 style={{ color:'#f1f5f9', fontSize:18, fontWeight:700, marginBottom:8 }}>
          Post unavailable
        </h1>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, lineHeight:1.6 }}>
          {error}
        </p>
      </div>
    );
  }

  return shell(
    <>
      <article style={{
        background:'rgba(255,255,255,0.03)',
        border:'1px solid rgba(255,255,255,0.07)',
        borderRadius:16, overflow:'hidden',
      }}>
        {/* Header */}
        <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
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
            ) : <User size={18} color="#fff" />}
          </div>

          <div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ color:'#f1f5f9', fontWeight:700, fontSize:14 }}>
                {post.author?.name || 'Anonymous'}
              </span>
              {post.author?.isVerified && (
                <span style={{
                  fontSize:10, fontWeight:700, letterSpacing:'0.06em',
                  color:'#4ade80', background:'rgba(34,197,94,0.1)',
                  border:'1px solid rgba(34,197,94,0.3)',
                  borderRadius:99, padding:'2px 7px',
                }}>
                  ✓ Verified
                </span>
              )}
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>
              {formatTimeAgo(post.createdAt)}
              {post.subject && ` · ${post.subject}`}
            </div>
          </div>
        </div>

        {/* Image */}
        {post.image && (
          <img
            src={`${import.meta.env.VITE_BACKEND_URL}${post.image}`}
            alt=""
            style={{ width:'100%', display:'block', background:'rgba(0,0,0,0.3)' }}
          />
        )}

        {/* Actions */}
        <div style={{ padding:'12px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
            <button
              onClick={handleHelpful}
              style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'7px 14px', borderRadius:99, cursor:'pointer',
                border: post.isHelpful ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.07)',
                background: post.isHelpful ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                color: post.isHelpful ? '#4ade80' : 'rgba(255,255,255,0.4)',
                fontSize:12, fontWeight:600, transition:'all 0.2s',
              }}
            >
              <Heart size={14} style={{ fill: post.isHelpful ? '#4ade80' : 'none' }} />
              {post.helpfulCount || 0} helpful
            </button>

            <button
              onClick={() => setShowComments(true)}
              style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'7px 14px', borderRadius:99, cursor:'pointer',
                border:'1px solid rgba(255,255,255,0.07)',
                background:'rgba(255,255,255,0.03)',
                color:'rgba(255,255,255,0.4)', fontSize:12, fontWeight:600,
                transition:'all 0.2s',
              }}
            >
              <MessageCircle size={14} />
              {post.commentCount || 0}
            </button>

            <span style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'7px 14px', borderRadius:99,
              color:'rgba(255,255,255,0.4)', fontSize:12, fontWeight:600,
            }}>
              <Eye size={14} />
              {post.viewCount || 0}
            </span>

            <button
              onClick={handleShare}
              aria-label="Share this post"
              style={{
                display:'flex', alignItems:'center', gap:6,
                height:34, padding:'0 12px', borderRadius:99, cursor:'pointer',
                marginLeft:'auto',
                border: shareResult === 'copied' ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.07)',
                background: shareResult === 'copied' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                color: shareResult === 'copied' ? '#4ade80'
                     : shareResult === 'failed' ? '#f87171'
                     : 'rgba(255,255,255,0.4)',
                fontSize:12, fontWeight:600, whiteSpace:'nowrap', transition:'all 0.2s',
              }}
            >
              {shareResult === 'copied' ? <Check size={14} /> : <Share2 size={14} />}
              {shareResult === 'copied' ? 'Link copied'
                : shareResult === 'failed' ? 'Copy failed'
                : 'Share'}
            </button>
          </div>

          {post.caption && (
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.75)', lineHeight:1.65 }}>
              <span style={{ fontWeight:700, color:'#f1f5f9', marginRight:6 }}>
                {post.author?.name}
              </span>
              {post.caption}
            </p>
          )}
        </div>
      </article>

      {/* Mounted only while open, as the feed does. PostComment resets shared
          context state on its closed branch, so keeping it mounted and shut
          gives it a reason to run that reset on every render. */}
      {showComments && (
        <PostComment
          postId={post._id}
          isOpen={showComments}
          onClose={() => setShowComments(false)}
        />
      )}
    </>
  );
};

export default SinglePost;
