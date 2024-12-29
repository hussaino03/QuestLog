import React, { useState } from 'react';
import CustomSlider from '../CustomSlider';

const ProjectForm = ({ addTask }) => {
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    deadline: ''
  });
  const [selectedDeadline, setSelectedDeadline] = useState(null);
  const [subTasks, setSubTasks] = useState([
    {
      name: '',
      difficulty: 50,
      importance: 50
    }
  ]);
  const [error, setError] = useState('');
  const [subtaskErrors, setSubtaskErrors] = useState({});

  const handleProjectSubmit = (e) => {
    e.preventDefault();

    if (!projectForm.name.trim()) {
      setError('Project name is required');
      return;
    }

    const emptySubtasks = {};
    const hasEmptySubtasks = subTasks.some((task, index) => {
      if (!task.name.trim()) {
        emptySubtasks[index] = 'Task name is required';
        return true;
      }
      return false;
    });

    if (hasEmptySubtasks) {
      setSubtaskErrors(emptySubtasks);
      return;
    }

    const totalXP = subTasks.reduce((sum, task) => {
      return (
        sum +
        ((parseInt(task.difficulty) + parseInt(task.importance) + 20) * 5 +
          parseInt(
            (parseInt(task.difficulty) * parseInt(task.importance)) / 20
          ))
      );
    }, 0);

    addTask({
      name: projectForm.name,
      desc: projectForm.description,
      deadline: projectForm.deadline || null,
      difficulty: 50,
      importance: 50,
      urgent: false,
      experience: totalXP,
      subtasks: subTasks
    });

    setProjectForm({ name: '', description: '', deadline: '' });
    setSubTasks([{ name: '', difficulty: 50, importance: 50 }]);
    handleClose();
  };

  const handleClose = () => {
    const modal = document.getElementById('newtask-form');
    if (modal) {
      modal.style.display = 'none';
    }
    // Reset project form state
    setProjectForm({ name: '', description: '', deadline: '' });
    setSubTasks([{ name: '', difficulty: 50, importance: 50 }]);
    setSelectedDeadline(null);
  };

  const handleDeadlineClick = (days, buttonType) => {
    const now = new Date();
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + days
    );

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    setProjectForm((prev) => ({ ...prev, deadline: formattedDate }));
    setSelectedDeadline(buttonType);
  };

  const addSubTask = () => {
    setSubTasks([
      ...subTasks,
      {
        name: '',
        difficulty: 50,
        importance: 50
      }
    ]);
  };

  const removeSubTask = (index) => {
    setSubTasks(subTasks.filter((_, i) => i !== index));
  };

  const updateSubTask = (index, field, value) => {
    const updatedTasks = [...subTasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setSubTasks(updatedTasks);
    
    // Clear error for this subtask when typing
    if (field === 'name') {
      setSubtaskErrors(prev => ({
        ...prev,
        [index]: ''
      }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Project Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Project Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="What's the project name?"
          value={projectForm.name}
          onChange={(e) => {
            setProjectForm({ ...projectForm, name: e.target.value });
            setError('');
          }}
          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                   dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 
                   placeholder-gray-500 dark:placeholder-gray-400"
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>

      {/* Project Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          placeholder="Add some details about this project..."
          value={projectForm.description}
          onChange={(e) =>
            setProjectForm({
              ...projectForm,
              description: e.target.value
            })
          }
          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                   dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 
                   placeholder-gray-500 dark:placeholder-gray-400"
          rows={2}
        />
      </div>

      {/* Project Deadline */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Deadline
        </label>
        <div className="flex gap-2 text-xs mb-2">
          <button
            type="button"
            onClick={() => handleDeadlineClick(1, 'tomorrow')}
            className={`px-2.5 py-1 rounded-md text-gray-700 dark:text-gray-300 
                     border transition-all duration-200
                     ${
                       selectedDeadline === 'tomorrow'
                         ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800'
                         : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50'
                     }`}
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => handleDeadlineClick(2, 'dayAfter')}
            className={`px-2.5 py-1 rounded-md text-gray-700 dark:text-gray-300 
                     border transition-all duration-200
                     ${
                       selectedDeadline === 'dayAfter'
                         ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800'
                         : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50'
                     }`}
          >
            Day After
          </button>
          <button
            type="button"
            onClick={() => handleDeadlineClick(7, 'nextWeek')}
            className={`px-2.5 py-1 rounded-md text-gray-700 dark:text-gray-300 
                     border transition-all duration-200
                     ${
                       selectedDeadline === 'nextWeek'
                         ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800'
                         : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50'
                     }`}
          >
            Next Week
          </button>
        </div>
        <input
          type="date"
          value={projectForm.deadline}
          onChange={(e) => {
            setProjectForm({
              ...projectForm,
              deadline: e.target.value
            });
            setSelectedDeadline(null);
          }}
          min={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                   rounded-lg text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   cursor-pointer transition-colors duration-200
                   [&::-webkit-calendar-picker-indicator]:cursor-pointer
                   [&::-webkit-calendar-picker-indicator]:dark:filter 
                   [&::-webkit-calendar-picker-indicator]:dark:invert"
        />
      </div>

      {/* Subtasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={addSubTask}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Add Task
          </button>
        </div>

        {/* Subtask List */}
        {subTasks.map((task, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Task {index + 1}{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {(parseInt(task.difficulty) +
                    parseInt(task.importance) +
                    20) *
                    5 +
                    parseInt(
                      (parseInt(task.difficulty) *
                        parseInt(task.importance)) /
                        20
                    )}{' '}
                  XP
                </span>
                {subTasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubTask(index)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center 
                             hover:bg-red-500/10 transition-colors"
                  >
                    <span className="text-red-600 dark:text-red-400 text-lg">
                      ×
                    </span>
                  </button>
                )}
              </div>
            </div>
            <input
              type="text"
              required
              placeholder="Subtask name"
              value={task.name}
              onChange={(e) =>
                updateSubTask(index, 'name', e.target.value)
              }
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                       dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 
                       placeholder-gray-500 dark:placeholder-gray-400"
            />
            {subtaskErrors[index] && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {subtaskErrors[index]}
              </p>
            )}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <CustomSlider
                  value={task.difficulty}
                  onChange={(value) =>
                    updateSubTask(index, 'difficulty', value)
                  }
                  snapPoints={[25, 50, 75]}
                  snapLabels={['Easy', 'Medium', 'Hard']}
                />
                <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                  Difficulty Level
                </div>
              </div>
              <div>
                <CustomSlider
                  value={task.importance}
                  onChange={(value) =>
                    updateSubTask(index, 'importance', value)
                  }
                  snapPoints={[25, 50, 75]}
                  snapLabels={['Low', 'Medium', 'High']}
                />
                <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                  Priority Level
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Submit Button */}
      <button
        type="submit"
        onClick={handleProjectSubmit}
        className="w-full p-1.5 sm:p-2 rounded-lg bg-white dark:bg-gray-800 font-bold text-base sm:text-lg 
                 border-2 border-gray-800 text-gray-800 dark:text-gray-200 
                 shadow-[2px_2px_#2563EB] hover:shadow-none hover:translate-x-0.5 
                 hover:translate-y-0.5 transition-all duration-200"
      >
        <div className="flex items-center justify-center gap-3">
          <span>✨</span>
          <span>Create Project</span>
          <span className="text-sm opacity-75">(Enter ↵)</span>
        </div>
      </button>
    </div>
  );
};

export default ProjectForm;