import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiAlertTriangle } from 'react-icons/fi';
import axiosInstance from '../utils/axiosInstance';

const ReportModal = ({ type, id, name, onClose }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const reasons = {
    user: [
      'Harassment or bullying',
      'Spam or scam',
      'Inappropriate content',
      'Fake account',
      'Hate speech',
      'Other',
    ],
    post: [
      'Spam or misleading',
      'Inappropriate content',
      'Hate speech or discrimination',
      'False information',
      'Plagiarism',
      'Other',
    ],
    group: [
      'Spam or scam',
      'Inappropriate content',
      'Hate speech',
      'Misleading group',
      'Other',
    ],
  };

  const endpoints = {
    user:  '/api/report-user',
    post:  '/api/report-post',
    group: '/api/report-group',
  };

  const bodyKeys = {
    user:  'reportedUserId',
    post:  'postId',
    group: 'groupId',
  };

  const handleSubmit = async () => {
    if (!reason) return;
    setLoading(true);
    try {
      await axiosInstance.post(endpoints[type], {
        [bodyKeys[type]]: id,
        reason,
      });
      setDone(true);
      setTimeout(() => onClose(), 2000);
    } catch (e) {
      console.error('Report error:', e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: was returned directly as regular JSX. Since this component
  // mounts nested inside ancestors that use `backdropFilter` (the post
  // cards, rail cards, etc. in AllPost.jsx), and `backdrop-filter` creates
  // a new CSS containing block, this modal's `position: fixed` was being
  // anchored to that blurred ancestor instead of the actual viewport —
  // which is why it rendered boxed-in and off-center instead of centered
  // over the whole page. Rendering through a portal into document.body
  // escapes that containing block entirely, so `position: fixed` behaves
  // correctly no matter what CSS any ancestor uses.
  const modal = (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      // ✅ FIX: this modal now renders via a portal into document.body,
      // so it's a DOM sibling of the app root — physically outside the
      // dropdown container that AllPost.jsx's outside-click detector
      // watches. Without this, every mousedown in here (selecting a
      // reason, hitting Submit) bubbles to that document-level listener,
      // reads as an "outside" click, and closes the dropdown — unmounting
      // this modal before the click can register. Stopping propagation
      // here keeps those clicks from ever reaching that listener.
      onMouseDown={e => e.stopPropagation()}
    >
      <div style={{
        background: '#111118',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: 28,
        width: '100%', maxWidth: 380,
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
      }}>

        {done ? (
          // ✅ Success state
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ color: '#f1f5f9', fontWeight: 700, margin: '0 0 8px' }}>
              Report Submitted
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>
              Thank you for helping keep FindOut safe.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(234,179,8,0.1)',
              border: '1px solid rgba(234,179,8,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <FiAlertTriangle size={22} color="#fbbf24" />
            </div>

            <h3 style={{
              fontSize: 17, fontWeight: 700, color: '#f1f5f9',
              textAlign: 'center', margin: '0 0 6px',
            }}>
              Report {type === 'user' ? name || 'User' : type === 'post' ? 'Post' : 'Group'}
            </h3>
            <p style={{
              fontSize: 13, color: 'rgba(255,255,255,0.35)',
              textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5,
            }}>
              Help us understand what's wrong with this {type}.
            </p>

            {/* Reasons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {reasons[type].map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  style={{
                    padding: '10px 14px', borderRadius: 10,
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.15s',
                    border: reason === r
                      ? '1px solid rgba(234,179,8,0.4)'
                      : '1px solid rgba(255,255,255,0.07)',
                    background: reason === r
                      ? 'rgba(234,179,8,0.08)'
                      : 'rgba(255,255,255,0.02)',
                    color: reason === r ? '#fbbf24' : 'rgba(255,255,255,0.55)',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: '11px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, color: '#fff',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !reason}
                style={{
                  flex: 1, padding: '11px',
                  background: reason ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.05)',
                  border: reason ? '1px solid rgba(234,179,8,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10,
                  color: reason ? '#fbbf24' : 'rgba(255,255,255,0.3)',
                  fontSize: 14, fontWeight: 700,
                  cursor: loading || !reason ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default ReportModal;