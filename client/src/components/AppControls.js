import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_PROD || 'http://localhost:3001/api';

const AppControls = ({ isDark, onToggle, addTask, isAuthenticated }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTodoistImport = async () => {
    setIsLoading(true);
    try {
      const messageHandler = async (event) => {
        if (event.data.type === 'todoist-auth-success') {
          window.removeEventListener('message', messageHandler);
          if (event.data.tasks && Array.isArray(event.data.tasks)) {
            const tasksToAdd = event.data.tasks.map(taskName => ({
              name: taskName,
              desc: 'Imported from Todoist',
              difficulty: 5,
              importance: 5,
              deadline: null,
              collaborative: false,
              experience: 150
            }));
            addTask(tasksToAdd);
          }
          setIsLoading(false);
        } else if (event.data.type === 'todoist-auth-error') {
          window.removeEventListener('message', messageHandler);
          setIsLoading(false);
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        `${API_BASE_URL}/auth/todoist`,
        'Import from Todoist',
        `width=${width},height=${height},left=${left},top=${top},popup=1`
      );

      if (!popup || popup.closed) {
        throw new Error('Popup blocked! Please allow popups for this site.');
      }

    } catch (error) {
      console.error('Todoist import failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isAuthenticated && (
        <button
          onClick={handleTodoistImport}
          disabled={isLoading}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 
                     border-2 border-gray-800 shadow-[2px_2px_#e44332] 
                     hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 
                     transition-all duration-200"
          aria-label="Import from Todoist"
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin text-gray-800 dark:text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-800 dark:text-white" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm-1.36 16.92L6.1 12.4l1.42-1.42 3.12 3.12 6.56-6.56 1.42 1.42-7.98 7.96z"/>
            </svg>
          )}
        </button>
      )}

      <button
        onClick={onToggle}
        className="p-2 rounded-lg bg-white dark:bg-gray-800 
                   border-2 border-gray-800 shadow-[2px_2px_#77dd77] 
                   hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 
                   transition-all duration-200"
        aria-label="Toggle dark mode"
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-gray-800 dark:text-white" />
        ) : (
          <Moon className="w-5 h-5 text-gray-800 dark:text-white" />
        )}
      </button>
    </div>
  );
};

export default AppControls;