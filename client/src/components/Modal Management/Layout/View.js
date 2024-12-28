import React, { useState, useRef, useEffect } from 'react';
import PomodoroTimer from '../../Timer/PomodoroTimer';
import TaskView from '../Tasks/TaskView';
import ProjectView from '../Projects/ProjectView';
import { 
  isOverdue, 
  calculateOverduePenalty, 
  handleEdit, 
  checkTextTruncation 
} from '../../../utils/tasks/tasksUtils';

const View = ({ task, removeTask, completeTask, isCompleted, updateTask }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: task.name,
    desc: task.desc,
    deadline: task.deadline || '',
    difficulty: task.difficulty,
    importance: task.importance,
    urgent: task.urgent,
    label: task.label || ''
  });
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [isTextTruncated, setIsTextTruncated] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    const handleTruncation = () => {
      if (textRef.current) {
        setIsTextTruncated(checkTextTruncation(textRef.current));
      }
    };

    handleTruncation();
    window.addEventListener('resize', handleTruncation);
    return () => window.removeEventListener('resize', handleTruncation);
  }, [task.name]);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updatedTask = handleEdit(task, editForm, updateTask);
    updateTask(task.id, updatedTask);
    setIsEditing(false);
  };

  const handleSubtaskToggle = (index) => {
    const updatedTask = {
      ...task,
      subtasks: task.subtasks.map((subtask, i) =>
        i === index ? { ...subtask, completed: !subtask.completed } : subtask
      )
    };
    updateTask(task.id, updatedTask);
  };

  const areAllSubtasksCompleted = task.subtasks?.every(
    (subtask) => subtask.completed
  );

  return (
    <li className="border-2 border-gray-200 dark:border-gray-700 rounded-xl mb-4 overflow-hidden bg-white dark:bg-gray-800 hover:shadow-md transition-shadow w-full max-w-2xl relative">
      <div className="flex flex-wrap items-center justify-between p-3 gap-2">
        <button
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
          onClick={() => setShowDetails(!showDetails)}
          aria-label="Toggle task details"
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

        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="flex-1 min-w-0 mx-2">
            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                       dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 
                       placeholder-gray-500 dark:placeholder-gray-400"
            />
          </form>
        ) : (
          <span className="flex-1 min-w-0 text-center text-gray-700 dark:text-gray-200 mx-2 flex items-center justify-center gap-2 flex-wrap">
            <TaskView 
              task={task}
              isCompleted={isCompleted}
              showDescription={showDescription}
              setShowDescription={setShowDescription}
              isTextTruncated={isTextTruncated}
              textRef={textRef}
              nameOnly={true}
            />
            <div className="inline-flex items-center justify-center w-full xs:w-auto gap-1.5 flex-wrap xs:flex-nowrap gap-y-2 xs:gap-y-0">
              {task.subtasks && (
                <span
                  className="inline-flex text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 
                             text-blue-600 dark:text-blue-400 rounded-full border 
                             border-blue-200 dark:border-blue-800 whitespace-nowrap"
                >
                  Project
                </span>
              )}
              {task.label && (
                <span
                  className="inline-flex text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 
                             text-blue-600 dark:text-blue-400 rounded-full border 
                             border-blue-200 dark:border-blue-800 whitespace-nowrap"
                >
                  {task.label}
                </span>
              )}
              {!isCompleted && task.deadline && isOverdue(task.deadline) && (
                <span
                  className="inline-flex text-[10px] xs:text-xs px-1 xs:px-1.5 py-0.5 
                               bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 
                               rounded-full border border-red-200 dark:border-red-800 
                               whitespace-nowrap shrink-0"
                >
                  OVERDUE ({calculateOverduePenalty(task.deadline)} XP)
                </span>
              )}
              {isCompleted && task.earlyBonus > 0 && (
                <span
                  className="inline-flex text-[10px] xs:text-xs px-1 xs:px-1.5 py-0.5 
                               bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 
                               rounded-full border border-green-200 dark:border-green-800 
                               whitespace-nowrap shrink-0"
                >
                  BONUS (+{task.earlyBonus} XP)
                </span>
              )}
            </div>
          </span>
        )}

        <div className="flex gap-1 flex-shrink-0">
          {!isCompleted ? (
            isEditing ? (
              <>
                <button
                  onClick={handleEditSubmit}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                >
                  <span className="text-blue-600 dark:text-blue-400">💾</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <span className="text-red-600 dark:text-red-400 text-lg">
                    ×
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowDetails(true);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                >
                  <span className="text-blue-600 dark:text-blue-400 transform -scale-x-100 inline-block">
                    ✎
                  </span>
                </button>
                {(!task.subtasks || areAllSubtasksCompleted) && (
                  <button
                    onClick={() => completeTask(task)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/10 hover:bg-green-500/20 transition-colors"
                  >
                    <span className="text-green-600 dark:text-green-400 text-lg">
                      ✓
                    </span>
                  </button>
                )}
                <button
                  onClick={() => removeTask(task.id, isCompleted)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <span className="text-red-600 dark:text-red-400 text-lg">
                    ×
                  </span>
                </button>
              </>
            )
          ) : (
            <button
              onClick={() => removeTask(task.id, isCompleted)}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
            >
              <span className="text-red-600 dark:text-red-400 text-lg">×</span>
            </button>
          )}
        </div>
      </div>

      {isEditing && showDetails && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900">
          <div className="space-y-4">
            {/* Label field edit */}
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                Label
              </label>
              <input
                type="text"
                value={editForm.label}
                onChange={(e) =>
                  setEditForm({ ...editForm, label: e.target.value })
                }
                maxLength={15}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                         dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 
                         placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={editForm.desc}
                onChange={(e) =>
                  setEditForm({ ...editForm, desc: e.target.value })
                }
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                         dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 
                         placeholder-gray-500 dark:placeholder-gray-400"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                Deadline
              </label>
              <input
                type="date"
                value={editForm.deadline}
                min={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
                onChange={(e) =>
                  setEditForm({ ...editForm, deadline: e.target.value })
                }
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                         dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200
                         cursor-pointer transition-colors duration-200
                         [&::-webkit-calendar-picker-indicator]:cursor-pointer
                         [&::-webkit-calendar-picker-indicator]:dark:filter 
                         [&::-webkit-calendar-picker-indicator]:dark:invert"
              />
            </div>
          </div>
        </div>
      )}

      <div
        className={`transition-all duration-300 ease-in-out bg-gray-50 dark:bg-gray-900 ${
          showDetails ? 'max-h-[500px] py-3' : 'max-h-0'
        } overflow-hidden`}
      >
        <div className="px-4 space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
          {!isCompleted && (
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
              <button
                onClick={() => setShowPomodoro(!showPomodoro)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg 
                         text-gray-600 dark:text-gray-300 hover:bg-gray-100 
                         dark:hover:bg-gray-800 transition-colors"
              >
                <span className="text-lg">⏱️</span>
                <span className="text-sm font-medium">
                  {showPomodoro ? 'Hide Timer' : 'Focus Timer'}
                </span>
              </button>
            </div>
          )}

          {showPomodoro && !isCompleted && (
            <div
              className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border 
                          border-gray-200 dark:border-gray-700"
            >
              <PomodoroTimer taskName={task.name} />
            </div>
          )}

          {task.subtasks ? (
            <ProjectView 
              task={task}
              isCompleted={isCompleted}
              handleSubtaskToggle={handleSubtaskToggle}
            />
          ) : (
            <TaskView 
              task={task}
              isCompleted={isCompleted}
              showDescription={showDescription}
              setShowDescription={setShowDescription}
              isTextTruncated={isTextTruncated}
              textRef={textRef}
            />
          )}
        </div>
      </div>
    </li>
  );
};

export default View;
