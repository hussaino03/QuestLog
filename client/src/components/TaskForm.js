import React, { useState } from 'react';

const TaskForm = ({ addTask }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState(50);
  const [importance, setImportance] = useState(50);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTask = {
      name,
      desc: description,
      difficulty,
      importance,
      experience: ((parseInt(difficulty) + parseInt(importance) + 20) * 5 + parseInt(parseInt(difficulty) * parseInt(importance) / 20)),
      completion: false
    };
    addTask(newTask);
    setName('');
    setDescription('');
    setDifficulty(50);
    setImportance(50);
    handleClose();
  };

  const handleClose = () => {
    const modal = document.getElementById('newtask-form');
    if (modal) {
      modal.style.display = 'none';
    }
  };

  const handleOutsideClick = (e) => {
    if (e.target.id === 'newtask-form') {
      handleClose();
    }
  };

  return (
    <div 
      id="newtask-form" 
      className="hidden fixed inset-0 overflow-y-auto overflow-x-hidden bg-black/50"
      style={{ 
        display: 'none',
        zIndex: 9999
      }}
      onClick={handleOutsideClick}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <form 
          onSubmit={handleSubmit} 
          className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200">Create New Task</h3>
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                <span className="text-red-600 dark:text-red-400 text-lg">×</span>
              </button>
            </div>
            
            <div className="flex justify-center">
              <img src="/main.png" alt="Task icon" className="w-24 h-24" />
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Add new task"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                         rounded text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <textarea
                placeholder="Task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                         rounded text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Very easy</span>
                  <span>Very hard</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Not important</span>
                  <span>Very important</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={importance}
                  onChange={(e) => setImportance(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold text-lg 
                       border-3 border-gray-800 dark:border-gray-200 shadow-[4px_4px_#77dd77] hover:shadow-none 
                       hover:translate-x-1 hover:translate-y-1 transition-all duration-200 rounded-none"
            >
              Press Enter or click to submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;