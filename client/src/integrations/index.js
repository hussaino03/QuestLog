import React, { useState } from 'react';
import { importFromTodoist } from './todoist/todoist';
import { importFromTickTick } from './ticktick/ticktick';

const Integrations = ({ addTask }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-2">
      <button
        onClick={() => importFromTodoist(addTask, setIsLoading)}
        disabled={isLoading}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg
                 bg-white dark:bg-gray-800 hover:bg-gray-50 
                 dark:hover:bg-gray-700/70 transition-colors
                 border border-gray-200 dark:border-gray-600"
      >
        <div className="flex items-center gap-3">
          <img src="/integrations/todoist.png" alt="Todoist" className="w-5 h-5" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Todoist
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {isLoading ? 'Connecting...' : 'Connect'}
        </span>
      </button>
      
      <button
        onClick={() => importFromTickTick(addTask, setIsLoading)}
        disabled={isLoading}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg
                 bg-white dark:bg-gray-800 hover:bg-gray-50 
                 dark:hover:bg-gray-700/70 transition-colors
                 border border-gray-200 dark:border-gray-600"
      >
        <div className="flex items-center gap-3">
          <img src="/integrations/ticktick.jpg" alt="TickTick" className="w-5 h-5" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            TickTick
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {isLoading ? 'Connecting...' : 'Connect'}
        </span>
      </button>
    </div>
  );
};

export default Integrations;
