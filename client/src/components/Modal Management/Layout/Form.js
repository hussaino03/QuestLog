import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ClipboardList, FolderTree, UsersRound } from 'lucide-react';
import TaskForm from '../Tasks/TaskForm';
import ProjectForm from '../Projects/ProjectForm';

const Form = ({ addTask, taskManager }) => {
  const [currentView, setCurrentView] = useState('task'); // 'task', 'project', or 'join'
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    const modal = document.getElementById('newtask-form');
    if (modal) {
      modal.style.display = 'none';
    }
    setCurrentView('task');
  };

  useEffect(() => {
    const modalContainer = document.createElement('div');
    document.body.appendChild(modalContainer);

    return () => {
      document.body.removeChild(modalContainer);
    };
  }, []);

  const handleJoinProject = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setError('Please enter a project code');
      return;
    }
    
    const success = await taskManager.joinProject(joinCode.trim());
    if (success) {
      handleClose();
    } else {
      setError('Invalid project code. Please check and try again.');
    }
  };

  const modalContent = (
    <div
      id="newtask-form"
      className="hidden fixed inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
      style={{ display: 'none', zIndex: 9999 }}
    >
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl
                    transform scale-100 animate-modalSlide max-h-[calc(100vh-2rem)] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}>
          <div className="p-6 space-y-6">
            {/* Toggle Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setCurrentView('task')}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-200 
                    ${currentView === 'task'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    <span>Task</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('project')}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-200
                    ${currentView === 'project'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <FolderTree className="w-4 h-4" />
                    <span>Project</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('join')}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-200
                    ${currentView === 'join'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <UsersRound className="w-4 h-4" />
                    <span>Join</span>
                  </div>
                </button>
              </div>
              {/* Close button */}
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                <span className="text-red-600 dark:text-red-400 text-lg">×</span>
              </button>
            </div>

            {currentView === 'join' ? (
              <form onSubmit={handleJoinProject}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Received an invitation to collaborate?
                    </label>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => {
                        setJoinCode(e.target.value);
                        setError(''); 
                      }}
                      placeholder="Paste project code here"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                               rounded-lg bg-white dark:bg-gray-700 text-gray-900 
                               dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                    {error && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full p-1.5 sm:p-2 rounded-lg bg-white dark:bg-gray-800 font-bold text-base sm:text-lg 
                             border-2 border-gray-800 text-gray-800 dark:text-gray-200 
                             shadow-[2px_2px_#2563EB] hover:shadow-none hover:translate-x-0.5 
                             hover:translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <span>👥</span>
                      <span>Join Project</span>
                      <span className="text-sm opacity-75">(Enter ↵)</span>
                    </div>
                  </button>
                </div>
              </form>
            ) : currentView === 'project' ? (
              <ProjectForm addTask={addTask} />
            ) : (
              <TaskForm addTask={addTask} />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Form;