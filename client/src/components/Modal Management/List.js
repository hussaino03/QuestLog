import React, { useState } from 'react';
import Task from './View';
import CalendarView from '../../utils/CalendarView';
import { LayoutList, Calendar, PlusCircle, FolderPlus } from 'lucide-react';

const TaskList = ({ tasks = [], removeTask, completeTask, isCompleted, addTask, updateTask }) => {
  const [quickTaskInput, setQuickTaskInput] = useState('');
  const [isCalendarView, setIsCalendarView] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); 
  const [showAllCompleted, setShowAllCompleted] = useState(false);

  const handleQuickAdd = (e) => {
    if (e.key === 'Enter' && quickTaskInput.trim()) {
      addTask({
        name: quickTaskInput.trim(),
        desc: '',
        difficulty: 5,
        importance: 5,
        deadline: null,
        collaborative: false,
        experience: 150
      });
      setQuickTaskInput('');
    }
  };

  // Separate tasks and projects
  const { regularTasks, projects } = (tasks || []).reduce((acc, task) => {
    if (task.subtasks) {
      acc.projects.push(task);
    } else {
      acc.regularTasks.push(task);
    }
    return acc;
  }, { regularTasks: [], projects: [] });

  // Sort tasks based on active tab
  const itemsToDisplay = activeTab === 'tasks' ? regularTasks : projects;
  const sortedTasks = [...itemsToDisplay].sort((a, b) => {
    // Tasks without deadlines go last
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  // Group tasks by date
  const groupedTasks = sortedTasks.reduce((groups, task) => {
    if (!task.deadline) {
      if (!groups['No due date']) groups['No due date'] = [];
      groups['No due date'].push(task);
    } else {
      const dateObj = new Date(task.deadline);
      const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(dateObj.getTime() + userTimezoneOffset);
      
      const date = adjustedDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(task);
    }
    return groups;
  }, {});

  const sortedGroups = Object.entries(groupedTasks).sort(([dateA], [dateB]) => {
    if (dateA === 'No due date') return 1;
    if (dateB === 'No due date') return -1;
    if (dateA !== 'No due date' && dateB !== 'No due date') {
      // Convert the formatted dates back to timestamps for comparison
      const dateAObj = new Date(dateA);
      const dateBObj = new Date(dateB);
      return dateAObj - dateBObj;
    }
    return 0;
  });

  const COMPLETED_TASKS_LIMIT = 3;
  const limitedGroups = isCompleted ? 
    sortedGroups.reduce((acc, [date, tasks]) => {
      const totalTasksSoFar = acc.length > 0 ? 
        acc.reduce((sum, [_, groupTasks]) => sum + (groupTasks?.length || 0), 0) : 0;
        
      if (totalTasksSoFar < COMPLETED_TASKS_LIMIT) {
        const remainingSlots = COMPLETED_TASKS_LIMIT - totalTasksSoFar;
        const limitedTasks = tasks?.slice(0, remainingSlots) || [];
        if (limitedTasks.length > 0) {
          acc.push([date, limitedTasks]);
        }
      }
      return acc;
    }, []) : 
    sortedGroups;

  return (
    <>
      <div className="flex flex-col items-center w-full bg-white dark:bg-gray-800 rounded-lg p-6 transition-colors duration-200 min-h-[500px]">
        {!isCompleted ? (
          <>
            {/* Quick Task Input */}
            <div className="relative w-full mb-6 group">
              <input
                type="text"
                placeholder="Quick add task..."
                value={quickTaskInput}
                onChange={(e) => setQuickTaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleQuickAdd(e);
                  }
                }}
                className="w-full px-4 py-3 text-sm bg-gray-50/80 dark:bg-gray-700/80 
                       border border-gray-200 dark:border-gray-600 rounded-lg 
                       text-gray-900 dark:text-gray-100 backdrop-blur-sm
                       placeholder-gray-400 dark:placeholder-gray-500 
                       transition-all duration-200 ease-in-out
                       focus:bg-white dark:focus:bg-gray-700
                       focus:border-blue-500/50 dark:focus:border-blue-400/50 
                       focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10
                       focus:outline-none
                       hover:border-gray-300 dark:hover:border-gray-500"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 
                          px-1.5 py-0.5 rounded-md 
                          bg-gray-100 dark:bg-gray-600
                          text-[10px] font-medium tracking-wide uppercase
                          text-gray-400 dark:text-gray-400
                          opacity-0 group-hover:opacity-100 
                          transition-all duration-200 ease-in-out
                          transform group-hover:translate-x-0 translate-x-2">
                enter ↵
              </div>
            </div>

            {/* Combined Toggle Controls */}
            <div className="w-full flex justify-between items-center mb-6">
              <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-0.5 sm:p-1">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-all duration-200 ${
                    activeTab === 'tasks'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span>Tasks ({regularTasks.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-all duration-200 ${
                    activeTab === 'projects'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span>Projects ({projects.length})</span>
                </button>
              </div>

              <button
                onClick={() => setIsCalendarView(!isCalendarView)}
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md
                         bg-gray-100 dark:bg-gray-700
                         text-gray-600 dark:text-gray-400 
                         hover:text-gray-900 dark:hover:text-gray-200
                         transition-all duration-200 ease-in-out
                         flex items-center gap-1.5 sm:gap-2"
              >
                {isCalendarView ? (
                  <>
                    <LayoutList className="w-4 h-4" />
                    <span className="hidden xs:inline text-xs sm:text-sm">List</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span className="hidden xs:inline text-xs sm:text-sm">Calendar</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 w-full text-center mb-6">
            Completed
          </h2>
        )}

        {!isCompleted && isCalendarView ? (
          <CalendarView tasks={tasks} />
        ) : (
          <div className="space-y-8 w-full flex flex-col items-center">
            {/* Always show limited tasks in the background */}
            {limitedGroups.map(([date, dateTasks]) => (
              <div key={date} className="w-full flex flex-col items-center space-y-2">
                <div className="w-11/12 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  {date}
                </div>
                <ul className="w-full flex flex-col items-center">
                  {dateTasks.map((task) => (
                    <Task
                      key={task.id}
                      task={task}
                      removeTask={removeTask}
                      completeTask={completeTask}
                      isCompleted={isCompleted}
                      updateTask={updateTask}
                    />
                  ))}
                </ul>
              </div>
            ))}

            {isCompleted && !showAllCompleted && (tasks || []).length > COMPLETED_TASKS_LIMIT && (
              <button
                onClick={() => setShowAllCompleted(true)}
                className="mt-4 p-1.5 sm:p-2 rounded-lg bg-white dark:bg-gray-800 font-bold text-base sm:text-lg 
                          bordV2 border-gray-800 text-gray-800 dark:text-gray-200 
                          shadow-[2px_2px_#2563EB] hover:shadow-none hover:translate-x-0.5 
                          hover:translate-y-0.5 transition-all duration-200"
              >
                See All ({(tasks || []).length})
              </button>
            )}

            {!isCompleted && sortedTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 py-16 flex-grow">
                {activeTab === 'tasks' ? (
                  <>
                    <PlusCircle className="w-20 h-20 mb-6 text-gray-400 dark:text-gray-600" />
                    <p className="text-2xl font-semibold mb-3">No tasks yet</p>
                    <p className="text-base text-center max-w-sm">
                      Type above for a quick task or use the Create+ button for more options
                    </p>
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-20 h-20 mb-6 text-gray-400 dark:text-gray-600" />
                    <p className="text-2xl font-semibold mb-3">No projects yet</p>
                    <p className="text-base text-center max-w-sm">
                      Use the Create+ button to add a new project with subtasks
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Completed tasks modal */}
      {showAllCompleted && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-end items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAllCompleted(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                <span className="text-red-600 dark:text-red-400 text-lg">×</span>
              </button>
            </div>
            <div className="p-4">
              {sortedGroups.map(([date, dateTasks]) => (
                <div key={date} className="w-full flex flex-col items-center space-y-2">
                  <div className="w-11/12 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                    {date}
                  </div>
                  <ul className="w-full flex flex-col items-center">
                    {dateTasks.map((task) => (
                      <Task
                        key={task.id}
                        task={task}
                        removeTask={removeTask}
                        completeTask={completeTask}
                        isCompleted={isCompleted}
                        updateTask={updateTask}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskList;