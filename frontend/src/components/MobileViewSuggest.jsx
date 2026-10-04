import React, { useContext } from 'react';
import { SuggestionsContext } from '../Context/SuggestionsContext';
import { RxAvatar } from "react-icons/rx";
import { MdLock } from 'react-icons/md';
import { BeatLoader } from 'react-spinners';

const MobileViewSuggest = () => {
  const {
    suggestedUsers,
    suggestedGroups,
    loading,
    handleConnectPrivateChat,
    handleOpenGroupChat
  } = useContext(SuggestionsContext);

  if (loading) {
    return (
      <div className="block md:hidden flex justify-center py-4"
        style={{ background: 'var(--bg-primary)' }}>
        <BeatLoader color="var(--text-secondary)" size={8} />
      </div>
    );
  }

  if (!suggestedUsers?.length && !suggestedGroups?.length) {
    return (
      <div className="block md:hidden py-3 text-center"
        style={{ background: 'var(--bg-primary)' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Add subjects to get suggestions
        </p>
      </div>
    );
  }

  return (
    <div
      className="block md:hidden"
      style={{
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
        overflowX: 'auto',
        padding: '10px 12px',
      }}>
      <div style={{ display: 'flex', gap: 16, minWidth: 'max-content' }}>

        {/* ── USERS ── */}
        {suggestedUsers.map((user) => (
          <div
            key={user._id}
            onClick={() => handleConnectPrivateChat(user._id)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: 60 }}>
            {user.profilePicture ? (
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}${user.profilePicture}`}
                alt={user.name}
                style={{
                  width: 52, height: 52, borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #3b82f6',
                }}
              />
            ) : (
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(99,102,241,0.15)',
                border: '2px solid #3b82f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <RxAvatar size={28} color="var(--text-secondary)" />
              </div>
            )}
            <span style={{
              fontSize: 11, color: 'var(--text-primary)',
              marginTop: 4, fontWeight: 600,
              maxWidth: 56, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              textAlign: 'center',
            }}>{user.name}</span>
            <span style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center' }}>
              {user.status === 'Ready To Teach' ? '👨‍🏫' : user.status === 'Ready To Learn' ? '📖' : '⏰'}
            </span>
          </div>
        ))}

        {/* Divider between users and groups */}
        {suggestedUsers.length > 0 && suggestedGroups.length > 0 && (
          <div style={{
            width: 1, background: 'var(--border)',
            margin: '0 4px', flexShrink: 0,
          }} />
        )}

        {/* ── GROUPS ── */}
        {suggestedGroups.map((group) => (
          <div
            key={group._id}
            onClick={() => handleOpenGroupChat(group._id)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: 60 }}>
            {group.groupProfile ? (
              <img
                src={
                  group.groupProfile.startsWith('/uploads/')
                    ? `${import.meta.env.VITE_BACKEND_URL}${group.groupProfile}`
                    : `${import.meta.env.VITE_BACKEND_URL}/uploads/${group.groupProfile}`
                }
                alt={group.groupName}
                style={{
                  width: 52, height: 52, borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #22c55e',
                }}
              />
            ) : (
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(34,197,94,0.1)',
                border: '2px solid #22c55e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <RxAvatar size={28} color="var(--text-secondary)" />
              </div>
            )}
            <span style={{
              fontSize: 11, color: 'var(--text-primary)',
              marginTop: 4, fontWeight: 600,
              maxWidth: 56, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              textAlign: 'center',
              display: 'flex', alignItems: 'center', gap: 2,
            }}>
              {group.groupName}
              {group.privacy === 'private' && <MdLock size={8} color="var(--text-muted)" />}
            </span>
            <span style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center' }}>
              {group.privacy === 'private' ? '🔒 Private' : '🌐 Public'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileViewSuggest;