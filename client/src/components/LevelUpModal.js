import React, { useEffect } from 'react';

const LevelUpModal = ({ show, onClose, level }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <>
      {/* Semi-transparent backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-colors duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-2xl p-8 mx-4 max-w-sm w-full 
                     transform transition-all duration-300 scale-100 opacity-100
                     animate-[slideIn_0.3s_ease-out]
                     border border-gray-200 dark:border-gray-700"
        >
          <div className="text-center space-y-4">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 
                          bg-clip-text text-transparent animate-gradient">
              Level Up!
            </h3>
            
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 
                            rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200">
              </div>
              <div className="relative px-4 py-3 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-200">
                  You are now level {level}!
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-2">
              <span className="inline-block animate-[bounce_1s_infinite] text-2xl">✨</span>
              <span className="inline-block animate-[bounce_1s_infinite] delay-100 text-2xl">🎉</span>
              <span className="inline-block animate-[bounce_1s_infinite] delay-200 text-2xl">🌟</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LevelUpModal;