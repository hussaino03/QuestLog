import React from 'react';

const ProgressBar = ({ level, experience }) => {
  let experienceNeededToLevel = level * 200;
  let barWidth = (experience / experienceNeededToLevel) * 100;
  const remainingXP = experienceNeededToLevel - experience;

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          Welcome back! - Level {level}
        </span>
        <span className="text-sm font-medium text-gray-600">
          {remainingXP}xp to go!
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 relative">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${barWidth}%` }}
        >
        </div>
        <div 
          className="absolute -top-8 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs"
          style={{ left: `${barWidth}%` }}
        >
          {Math.round(barWidth)}%
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;