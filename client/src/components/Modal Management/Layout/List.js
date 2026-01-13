import React, { useState } from 'react';
import View from './View';
import CalendarView from '../CalendarView';
import {
  LayoutList,
  Calendar,
  PlusCircle,
  FolderPlus,
  ArrowUpDown
} from 'lucide-react';

const TaskList = ({
  tasks = [],
  removeTask,
  completeTask,
  isCompleted,
  addTask,
  updateTask,
  collaborationManager,
  userId
}) => {
  const [quickTaskInput, setQuickTaskInput] = useState('');
  const [isCalendarView, setIsCalendarView] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [sortMethod, setSortMethod] = useState('date');
  const [completedSortOrder, setCompletedSortOrder] = useState('group');

  const handleQuickAdd = (e) => {
    if (e.key === 'Enter' && quickTaskInput.trim()) {
      addTask({
        name: quickTaskInput.trim(),
        desc: '',
        difficulty: 5,
        importance: 5,
        deadline: null,
        urgent: false,
        experience: 150
      });
      setQuickTaskInput('');
    }
  };

  const { regularTasks, projects } = (tasks || []).reduce(
    (acc, task) => {
      if (isCompleted) {
        acc.regularTasks.push(task);
      } else {
        if (task.subtasks || task.isProject) {
          acc.projects.push(task);
        } else {
          acc.regularTasks.push(task);
        }
      }
      return acc;
    },
    { regularTasks: [], projects: [] }
  );

  const getSortedTasks = (tasksToSort) => {
    if (sortMethod === 'label') {
      // When sorting by label, only consider labels - ignore deadlines completely
      return [...tasksToSort].sort((a, b) => {
        if (a.label && !b.label) return -1; // a has label, b doesn't -> a goes first
        if (!a.label && b.label) return 1; // b has label, a doesn't -> b goes first
        if (a.label && b.label) return a.label.localeCompare(b.label); // both have labels -> alphabetical
        return 0; // neither has labels -> keep original order
      });
    }

    return [...tasksToSort].sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  };

  // Only use the active tab separation for non-completed view
  const itemsToDisplay = isCompleted
    ? tasks
    : activeTab === 'tasks'
      ? regularTasks
      : projects;

  // For completed tasks with custom sort, sort by completion date
  const sortedTasks =
    isCompleted && completedSortOrder !== 'group'
      ? [...itemsToDisplay].sort((a, b) => {
          const dateA = a.completedAt ? new Date(a.completedAt) : new Date(0);
          const dateB = b.completedAt ? new Date(b.completedAt) : new Date(0);
          return completedSortOrder === 'recent'
            ? dateB - dateA // Newest first
            : dateA - dateB; // Oldest first
        })
      : getSortedTasks(itemsToDisplay);

  // Group tasks by date OR label depending on sort method
  // Skip grouping for completed tasks when sorted by completion date
  const groupedTasks =
    isCompleted && completedSortOrder !== 'group'
      ? { 'All Completed': sortedTasks }
      : sortedTasks.reduce((groups, task) => {
          if (sortMethod === 'label') {
            if (task.label) {
              // Group labeled tasks by their label
              const groupKey = task.label;
              if (!groups[groupKey]) groups[groupKey] = [];
              groups[groupKey].push(task);
            } else {
              // For unlabeled tasks, use "Unlabeled" as group key
              if (!groups['Unlabeled']) groups['Unlabeled'] = [];
              groups['Unlabeled'].push(task);
            }
          } else {
            if (!task.deadline) {
              if (!groups['No due date']) groups['No due date'] = [];
              groups['No due date'].push(task);
            } else {
              const dateObj = new Date(task.deadline);
              const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
              const adjustedDate = new Date(
                dateObj.getTime() + userTimezoneOffset
              );

              const date = adjustedDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              if (!groups[date]) groups[date] = [];
              groups[date].push(task);
            }
          }
          return groups;
        }, {});

  const sortedGroups =
    isCompleted && completedSortOrder !== 'group'
      ? Object.entries(groupedTasks) // Don't sort when showing all completed tasks together
      : Object.entries(groupedTasks).sort(([keyA], [keyB]) => {
          if (sortMethod === 'label') {
            // Put "Unlabeled" group last, sort other labels alphabetically
            if (keyA === 'Unlabeled') return 1;
            if (keyB === 'Unlabeled') return -1;
            return keyA.localeCompare(keyB);
          } else {
            // Original date sorting logic
            if (keyA === 'No due date') return 1;
            if (keyB === 'No due date') return -1;
            return new Date(keyA) - new Date(keyB);
          }
        });

  return (
    <>
      <div className="flex flex-col h-full">
        {!isCompleted ? (
          <>
            {/* Quick Task Input and Controls */}
            <div className="flex-shrink-0 px-6 pt-6">
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
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 
                          px-1.5 py-0.5 rounded-md 
                          bg-gray-100 dark:bg-gray-600
                          text-[10px] font-medium tracking-wide uppercase
                          text-gray-400 dark:text-gray-400
                          opacity-0 group-hover:opacity-100 
                          transition-all duration-200 ease-in-out
                          transform group-hover:translate-x-0 translate-x-2"
                >
                  enter ↵
                </div>
              </div>

              {/* Combined Toggle Controls */}
              <div className="w-full flex justify-between items-center mb-6">
                <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-0.5 sm:p-1">
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className={`px-3 sm:px-4 py-2 sm:py-2 text-sm sm:text-sm rounded-md transition-all duration-200 ${
                      activeTab === 'tasks'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <span>Tasks ({regularTasks.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`px-3 sm:px-4 py-2 sm:py-2 text-sm sm:text-sm rounded-md transition-all duration-200 ${
                      activeTab === 'projects'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <span>Projects ({projects.length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setSortMethod(sortMethod === 'date' ? 'label' : 'date')
                      }
                      className="px-3 sm:px-4 py-2 sm:py-2 text-sm sm:text-sm rounded-md
                             bg-gray-100 dark:bg-gray-700
                             text-gray-600 dark:text-gray-400 
                             hover:text-gray-900 dark:hover:text-gray-200
                             transition-all duration-200 ease-in-out
                             flex items-center gap-1.5 sm:gap-2"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                      <span className="hidden xs:inline">
                        Sort by {sortMethod === 'date' ? 'Label' : 'Due Date'}
                      </span>
                    </button>
                  </div>

                  {/* Calendar/List View Toggle */}
                  <button
                    onClick={() => setIsCalendarView(!isCalendarView)}
                    className="px-3 sm:px-4 py-2 sm:py-2 text-sm sm:text-sm rounded-md
                           bg-gray-100 dark:bg-gray-700
                           text-gray-600 dark:text-gray-400 
                           hover:text-gray-900 dark:hover:text-gray-200
                           transition-all duration-200 ease-in-out
                           flex items-center gap-1.5 sm:gap-2"
                  >
                    {isCalendarView ? (
                      <>
                        <LayoutList className="w-4 h-4" />
                        <span className="hidden xs:inline text-xs sm:text-sm">
                          List
                        </span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        <span className="hidden xs:inline text-xs sm:text-sm">
                          Calendar
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-shrink-0 px-6 pt-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 w-full text-center mb-3">
              Completed
            </h2>
            <div className="flex justify-center items-center gap-3 mb-6">
              <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-0.5">
                <div
                  className="px-3 py-1.5 text-xs rounded-md
                              bg-white dark:bg-gray-800 
                              text-gray-900 dark:text-gray-100
                              shadow-sm"
                >
                  {tasks.filter((t) => !t.isProject && !t.subtasks).length}{' '}
                  tasks ·{' '}
                  {tasks.filter((t) => t.isProject || t.subtasks).length}{' '}
                  projects
                </div>
              </div>

              {/* Sort dropdown for completed tasks */}
              <select
                value={completedSortOrder}
                onChange={(e) => setCompletedSortOrder(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-md
                           bg-gray-100 dark:bg-gray-700
                           text-gray-700 dark:text-gray-300
                           border border-gray-200 dark:border-gray-600
                           hover:bg-gray-200 dark:hover:bg-gray-600
                           focus:outline-none focus:ring-2 focus:ring-blue-500/20
                           transition-all duration-200 cursor-pointer"
              >
                <option value="group">Sort by Deadline</option>
                <option value="recent">Recently Completed</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        )}

        {!isCompleted && isCalendarView ? (
          <div className="flex-1 min-h-0 overflow-auto">
            <CalendarView tasks={tasks} />
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-auto px-6 pb-6">
            <div className="space-y-8">
              {sortedGroups.map(([date, dateTasks]) => (
                <div
                  key={date}
                  className="w-full flex flex-col items-center space-y-2"
                >
                  {/* Hide group header for completed tasks when sorted by completion date */}
                  {!(isCompleted && completedSortOrder !== 'group') && (
                    <div className="w-11/12 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                      {date}
                    </div>
                  )}
                  <ul className="w-full flex flex-col items-center">
                    {dateTasks.map((task) => (
                      <View
                        key={task.id}
                        task={task}
                        removeTask={removeTask}
                        completeTask={completeTask}
                        isCompleted={isCompleted}
                        updateTask={updateTask}
                        collaborationManager={collaborationManager}
                        userId={userId}
                      />
                    ))}
                  </ul>
                </div>
              ))}

              {!isCompleted && sortedTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 py-16 flex-grow">
                  {activeTab === 'tasks' ? (
                    <>
                      <PlusCircle className="w-20 h-20 mb-6 text-gray-400 dark:text-gray-600" />
                      <p className="text-2xl font-semibold mb-3">
                        No tasks yet
                      </p>
                      <p className="text-base text-center max-w-sm">
                        Type above for a quick task or use the Create+ button
                        for more options
                      </p>
                    </>
                  ) : (
                    <>
                      <FolderPlus className="w-20 h-20 mb-6 text-gray-400 dark:text-gray-600" />
                      <p className="text-2xl font-semibold mb-3">
                        No projects yet
                      </p>
                      <p class="text-base text-center max-w-sm">
                        Use the Create+ button to add a new project with
                        subtasks or join an existing one
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TaskList;
