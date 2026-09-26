import React from 'react';
import { useTheme } from '../Context/ThemeContext';
import { MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', padding: '10px 14px',
        background: 'none', border: 'none', cursor: 'pointer',
        borderRadius: 8, transition: 'background 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      {theme === 'dark' ? (
        <>
          <MdOutlineLightMode size={18} className="text-yellow-400" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
            Light Mode
          </span>
        </>
      ) : (
        <>
          <MdOutlineDarkMode size={18} className="text-indigo-500" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.7)' }}>
            Dark Mode
          </span>
        </>
      )}

      {/* Toggle switch */}
      <div style={{
        marginLeft: 'auto',
        width: 38, height: 20, borderRadius: 99,
        background: theme === 'dark' ? '#6366f1' : '#e2e8f0',
        position: 'relative', transition: 'background 0.3s',
        border: '1px solid rgba(0,0,0,0.1)',
      }}>
        <span style={{
          position: 'absolute', top: 2,
          left: theme === 'dark' ? 18 : 2,
          width: 14, height: 14, borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.3s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }} />
      </div>
    </button>
  );
};

export default ThemeToggle;