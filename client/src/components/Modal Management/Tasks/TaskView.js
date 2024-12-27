import React, { useState } from 'react';
import { formatDeadline, isOverdue, calculateOverduePenalty } from '../../../utils/tasks/tasksUtils';

const TaskView = ({ task, isCompleted, showDescription, setShowDescription, isTextTruncated, textRef, nameOnly }) => {
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
      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowDescription(!showDescription)}
          className="w-6 h-6 flex items-center justify-center focus:outline-none"
        >
          <svg
            className="w-4 h-4 text-gray-400 transition-transform duration-300"
            style={{
              transform: showDescription ? 'rotate(-180deg)' : 'rotate(0)'
            }}
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
      <div
        className={`transition-all duration-300 ease-in-out ${
          showDescription ? 'max-h-[300px]' : 'max-h-0'
        } overflow-hidden pl-6`}
      >
        {task.desc.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
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

      {task.deadline && <p>Due date: {formatDeadline(task.deadline)}</p>}
      <p>Difficulty: {task.difficulty}%</p>
      <p>Importance: {task.importance}%</p>
      <p>Type: {task.collaborative ? '👥 Collaborative' : '👤 Individual'}</p>
      <p>
        Experience given: {task.experience}xp
        {isCompleted && task.earlyBonus > 0 && (
          <span className="text-green-600 dark:text-green-400">
            {` + ${task.earlyBonus}xp early bonus!`}
          </span>
        )}
        {task.deadline && isOverdue(task.deadline) && (
          <span className="text-red-500">
            {` ${calculateOverduePenalty(task.deadline)}xp`}
          </span>
        )}
      </p>
    </>
  );
};

export default TaskView;
