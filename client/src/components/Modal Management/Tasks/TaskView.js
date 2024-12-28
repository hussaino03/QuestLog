import React, { useState } from 'react';
import { formatDeadline, isOverdue, calculateOverduePenalty } from '../../../utils/tasks/tasksUtils';

const TaskView = ({ task, isCompleted, isTextTruncated, textRef, nameOnly }) => {
  const [showFullNameModal, setShowFullNameModal] = useState(false);

  const TaskName = () => (
    <div className="relative flex items-center max-w-full">
      <span
        ref={textRef}
        className="truncate max-w-[150px] xs:max-w-[180px] sm:max-w-none"
      >
        {task.name}
      </span>
      {isTextTruncated && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowFullNameModal(true);
          }}
          className="ml-0.5 inline-flex items-center justify-center text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex-shrink-0"
        >
          <span className="sr-only">View full name</span>
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
      )}
    </div>
  );

  if (nameOnly) {
    return (
      <>
        <TaskName />
        {showFullNameModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 
                       flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setShowFullNameModal(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full 
                         shadow-2xl transform scale-100 animate-modalSlide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-left">
                  Task Name
                </h2>
                <button
                  onClick={() => setShowFullNameModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <span className="text-red-600 dark:text-red-400 text-lg">×</span>
                </button>
              </div>
              <div className="p-6 text-left">
                <p className="text-gray-700 dark:text-gray-300 break-words text-left">
                  {task.name}
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Description Section */}
      {task.desc && (
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {task.desc}
          </p>
        </div>
      )}

      {/* Metrics Section */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                className="text-gray-200 dark:text-gray-700"
                strokeWidth="3"
                stroke="currentColor"
                fill="transparent"
                r="20"
                cx="24"
                cy="24"
              />
              <circle
                className="text-blue-500 dark:text-blue-400"
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="20"
                cx="24"
                cy="24"
                strokeDasharray={`${task.difficulty * 1.256} 999`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
              {task.difficulty}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Difficulty
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {task.difficulty < 33 ? 'Easy' : task.difficulty < 66 ? 'Medium' : 'Hard'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                className="text-gray-200 dark:text-gray-700"
                strokeWidth="3"
                stroke="currentColor"
                fill="transparent"
                r="20"
                cx="24"
                cy="24"
              />
              <circle
                className="text-blue-500 dark:text-blue-400"
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="20"
                cx="24"
                cy="24"
                strokeDasharray={`${task.importance * 1.256} 999`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
              {task.importance}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Importance
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {task.importance < 33 ? 'Low' : task.importance < 66 ? 'Medium' : 'High'}
            </span>
          </div>
        </div>
      </div>

      {/* Task Info Footer */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 pt-2">
        {task.deadline && (
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>
              Due: {formatDeadline(task.deadline)}
              {isOverdue(task.deadline) && !isCompleted && (
                <span className="text-red-500 ml-1">
                  ({calculateOverduePenalty(task.deadline)}xp)
                </span>
              )}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span>⭐</span>
          <span>
            {task.experience}xp
            {isCompleted && task.earlyBonus > 0 && (
              <span className="text-green-600 dark:text-green-400 ml-1">
                +{task.earlyBonus}xp bonus
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
            ${task.urgent 
              ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
              : 'bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400'}`}>
            {task.urgent ? '🚨 Urgent' : '⏱️ Regular'}
          </span>
        </div>
      </div>

      {showFullNameModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 
                     flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowFullNameModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full 
                       shadow-2xl transform scale-100 animate-modalSlide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-left">
                Task Name
              </h2>
              <button
                onClick={() => setShowFullNameModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                <span className="text-red-600 dark:text-red-400 text-lg">×</span>
              </button>
            </div>

            <div className="p-6 text-left">
              <p className="text-gray-700 dark:text-gray-300 break-words text-left">
                {task.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskView;
