import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

const Badge = ({ badge, isUnlocked, progress = 0, showProgress = true }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipRect, setTooltipRect] = useState(null);
  const badgeRef = useRef(null);

  const updateTooltipPosition = () => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      setTooltipRect({
        left: rect.left + rect.width / 2,
        bottom: window.innerHeight - rect.top + 8
      });
    }
  };

  return (
    <div
      ref={badgeRef}
      className="relative group flex flex-col items-center"
      onMouseEnter={() => {
        updateTooltipPosition();
        setShowTooltip(true);
      }}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative">
        {/* Glow effect for unlocked badges */}
        {isUnlocked && (
          <div
            className="absolute inset-0 rounded-full bg-blue-500/10 dark:bg-blue-400/10 
                       blur-sm animate-pulse"
          />
        )}

        {/* Badge circle */}
        <div
          className={`relative w-14 h-14 flex items-center justify-center rounded-full 
                      transition-all duration-300 ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-800 dark:border-gray-700 shadow-md shadow-blue-500/15 dark:shadow-blue-400/10'
                          : 'bg-gray-100 dark:bg-gray-800/50 border-2 border-gray-300 dark:border-gray-700/50 backdrop-blur-sm'
                      }`}
        >
          {/* Inner ring for unlocked badges */}
          {isUnlocked && (
            <div className="absolute inset-0.5 rounded-full border border-blue-500/30 dark:border-blue-400/30" />
          )}

          <span
            className={`text-2xl relative z-10 transition-all duration-300 ${
              isUnlocked
                ? 'opacity-100 scale-100 drop-shadow-sm'
                : 'opacity-30 scale-90 grayscale'
            }`}
          >
            {badge.icon}
          </span>
        </div>
      </div>

      <div
        className={`mt-2 text-xs font-semibold tracking-wide transition-colors duration-300 ${
          isUnlocked
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-500 dark:text-gray-500'
        }`}
      >
        {badge.name}
      </div>

      {/* Progress Bar */}
      {!isUnlocked && showProgress && (
        <div className="w-full mt-2">
          <div
            className="h-1 bg-gray-200 dark:bg-gray-800 rounded-full 
                       border border-gray-300 dark:border-gray-700/50 overflow-hidden
                       shadow-inner"
          >
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 
                         dark:from-blue-600 dark:via-blue-500 dark:to-blue-600 
                         rounded-full transition-all duration-700 ease-out
                         shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-[10px] text-center mt-1 text-gray-600 dark:text-gray-400 font-bold tracking-wider">
            {Math.round(progress)}%
          </div>
        </div>
      )}

      {showTooltip &&
        tooltipRect &&
        createPortal(
          <div
            className="fixed min-w-[140px] w-auto max-w-[220px]
                     bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg 
                     px-3 py-2 text-center shadow-xl border border-gray-700
                     transition-opacity duration-200 z-[100] pointer-events-none"
            style={{
              left: `${tooltipRect.left}px`,
              bottom: `${tooltipRect.bottom}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <p className="font-medium leading-relaxed">{badge.description}</p>
            {!isUnlocked && showProgress && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-blue-400 font-bold text-sm">
                  {Math.round(progress)}% Complete
                </p>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export default Badge;
