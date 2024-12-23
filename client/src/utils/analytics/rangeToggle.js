import React from 'react';

const RangeToggle = ({ currentRange, onRangeChange }) => (
  <span className="inline-flex items-center p-0.5 rounded-lg bg-gray-100 dark:bg-gray-700/50">
    <button
      onClick={() => onRangeChange(7)}
      className={`px-2 py-0.5 text-xs rounded-md transition-colors ${
        currentRange === 7 
        ? 'bg-white dark:bg-gray-600 shadow-sm' 
        : 'text-gray-600 dark:text-gray-300'
      }`}
    >
      7
    </button>
    <button
      onClick={() => onRangeChange(30)}
      className={`px-2 py-0.5 text-xs rounded-md transition-colors ${
        currentRange === 30 
        ? 'bg-white dark:bg-gray-600 shadow-sm' 
        : 'text-gray-600 dark:text-gray-300'
      }`}
    >
      30
    </button>
  </span>
);

export default React.memo(RangeToggle);
