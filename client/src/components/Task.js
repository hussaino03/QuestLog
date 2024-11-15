import React, { useState } from 'react';

const Task = ({ task, removeTask, completeTask, isCompleted }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <li className="border-2 border-gray-200 dark:border-gray-700 rounded-xl mb-4 overflow-hidden bg-white dark:bg-gray-800 hover:shadow-md transition-shadow w-full max-w-2xl">
      <div className="flex items-center justify-between p-3">
        <button
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
          onClick={() => setShowDetails(!showDetails)}
        >
          <svg 
            className="w-6 h-6 text-gray-400"
            viewBox="0 0 24 24"
            fill="none" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={showDetails ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
            />
          </svg>
        </button>

        <span className="flex-grow text-center text-gray-700 dark:text-gray-200 mx-4">{task.name}</span>

        <div className="flex gap-1">
          {!isCompleted && (
            <button
              onClick={() => completeTask(task)}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/10 hover:bg-green-500/20 transition-colors"
            >
              <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
            </button>
          )}
          <button
            onClick={() => removeTask(task.id, isCompleted)}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <span className="text-red-600 dark:text-red-400 text-lg">×</span>
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out bg-gray-50 dark:bg-gray-900 ${
          showDetails ? 'max-h-48 py-3' : 'max-h-0'
        } overflow-hidden`}
      >
        <div className="px-4 space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
          <p>Details: {task.desc}</p>
          <p>Difficulty: {task.difficulty}%</p>
          <p>Importance: {task.importance}%</p>
          <p>Experience given: {task.experience}xp</p>
        </div>
      </div>
    </li>
  );
};

export default Task;