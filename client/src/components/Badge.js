import React from 'react';

const Badge = ({ badge, isUnlocked }) => {
  return (
    <div className="relative group flex flex-col items-center">
      <div className={`w-14 h-14 flex items-center justify-center rounded-full 
                      border-3 ${isUnlocked 
                        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30' 
                        : 'border-gray-300 bg-gray-100 dark:bg-gray-700'} 
                      transition-all duration-200`}>
        <span className={`text-2xl ${isUnlocked ? 'opacity-100' : 'opacity-40'}`}>
          {badge.icon}
        </span>
      </div>
      
      <div className="mt-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
        {badge.name}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                    min-w-[120px] w-auto whitespace-nowrap
                    bg-black/75 text-white text-xs rounded p-2 text-center
                    opacity-0 group-hover:opacity-100 group-active:opacity-100
                    transition-opacity duration-200 z-10">
        <p>{badge.description}</p>
      </div>
    </div>
  );
};

export default Badge;