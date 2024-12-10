import React from 'react';

const TaskButtons = ({ showCompleted, toggleView, onClearDataClick }) => {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => document.getElementById('newtask-form').style.display='block'}
        className="flex-1 p-1.5 sm:p-2 rounded-lg bg-white dark:bg-gray-800 font-bold text-base sm:text-lg 
                  border-2 border-gray-800 text-gray-800 dark:text-gray-200 
                  shadow-[2px_2px_#2563EB] hover:shadow-none hover:translate-x-0.5 
                  hover:translate-y-0.5 transition-all duration-200"
      >
        Create +
      </button>
      <button
        onClick={toggleView}
        className="flex-1 p-1.5 sm:p-2 rounded-lg bg-white dark:bg-gray-800 font-bold text-base sm:text-lg 
                  border-2 border-gray-800 text-gray-800 dark:text-gray-200 
                  shadow-[2px_2px_#2563EB] hover:shadow-none hover:translate-x-0.5 
                  hover:translate-y-0.5 transition-all duration-200"
      >
        {showCompleted ? 'Hide Completed' : 'Show Completed'}
      </button>
      <button 
        onClick={onClearDataClick}
        className="p-1.5 sm:p-2 rounded-lg bg-white dark:bg-gray-800 font-bold text-base sm:text-lg 
                  border-2 border-gray-800 text-gray-800 dark:text-gray-200 
                  shadow-[2px_2px_#ff6b6b] hover:shadow-none hover:translate-x-0.5 
                  hover:translate-y-0.5 transition-all duration-200"
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