import React from 'react';

const FindOutLoader = ({ 
  size = 'large', 
  text = 'Loading...', 
  showText = true, 
  fullScreen = true,
  variant = 'default' 
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      container: 'w-8 h-8',
      dot: 'w-2 h-2',
      text: 'text-sm',
      spacing: 'mb-2'
    },
    medium: {
      container: 'w-12 h-12',
      dot: 'w-3 h-3',
      text: 'text-base',
      spacing: 'mb-3'
    },
    large: {
      container: 'w-16 h-16',
      dot: 'w-4 h-4',
      text: 'text-lg',
      spacing: 'mb-4'
    }
  };

  const config = sizeConfig[size];

  // Wrapper classes based on fullScreen prop
  const wrapperClasses = fullScreen 
    ? "fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center z-50"
    : "flex items-center justify-center p-8";

  // Different loader variants
  const renderLoader = () => {
    switch (variant) {
      case 'pulse':
        return (
          <div className="relative">
            <div className={`${config.container} relative`}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
              <div className="absolute inset-4 bg-white rounded-full animate-bounce"></div>
            </div>
          </div>
        );

      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`${config.dot} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce`}
                style={{ animationDelay: `${index * 0.2}s` }}
              ></div>
            ))}
          </div>
        );

      case 'orbit':
        return (
          <div className={`${config.container} relative`}>
            <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-transparent border-b-blue-400 border-l-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        );

      case 'bars':
        return (
          <div className="flex items-end space-x-1">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={`w-2 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full animate-pulse`}
                style={{ 
                  height: `${16 + (index % 3) * 8}px`,
                  animationDelay: `${index * 0.1}s`,
                  animationDuration: '1s'
                }}
              ></div>
            ))}
          </div>
        );

      default: // Enhanced spinning loader
        return (
          <div className="relative">
            <div className={`${config.container} relative`}>
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
              
              {/* Main spinning ring */}
              <div className="absolute inset-0 border-4 border-gray-700/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
              
              {/* Inner spinning ring */}
              <div className="absolute inset-2 border-2 border-gray-600/20 rounded-full"></div>
              <div className="absolute inset-2 border-2 border-transparent border-b-blue-400 border-l-purple-400 rounded-full animate-spin" 
                   style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
              
              {/* Center dot */}
              <div className="absolute inset-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={wrapperClasses}>
      <div className="text-center">
        {/* Logo/Brand section */}
        <div className={config.spacing}>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 tracking-wider">
            FINDOUT
          </h2>
        </div>

        {/* Loader animation */}
        <div className={`flex justify-center ${config.spacing}`}>
          {renderLoader()}
        </div>

        {/* Loading text */}
        {showText && (
          <div className="animate-pulse">
            <p className={`text-white ${config.text} font-medium tracking-wide`}>
              {text}
            </p>
            <div className="flex justify-center mt-2">
              <div className="flex space-x-1">
                <div className="w-2 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-1 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindOutLoader;




// Full screen loader (default)
{/* <FindOutLoader /> */}

// Small inline loader
{/* <FindOutLoader size="small" fullScreen={false} /> */}

// Different variant with custom text
{/* <FindOutLoader variant="dots" text="Fetching posts..." /> */}

// Minimal loader without text
{/* <FindOutLoader showText={false} variant="pulse" /> */}

// Custom loading message
{/* <FindOutLoader text="Connecting to server..." variant="orbit" /> */}