import React from 'react';
import Flogo from '../assets/Flogo.png';

// FIX: dropped the rotating ring entirely per feedback — "no circling
// around it." The logo alone now does a gentle up/down bob instead, no
// other moving parts, no extra DOM elements. Fixed dark theme, same as
// before (deliberately not var(--bg-primary) — this is the one screen
// meant to stay dark regardless of the toggle).

const SIZES = {
  small: 36,
  medium: 52,
  large: 68,
};

const FindOutLoader = ({ size = 'large', fullScreen = true }) => {
  const logoSize = SIZES[size] || SIZES.large;

  const wrapperClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center z-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={wrapperClasses} style={fullScreen ? { background: '#0a0a0f' } : undefined}>
      <img
        src={Flogo}
        alt="FindOut"
        style={{
          width: logoSize,
          height: logoSize,
          objectFit: 'contain',
          animation: 'fo-bob 1.4s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes fo-bob {
          0%, 100% { transform: translateY(-6px); }
          50% { transform: translateY(6px); }
        }
      `}</style>
    </div>
  );
};

export default FindOutLoader;