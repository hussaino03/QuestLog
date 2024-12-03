import React, { useState } from 'react';

const Task = ({ task, removeTask, completeTask, isCompleted, updateTask }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: task.name,
    desc: task.desc,
    deadline: task.deadline || '',
    difficulty: task.difficulty,
    importance: task.importance,
    collaborative: task.collaborative
  });

  const formatDeadline = (deadline) => {
    if (!deadline) return '';
    
    // Create date object and force it to be interpreted in local timezone
    const date = new Date(deadline + 'T12:00:00');
    
    // Format using local date string
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'UTC'  
    });
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    const now = new Date();
    const deadlineDate = new Date(deadline + 'T23:59:59');
    return now > deadlineDate;
  };

  const handleEdit = (e) => {
    e.preventDefault();
    updateTask(task.id, {
      ...task,
      ...editForm,
      experience: (
        (parseInt(editForm.difficulty) + parseInt(editForm.importance) + 20) * 5 + 
        parseInt(parseInt(editForm.difficulty) * parseInt(editForm.importance) / 20) +
        (editForm.collaborative ? 150 : 0)
      )
    });
    setIsEditing(false);
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

        {isEditing ? (
          <form onSubmit={handleEdit} className="flex-grow mx-4">
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                       dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 
                       placeholder-gray-500 dark:placeholder-gray-400"
            />
          </form>
        ) : (
          <span className="flex-grow text-center text-gray-700 dark:text-gray-200 mx-4">
            {task.name}
            {!isCompleted && task.deadline && isOverdue(task.deadline) && (
              <span className="ml-2 text-red-500 text-sm">
                OVERDUE (-5 XP)
              </span>
            )}
          </span>
        )}

        <div className="flex gap-1">
          {!isCompleted && !isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
                setShowDetails(true);  
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
            >
              <span className="text-blue-600 dark:text-blue-400">🖉</span>
            </button>
          )}
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

      {isEditing && showDetails && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900">
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={editForm.desc}
                onChange={(e) => setEditForm({...editForm, desc: e.target.value})}
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
                onChange={(e) => setEditForm({...editForm, deadline: e.target.value})}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                         dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 
                         [&::-webkit-calendar-picker-indicator]:dark:filter 
                         [&::-webkit-calendar-picker-indicator]:dark:invert"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 font-bold text-lg 
                         border-3 border-gray-800 dark:border-gray-200 text-gray-800 dark:text-gray-200 
                         shadow-[4px_4px_#77dd77] hover:shadow-none hover:translate-x-1 
                         hover:translate-y-1 transition-all duration-200 rounded-none"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 font-bold text-lg 
                         border-3 border-gray-800 dark:border-gray-200 text-gray-800 dark:text-gray-200 
                         shadow-[4px_4px_#ff6b6b] hover:shadow-none hover:translate-x-1 
                         hover:translate-y-1 transition-all duration-200 rounded-none"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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