import React from 'react';
import Flogo from '../assets/Flogo.png';

const SIZES = {
  small:  { box: 56, logo: 26, ring: 2 },
  medium: { box: 80, logo: 38, ring: 2.5 },
  large:  { box: 104, logo: 50, ring: 3 },
};

const FindOutLoader = ({ size = 'large', fullScreen = true }) => {
  const s = SIZES[size] || SIZES.large;

  const wrapperClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center z-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={wrapperClasses} style={fullScreen ? { background: '#0a0a0f' } : undefined}>
      <div style={{ position: 'relative', width: s.box, height: s.box }}>
        {/* Track */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `${s.ring}px solid rgba(255,255,255,0.08)`,
        }} />
        {/* Spinner */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `${s.ring}px solid transparent`,
          borderTopColor: '#6366f1',
          borderRightColor: '#3b82f6',
          animation: 'fo-spin 0.9s linear infinite',
        }} />
        {/* Logo */}
        <img
          src={Flogo}
          alt="FindOut"
          style={{
            position: 'absolute', top: '50%', left: '50%',
            width: s.logo, height: s.logo,
            transform: 'translate(-50%, -50%)',
            objectFit: 'contain',
            animation: 'fo-breathe 1.8s ease-in-out infinite',
          }}
        />
      </div>
      <style>{`
        @keyframes fo-spin { to { transform: rotate(360deg); } }
        @keyframes fo-breathe { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
      `}</style>
    </div>
  );
};

export default FindOutLoader;