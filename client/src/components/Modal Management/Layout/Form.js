import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ClipboardList, FolderTree } from 'lucide-react';
import TaskForm from '../Tasks/TaskForm';
import ProjectForm from '../Projects/ProjectForm';

const Form = ({ addTask }) => {
  const [isProjectView, setIsProjectView] = useState(false);

  const handleClose = () => {
    const modal = document.getElementById('newtask-form');
    if (modal) {
      modal.style.display = 'none';
    }
    setIsProjectView(false);
  };

  useEffect(() => {
    const modalContainer = document.createElement('div');
    document.body.appendChild(modalContainer);

    return () => {
      document.body.removeChild(modalContainer);
    };
  }, []);

  const modalContent = (
    <div
      id="newtask-form"
      className="hidden fixed inset-0 bg-black/50 backdrop-blur-sm
                 animate-fadeIn"
      style={{
        display: 'none',
        zIndex: 9999
      }}
    >
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div
          className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl
                    transform scale-100 animate-modalSlide max-h-[calc(100vh-2rem)] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 space-y-6">
            {/* toggle */}
            <div className="flex items-center justify-between">
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setIsProjectView(false)}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-200 
                    ${
                      !isProjectView
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
                  onClick={() => setIsProjectView(true)}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-200
                    ${
                      isProjectView
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <FolderTree className="w-4 h-4" />
                    <span>Project</span>
                  </div>
                </button>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                <span className="text-red-600 dark:text-red-400 text-lg">
                  ×
                </span>
              </button>
            </div>

            {isProjectView ? (
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