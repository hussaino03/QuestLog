import React, { useEffect } from 'react';

const LevelUpNoti = ({ show, onClose, level }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-[90%] max-w-sm sm:w-auto">
      <div 
        className="bg-white dark:bg-gray-800
                   rounded-full px-4 sm:px-8 py-3 
                   animate-[slideIn_0.3s_ease-out]
                   border border-gray-200 dark:border-gray-700
                   shadow-lg w-full"
      >
        <div className="flex items-center justify-center space-x-3 sm:space-x-4 w-full">
          <span className="animate-[bounce_1s_infinite] text-xl text-blue-500 shrink-0">⭐</span>
          <div className="text-center flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 truncate">
              Level Up!
            </h3>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
              You reached level {level}
            </p>
          </div>
          <span className="animate-[bounce_1s_infinite] delay-100 text-xl text-blue-500 shrink-0">⭐</span>
        </div>
      </div>
    </div>
  );
};

export default LevelUpNoti;