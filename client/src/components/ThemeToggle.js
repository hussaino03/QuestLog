import React from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = ({ isDark, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="fixed top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 
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
  );
};

export default ThemeToggle;