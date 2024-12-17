import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

const Badge = ({ badge, isUnlocked }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipRect, setTooltipRect] = useState(null);
  const badgeRef = useRef(null);

  const updateTooltipPosition = () => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      setTooltipRect({
        left: rect.left + (rect.width / 2),
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
      <div className={`w-14 h-14 flex items-center justify-center rounded-full 
                    border-2 ${isUnlocked 
                      ? 'border-gray-800 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-[2px_2px_#2563EB] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5' 
                      : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700'} 
                    transition-all duration-200`}>
        <span className={`text-2xl ${isUnlocked ? 'opacity-100' : 'opacity-40'}`}>
          {badge.icon}
        </span>
      </div>
      
      <div className="mt-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
        {badge.name}
      </div>

      {showTooltip && tooltipRect && createPortal(
        <div 
          className="fixed min-w-[120px] w-auto whitespace-nowrap
                     bg-black/75 text-white text-xs rounded p-2 text-center
                     transition-opacity duration-200 z-[100] pointer-events-none"
          style={{
            left: `${tooltipRect.left}px`,
            bottom: `${tooltipRect.bottom}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <p>{badge.description}</p>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Badge;
