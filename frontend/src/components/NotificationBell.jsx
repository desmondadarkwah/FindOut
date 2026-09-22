import React, { useContext, useState, useRef, useEffect } from 'react';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { IoCheckmarkDoneOutline, IoTrashOutline, IoCloseOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../Context/NotificationContext';
import moment from 'moment';

const NotificationBell = ({ iconSize = 25, iconColor = 'white' }) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useContext(NotificationContext);
  const [open, setOpen] = useState(false);
  const bellRef = useRef(null);
  const panelRef = useRef(null);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

  // ✅ Calculate position relative to bell icon
  useEffect(() => {
    if (open && bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      const panelWidth = 340;
      const windowWidth = window.innerWidth;

      let left = rect.right + 12; // to the right of the bell
      let top = rect.top;         // aligned with bell top

      // ✅ If panel goes off screen right, flip to left
      if (left + panelWidth > windowWidth) {
        left = rect.left - panelWidth - 12;
      }

      // ✅ If panel goes off screen bottom, move up
      const panelHeight = 480;
      if (top + panelHeight > window.innerHeight) {
        top = window.innerHeight - panelHeight - 16;
      }

      setPanelPos({ top, left });
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'new_message':      return '💬';
      case 'join_request':     return '📝';
      case 'request_approved': return '✅';
      case 'request_rejected': return '❌';
      case 'member_joined':    return '👥';
      case 'new_match':        return '🤝';
      case 'quiz_verified':    return '🎉';
      default:                 return '🔔';
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) await markAsRead(notification._id);
    setOpen(false);
    if (notification.link) navigate(notification.link);
  };

  return (
    <>
      {/* ── BELL BUTTON ── */}
      <button
        ref={bellRef}
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative',
          background: open ? 'rgba(99,102,241,0.15)' : 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 6,
          borderRadius: 10,
          transition: 'background 0.2s',
          outline: 'none',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'none'; }}
      >
        <IoMdNotificationsOutline
          size={iconSize}
          color={open ? '#818cf8' : iconColor}
          style={{ transition: 'color 0.2s' }}
        />
        {/* ✅ Unread badge */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            minWidth: 17, height: 17, borderRadius: 99,
            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
            color: '#fff', fontSize: 9, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px',
            boxShadow: '0 2px 8px rgba(99,102,241,0.6)',
            border: '2px solid #0a0a0f',
            pointerEvents: 'none',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── DROPDOWN PANEL - rendered in portal position ── */}
      {open && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: panelPos.top,
            left: panelPos.left,
            width: 340,
            maxHeight: 500,
            background: 'linear-gradient(135deg,#111118,#0d0d1a)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 18,
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            animation: 'notif-fade-in 0.15s ease',
          }}
        >
          <style>{`
            @keyframes notif-fade-in {
              from { opacity: 0; transform: translateY(-8px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          {/* ── HEADER ── */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.01em' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(99,102,241,0.2))',
                  border: '1px solid rgba(99,102,241,0.3)',
                  color: '#a5b4fc', padding: '2px 8px', borderRadius: 99,
                  letterSpacing: '0.02em',
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#818cf8', fontSize: 11, fontWeight: 600,
                    padding: '5px 8px', borderRadius: 8,
                    transition: 'background 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <IoCheckmarkDoneOutline size={13} /> Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.3)', padding: '5px',
                  borderRadius: 8, display: 'flex', alignItems: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'none'; }}
              >
                <IoCloseOutline size={17} />
              </button>
            </div>
          </div>

          {/* ── NOTIFICATIONS LIST ── */}
          <div style={{
            flex: 1, overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(99,102,241,0.3) transparent',
          }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', fontSize: 24,
                }}>🔔</div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>
                  All caught up!
                </p>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                  We'll notify you when something happens
                </p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={notification._id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '13px 16px',
                    background: notification.isRead
                      ? 'transparent'
                      : 'rgba(99,102,241,0.04)',
                    borderBottom: index < notifications.length - 1
                      ? '1px solid rgba(255,255,255,0.04)'
                      : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = notification.isRead ? 'transparent' : 'rgba(99,102,241,0.04)'}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div style={{
                      position: 'absolute', left: 5, top: '50%',
                      transform: 'translateY(-50%)',
                      width: 5, height: 5, borderRadius: '50%',
                      background: '#6366f1', flexShrink: 0,
                    }} />
                  )}

                  {/* Avatar or emoji icon */}
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 19, overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}>
                    {notification.sender?.profilePicture ? (
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}${notification.sender.profilePicture}`}
                        alt={notification.sender.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : getIcon(notification.type)}
                  </div>

                  {/* Text content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13,
                      fontWeight: notification.isRead ? 500 : 700,
                      color: notification.isRead ? 'rgba(255,255,255,0.5)' : '#f1f5f9',
                      margin: '0 0 3px', lineHeight: 1.4,
                    }}>
                      {notification.title}
                    </p>
                    <p style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.28)',
                      margin: '0 0 5px', lineHeight: 1.4,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {notification.message}
                    </p>
                    <span style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.18)',
                      fontWeight: 500,
                    }}>
                      {moment(notification.createdAt).fromNow()}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification(notification._id); }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.15)', padding: '4px',
                      borderRadius: 6, transition: 'all 0.15s', flexShrink: 0,
                      display: 'flex', alignItems: 'center',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'none'; }}
                  >
                    <IoTrashOutline size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* ── FOOTER ── */}
          {notifications.length > 0 && (
            <div style={{
              padding: '10px 16px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.01)',
              flexShrink: 0,
            }}>
              <p style={{
                fontSize: 11, color: 'rgba(255,255,255,0.2)',
                margin: 0, textAlign: 'center', fontWeight: 500,
              }}>
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''} total
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default NotificationBell;