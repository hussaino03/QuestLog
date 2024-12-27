import React from 'react';
import { formatDeadline, isOverdue, calculateOverduePenalty } from '../../../utils/tasks/tasksUtils';

const ProjectView = ({ task, isCompleted, handleSubtaskToggle }) => {
  return (
    <>
      <div className="space-y-2">
        {task.subtasks.map((subtask, index) => (
          <div key={index} className="flex items-center gap-2">
            {!isCompleted && (
              <div className="relative">
                <input
                  type="checkbox"
                  className="peer h-4 w-4 appearance-none rounded border border-gray-300 
                           dark:border-gray-600 bg-white dark:bg-gray-700 
                           checked:bg-blue-500 dark:checked:bg-blue-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500/20
                           transition-all duration-200"
                  checked={subtask.completed || false}
                  onChange={() => handleSubtaskToggle(index)}
                />
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="absolute top-1/2 w-full border-t 
                               border-white dark:border-gray-900
                               opacity-0 peer-checked:opacity-100
                               transition-opacity duration-200"
                  />
                </div>
              </div>
            )}
            <span
              className={`${subtask.completed || isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : ''} 
                              transition-all duration-200`}
            >
              {subtask.name}
            </span>
          </div>
        ))}
      </div>
      {task.deadline && (
        <p>Due date: {formatDeadline(task.deadline)}</p>
      )}
      <p>
        Total Experience: {task.experience}xp
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

export default ProjectView;
