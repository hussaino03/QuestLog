import React, { useState, useRef, useEffect } from 'react';
import PomodoroTimer from '../Timer/PomodoroTimer'; 

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
    collaborative: task.collaborative,
    label: task.label || ''  
  });
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [isTextTruncated, setIsTextTruncated] = useState(false);
  const [showFullNameModal, setShowFullNameModal] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTextTruncated(textRef.current.scrollWidth > textRef.current.offsetWidth);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [task.name]);

  const formatDeadline = (deadline) => {
    if (!deadline) return '';
    
    const [year, month, day] = deadline.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-based in Date constructor
    
    return date.toLocaleDateString();
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    
    const [year, month, day] = deadline.split('-').map(Number);
    const deadlineDate = new Date(year, month - 1, day, 23, 59, 59); // Set to end of deadline day
    
    const now = new Date();
    return now > deadlineDate;
  };

  const calculateOverduePenalty = (deadline) => {
    if (!deadline) return 0;
    
    const [year, month, day] = deadline.split('-').map(Number);
    const now = new Date();
    
    // Use UTC to avoid timezone issues
    const normalizedDeadline = Date.UTC(year, month - 1, day) / (1000 * 60 * 60 * 24);
    const normalizedNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / (1000 * 60 * 60 * 24);
    
    const daysOverdue = Math.floor(normalizedNow - normalizedDeadline);
    return daysOverdue > 0 ? (-5 * daysOverdue) : 0;
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

  const handleSubtaskToggle = (index) => {
    const updatedTask = {
      ...task,
      subtasks: task.subtasks.map((subtask, i) => 
        i === index ? { ...subtask, completed: !subtask.completed } : subtask
      )
    };
    updateTask(task.id, updatedTask);
  };

  const areAllSubtasksCompleted = task.subtasks?.every(subtask => subtask.completed);

  return (
    <li className="border-2 border-gray-200 dark:border-gray-700 rounded-xl mb-4 overflow-hidden bg-white dark:bg-gray-800 hover:shadow-md transition-shadow w-full max-w-2xl relative">
      <div className="flex flex-wrap items-center justify-between p-3 gap-2">
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
          <form onSubmit={handleEdit} className="flex-1 min-w-0 mx-2">
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
          <span className="flex-1 min-w-0 text-center text-gray-700 dark:text-gray-200 mx-2 flex items-center justify-center gap-2 flex-wrap">
            <span className="relative flex items-center max-w-full">
              <span ref={textRef} className="truncate max-w-[150px] xs:max-w-[180px] sm:max-w-none">
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
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              )}
            </span>
            <div className="inline-flex items-center justify-center w-full xs:w-auto gap-1.5 flex-wrap xs:flex-nowrap gap-y-2 xs:gap-y-0">
              {task.subtasks && (
                <span className="inline-flex text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 
                             text-blue-600 dark:text-blue-400 rounded-full border 
                             border-blue-200 dark:border-blue-800 whitespace-nowrap">
                  Project
                </span>
              )}
              {task.label && (
                <span className="inline-flex text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 
                             text-blue-600 dark:text-blue-400 rounded-full border 
                             border-blue-200 dark:border-blue-800 whitespace-nowrap">
                  {task.label}
                </span>
              )}
              {!isCompleted && task.deadline && isOverdue(task.deadline) && (
                <span className="inline-flex text-[10px] xs:text-xs px-1 xs:px-1.5 py-0.5 
                               bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 
                               rounded-full border border-red-200 dark:border-red-800 
                               whitespace-nowrap shrink-0">
                  OVERDUE ({calculateOverduePenalty(task.deadline)} XP)
                </span>
              )}
              {isCompleted && task.earlyBonus > 0 && (
                <span className="inline-flex text-[10px] xs:text-xs px-1 xs:px-1.5 py-0.5 
                               bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 
                               rounded-full border border-green-200 dark:border-green-800 
                               whitespace-nowrap shrink-0">
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
                  onClick={handleEdit}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                >
                  <span className="text-blue-600 dark:text-blue-400">💾</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <span className="text-red-600 dark:text-red-400 text-lg">×</span>
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
                  <span className="text-blue-600 dark:text-blue-400 transform -scale-x-100 inline-block">✎</span>
                </button>
                {(!task.subtasks || areAllSubtasksCompleted) && (
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
                onChange={(e) => setEditForm({...editForm, label: e.target.value})}
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
                min={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
                onChange={(e) => setEditForm({...editForm, deadline: e.target.value})}
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
            <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border 
                          border-gray-200 dark:border-gray-700">
              <PomodoroTimer taskName={task.name} />
            </div>
          )}

          {task.subtasks ? (
            // Project View Details
            <>
              <div className="space-y-2">
                {task.subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {!isCompleted && (
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 
                                 text-blue-500 dark:text-blue-400 focus:ring-blue-500"
                        checked={subtask.completed || false}
                        onChange={() => handleSubtaskToggle(index)}
                      />
                    )}
                    <span className={`${(subtask.completed || isCompleted) ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                      {subtask.name}
                    </span>
                  </div>
                ))}
              </div>
              {task.deadline && <p>Due date: {formatDeadline(task.deadline)}</p>}
              <p>Total Experience: {task.experience}xp
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
          ) : (
            // Task View Details
            <>
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
                    {` ${calculateOverduePenalty(task.deadline)}xp`}
                  </span>
                )}
              </p>
            </>
          )}
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
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Task Name</h2>
              <button 
                onClick={() => setShowFullNameModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                <span className="text-red-600 dark:text-red-400 text-lg">×</span>
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 break-words">{task.name}</p>
            </div>
          </div>
        </div>
      )}
    </li>
  );
};

export default Task;