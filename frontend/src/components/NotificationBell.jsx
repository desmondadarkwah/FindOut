import React, { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoMdNotificationsOutline } from 'react-icons/io';
import {
  IoCheckmarkDoneOutline, IoTrashOutline, IoCloseOutline,
  IoChatbubbleOutline, IoDocumentTextOutline, IoCheckmarkCircleOutline,
  IoCloseCircleOutline, IoPeopleOutline, IoPersonAddOutline,
  IoTrophyOutline, IoStarOutline, IoAlertCircleOutline, IoNotificationsOutline,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../Context/NotificationContext';
import moment from 'moment';

// FIX: this used to be an anchored dropdown, positioned by measuring the
// bell button's on-screen coordinates with getBoundingClientRect() and
// placing the panel just to its right. That works fine when the bell
// sits alone in open space, but it now lives inside DashSidebar's 240px
// nav drawer — "to the right of the bell" lands the panel right on top
// of the drawer's own "Notifications" label and everything below it,
// which is the misalignment being reported. Rather than special-case the
// math for every place this bell might render, it's now a centered
// modal (same shell as ReportModal) — it always lands in the same
// predictable spot no matter what's rendering the bell.
const NOTIFICATION_ICONS = {
  new_message: IoChatbubbleOutline,
  join_request: IoDocumentTextOutline,
  request_approved: IoCheckmarkCircleOutline,
  request_rejected: IoCloseCircleOutline,
  member_joined: IoPeopleOutline,
  new_match: IoPersonAddOutline,
  quiz_verified: IoTrophyOutline,
  post_helpful: IoStarOutline,
  post_comment: IoChatbubbleOutline,
  quiz_failed: IoAlertCircleOutline,
};

const NotificationBell = ({ iconSize = 25, iconColor = 'currentColor' }) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useContext(NotificationContext);
  const [open, setOpen] = useState(false);

  const getIcon = (type) => NOTIFICATION_ICONS[type] || IoNotificationsOutline;

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) await markAsRead(notification._id);
    setOpen(false);
    if (notification.link) navigate(notification.link);
  };

  return (
    <>
      {/* BELL BUTTON */}
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          outline: 'none',
        }}
      >
        <IoMdNotificationsOutline size={iconSize} color={iconColor} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -6,
            minWidth: 16, height: 16, borderRadius: 99,
            background: '#6366f1',
            color: '#fff', fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px',
            border: '2px solid var(--bg-primary)',
            pointerEvents: 'none',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* CENTERED MODAL */}
      {open && createPortal(
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
          onMouseDown={e => e.stopPropagation()}
        >
          <div style={{
            width: '100%', maxWidth: 380, maxHeight: '80vh',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 18,
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column',
          }}>

            {/* HEADER */}
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    color: '#818cf8', padding: '2px 8px', borderRadius: 99,
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
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <IoCheckmarkDoneOutline size={13} /> Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 5,
                    borderRadius: 8, display: 'flex', alignItems: 'center',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                >
                  <IoCloseOutline size={17} />
                </button>
              </div>
            </div>

            {/* LIST */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <IoNotificationsOutline size={22} color="var(--text-muted)" />
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>
                    All caught up
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                    We'll notify you when something happens
                  </p>
                </div>
              ) : (
                notifications.map((notification, index) => {
                  const Icon = getIcon(notification.type);
                  return (
                    <div
                      key={notification._id}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                        padding: '13px 16px',
                        background: notification.isRead ? 'transparent' : 'rgba(99,102,241,0.05)',
                        borderBottom: index < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        position: 'relative',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = notification.isRead ? 'transparent' : 'rgba(99,102,241,0.05)'}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {!notification.isRead && (
                        <div style={{
                          position: 'absolute', left: 5, top: '50%',
                          transform: 'translateY(-50%)',
                          width: 5, height: 5, borderRadius: '50%',
                          background: '#6366f1', flexShrink: 0,
                        }} />
                      )}

                      {/* Avatar or type icon */}
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(99,102,241,0.1)',
                        border: '1px solid rgba(99,102,241,0.18)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                      }}>
                        {notification.sender?.profilePicture ? (
                          <img
                            src={`${import.meta.env.VITE_BACKEND_URL}${notification.sender.profilePicture}`}
                            alt={notification.sender.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Icon size={17} color="#818cf8" />
                        )}
                      </div>

                      {/* Text content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: 13,
                          fontWeight: notification.isRead ? 500 : 600,
                          color: notification.isRead ? 'var(--text-secondary)' : 'var(--text-primary)',
                          margin: '0 0 3px', lineHeight: 1.4,
                        }}>
                          {notification.title}
                        </p>
                        <p style={{
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          margin: '0 0 5px', lineHeight: 1.4,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {notification.message}
                        </p>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                          {moment(notification.createdAt).fromNow()}
                        </span>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(notification._id); }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--text-muted)', padding: 4,
                          borderRadius: 6, transition: 'all 0.15s', flexShrink: 0,
                          display: 'flex', alignItems: 'center',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                      >
                        <IoTrashOutline size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* FOOTER */}
            {notifications.length > 0 && (
              <div style={{
                padding: '10px 16px',
                borderTop: '1px solid var(--border)',
                flexShrink: 0,
              }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, textAlign: 'center', fontWeight: 500 }}>
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''} total
                </p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default NotificationBell;