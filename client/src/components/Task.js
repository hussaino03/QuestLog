import React, { useState } from 'react';

const Task = ({ task, removeTask, completeTask, isCompleted }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const formatDeadline = (deadline) => {
    if (!deadline) return '';
    
    // Create date object and force it to be interpreted in local timezone
    const date = new Date(deadline + 'T12:00:00');
    
    // Format using local date string
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'UTC'  // This ensures the date stays as selected
    });
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    const now = new Date();
    const deadlineDate = new Date(deadline + 'T23:59:59');
    return now > deadlineDate;
  };

  return (
    <li className="border-2 border-gray-200 dark:border-gray-700 rounded-xl mb-4 overflow-hidden bg-white dark:bg-gray-800 hover:shadow-md transition-shadow w-full max-w-2xl">
      <div className="flex items-center justify-between p-3">
        <button
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
          onClick={() => setShowDetails(!showDetails)}
        >
          <svg 
            className="w-6 h-6 text-gray-400 transition-transform duration-300"
            style={{ transform: showDetails ? 'rotate(-180deg)' : 'rotate(0)' }}
            viewBox="0 0 24 24"
            fill="none" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <span className="flex-grow text-center text-gray-700 dark:text-gray-200 mx-4">
          {task.name}
          {!isCompleted && task.deadline && isOverdue(task.deadline) && (
            <span className="ml-2 text-red-500 text-sm">
              OVERDUE (-5 XP)
            </span>
          )}
        </span>

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
          showDetails ? 'max-h-[500px] py-3' : 'max-h-0'
        } overflow-hidden`}
      >
        <div className="px-4 space-y-1.5 text-sm text-gray-600 dark:text-gray-300">  
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="w-6 h-6 flex items-center justify-center focus:outline-none"
            >
              <svg 
                className="w-4 h-4 text-gray-400 transition-transform duration-300"
                style={{ transform: showDescription ? 'rotate(-180deg)' : 'rotate(0)' }}
                viewBox="0 0 24 24"
                fill="none" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <span>Details</span>
          </div>
          <div className={`transition-all duration-300 ease-in-out ${
            showDescription ? 'max-h-[300px]' : 'max-h-0'
          } overflow-hidden pl-6`}>
            {task.desc.split("\n").map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </div>
          {task.deadline && <p>Due date: {formatDeadline(task.deadline)}</p>}
          <p>Difficulty: {task.difficulty}%</p>
          <p>Importance: {task.importance}%</p>
          <p>Type: {task.collaborative ? '👥 Collaborative' : '👤 Individual'}</p>
          <p>Experience given: {task.experience}xp
            {isCompleted && task.earlyBonus > 0 && (
              <span className="text-green-600 dark:text-green-400">
                {` + ${task.earlyBonus}xp early bonus!`}
              </span>
            )}
            {task.deadline && isOverdue(task.deadline) && (
              <span className="text-red-500">
                {` - 5xp`}
              </span>
            )}
          </p>
        </div>
      </div>
    </li>
  );
};

export default Task;