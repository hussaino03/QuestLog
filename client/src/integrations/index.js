import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Link2 } from 'lucide-react';
import { importFromTodoist } from './todoist';
import { importFromGoogleTasks } from './googletasks';

const IntegrationsDropdown = ({ addTask, isAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTodoistImport = () => {
    importFromTodoist(addTask, setIsLoading);
    setIsOpen(false);
  };

  return (
    <>
      {isAuthenticated && (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 
                     border-2 border-gray-800 shadow-[2px_2px_#e44332] 
                     hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 
                     transition-all duration-200 flex items-center gap-1"
            aria-label="Import tasks"
          >
            <Link2 className="w-5 h-5 text-gray-800 dark:text-white" />
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-800 dark:text-white" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-800 dark:text-white" />
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 py-1 w-auto bg-white dark:bg-gray-800 border-2 
                          border-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
              <button
                onClick={handleTodoistImport}
                disabled={isLoading}
                className="w-full px-4 py-3 text-gray-800 dark:text-white 
                         hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                title="Import from Todoist"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <>
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#e44332">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.959 17l-4.5-4.319 1.395-1.435 3.08 2.937 7.021-7.183 1.422 1.409-8.418 8.591z"/>
                    </svg>
                    <span className="text-sm font-medium">Import from Todoist</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  importFromGoogleTasks(addTask, setIsLoading);
                  setIsOpen(false);
                }}
                disabled={isLoading}
                className="w-full px-4 py-3 text-gray-800 dark:text-white 
                         hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                title="Import from Google Tasks"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <>
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#4285f4">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.959 17l-4.5-4.319 1.395-1.435 3.08 2.937 7.021-7.183 1.422 1.409-8.418 8.591z"/>
                    </svg>
                    <span className="text-sm font-medium">Import from Google Tasks</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default IntegrationsDropdown;
