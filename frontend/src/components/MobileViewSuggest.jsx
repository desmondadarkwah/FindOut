import React, { useContext, useState } from 'react';
import { SuggestionsContext } from '../Context/SuggestionsContext';
import { RxAvatar } from "react-icons/rx";
import { MdLock } from 'react-icons/md';
import { BeatLoader } from 'react-spinners';

// Works whether the backend stores "/uploads/x.png", "x.png" or a full URL
const resolveImage = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `${import.meta.env.VITE_BACKEND_URL}${path}`;
  return `${import.meta.env.VITE_BACKEND_URL}/uploads/${path}`;
};

// Round avatar for the strip. If the image file is missing/broken it falls
// back to the default avatar instead of showing a broken-image icon.
const StripAvatar = ({ src, alt, borderColor, fallbackBg }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: fallbackBg,
        border: `2px solid ${borderColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <RxAvatar size={28} color="var(--text-secondary)" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      style={{
        width: 52, height: 52, borderRadius: '50%',
        objectFit: 'cover',
        border: `2px solid ${borderColor}`,
      }}
    />
  );
};

const MobileViewSuggest = () => {
  const {
    suggestedUsers,
    suggestedGroups,
    loading,
    handleConnectPrivateChat,
    handleOpenGroupChat
  } = useContext(SuggestionsContext);

  // FIX: if one of the lists is undefined/null, `.map` / `.length` below used
  // to crash the whole page. Default both to empty arrays.
  const users = suggestedUsers || [];
  const groups = suggestedGroups || [];

  if (loading) {
    // FIX: removed the conflicting `block` + `flex` classes (only flex was intended)
    return (
      <div className="flex md:hidden justify-center py-4"
        style={{ background: 'var(--bg-primary)' }}>
        <BeatLoader color="var(--text-secondary)" size={8} />
      </div>
    );
  }

  if (!users.length && !groups.length) {
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
      className="block md:hidden no-scrollbar"
      style={{
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
        overflowX: 'auto',
        padding: '10px 12px',
        // Scrolling still works - only the scrollbar is hidden
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
      <div style={{ display: 'flex', gap: 16, minWidth: 'max-content' }}>

        {/* ── USERS ── */}
        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => handleConnectPrivateChat(user._id)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: 60 }}>
            <StripAvatar
              src={resolveImage(user.profilePicture)}
              alt={user.name}
              borderColor="#3b82f6"
              fallbackBg="rgba(99,102,241,0.15)"
            />
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
        {users.length > 0 && groups.length > 0 && (
          <div style={{
            width: 1, background: 'var(--border)',
            margin: '0 4px', flexShrink: 0,
          }} />
        )}

        {/* ── GROUPS ── */}
        {groups.map((group) => (
          <div
            key={group._id}
            onClick={() => handleOpenGroupChat(group._id)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: 60 }}>
            <StripAvatar
              src={resolveImage(group.groupProfile)}
              alt={group.groupName}
              borderColor="#22c55e"
              fallbackBg="rgba(34,197,94,0.1)"
            />
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