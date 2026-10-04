import React, { useEffect, useState } from 'react';
import { MdAdd } from 'react-icons/md';
import UserProfile from './UserProfile';
import NotificationBell from './NotificationBell';
import { useNavigate } from 'react-router-dom';

const MobileViewBar = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-10 md:hidden ${visible ? 'flex' : 'hidden'}`}
      style={{
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
      }}>

      {/* Brand */}
      <span
        onClick={() => navigate('/dashboard')}
        style={{
          fontWeight: 800, fontSize: 18,
          background: 'linear-gradient(135deg,#60a5fa,#a78bfa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          cursor: 'pointer',
        }}>
        FindOut
      </span>

      {/* Right side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Notification Bell */}
        <NotificationBell iconSize={24} iconColor="var(--text-primary)" />

        {/* Add Post */}
        <button
          onClick={() => navigate('/add-post')}
          style={{
            background: 'none', border: 'none',
            cursor: 'pointer', color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center',
          }}>
          <MdAdd size={24} />
        </button>

        {/* User Profile */}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <UserProfile />
        </button>
      </div>
    </div>
  );
};

export default MobileViewBar;