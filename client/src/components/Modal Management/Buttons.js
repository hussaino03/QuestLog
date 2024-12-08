import React from 'react';

const TaskButtons = ({ showCompleted, toggleView, onClearDataClick }) => {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => document.getElementById('newtask-form').style.display='block'}
        className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 font-bold text-lg border-3 border-gray-800 dark:border-gray-200 
                 text-gray-800 dark:text-gray-200 shadow-[4px_4px_#2563EB] hover:shadow-none hover:translate-x-1 
                 hover:translate-y-1 transition-all duration-200 rounded-none"
      >
        Create +
      </button>
      <button
        onClick={toggleView}
        className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 font-bold text-lg border-3 border-gray-800 dark:border-gray-200 
                 text-gray-800 dark:text-gray-200 shadow-[4px_4px_#2563EB] hover:shadow-none hover:translate-x-1 
                 hover:translate-y-1 transition-all duration-200 rounded-none"
      >
        {showCompleted ? 'Hide Completed' : 'Show Completed'}
      </button>
      <button 
        onClick={onClearDataClick}
        className="px-3 py-2 bg-white dark:bg-gray-800 font-bold text-lg border-3 border-gray-800 dark:border-gray-200 
                 text-gray-800 dark:text-gray-200 shadow-[4px_4px_#ff6b6b] hover:shadow-none hover:translate-x-1 
                 hover:translate-y-1 transition-all duration-200 rounded-none"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-gray-800 dark:text-gray-200" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
          />
        </svg>
      </button>
    </div>
  );
};

export default TaskButtons;