import React from 'react';
import { Moon, Sun, Github } from 'lucide-react';

const ThemeToggle = ({ isDark, onToggle }) => {
  return (
    <div className="flex items-center gap-2">
      <a
        href="https://github.com/hussaino03/QuestLog"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-white dark:bg-gray-800 
                   border-2 border-gray-800 shadow-[2px_2px_#77dd77] 
                   hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 
                   transition-all duration-200"
        aria-label="View source code on GitHub"
      >
        <Github className="w-5 h-5 text-gray-800 dark:text-white" />
      </a>
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

export default ThemeToggle;