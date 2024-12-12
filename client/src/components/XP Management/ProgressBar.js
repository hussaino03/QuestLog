import React from 'react';

const ProgressBar = ({ level, experience, userName, isAuthenticated }) => {
  let experienceNeededToLevel = level * 200;
  let barWidth = (experience / experienceNeededToLevel) * 100;
  const remainingXP = experienceNeededToLevel - experience;

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-2xl p-4">
        <div className="mb-2 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isAuthenticated && userName ? 
              `Welcome ${userName.charAt(0).toUpperCase() + userName.slice(1)}!` : 
              'Welcome!'} - Level {level}
          </span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {remainingXP}xp to go!
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 
                       rounded-full transition-all duration-300 ease-in-out flex items-center justify-center"
            style={{ width: `${barWidth}%` }}
          >
            {barWidth > 8 && (
              <span className="text-xs font-medium text-white px-2">
                {Math.round(barWidth)}%
              </span>
            )}
          </div>
          {barWidth <= 8 && (
            <span className="absolute inset-0 text-xs font-medium text-gray-600 dark:text-gray-400 
                          flex items-center justify-start px-2">
              {Math.round(barWidth)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;