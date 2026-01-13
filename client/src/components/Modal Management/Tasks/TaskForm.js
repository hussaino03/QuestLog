import React, { useState, useCallback } from 'react';
import CustomSlider from '../CustomSlider';
import useXPManager from '../../../services/xp/XPManager';

const TaskForm = ({ addTask }) => {
  const { calculateBaseXP } = useXPManager();
  const defaultFormState = {
    name: '',
    description: '',
    difficulty: 50,
    importance: 50,
    deadline: '',
    urgent: false,
    label: ''
  };

  const MAX_LABEL_LENGTH = 15;

  const [formState, setFormState] = useState(defaultFormState);
  const [selectedDeadline, setSelectedDeadline] = useState(null);
  const [error, setError] = useState('');

  const updateFormState = useCallback((field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      setError('Task name is required');
      return;
    }

    // Handle urgent label
    let finalLabel = formState.label;
    if (formState.urgent) {
      if (!finalLabel) {
        finalLabel = 'urgent';
      } else if (!finalLabel.toLowerCase().includes('urgent')) {
        const urgentSuffix = ' | urgent';
        finalLabel = (finalLabel + urgentSuffix).slice(0, MAX_LABEL_LENGTH);
      }
    }

    const newTask = {
      name: formState.name,
      desc: formState.description,
      difficulty: formState.difficulty,
      importance: formState.importance,
      deadline: formState.deadline || null,
      urgent: formState.urgent,
      label: finalLabel,
      experience: calculateBaseXP(
        formState.difficulty,
        formState.importance,
        formState.urgent
      ),
      completion: false
    };
    addTask(newTask);
    // Reset form to default values
    setFormState(defaultFormState);
    setSelectedDeadline(null);
    handleClose();
  };

  const handleClose = () => {
    const modal = document.getElementById('newtask-form');
    if (modal) {
      modal.style.display = 'none';
    }
    // Reset form state
    setFormState(defaultFormState);
    setSelectedDeadline(null);
  };

  const toggleUrgent = () => {
    updateFormState('urgent', !formState.urgent);
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

    updateFormState('deadline', formattedDate);
    setSelectedDeadline(buttonType);
  };

  return (
    <div className="space-y-4">
      {/* Task Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Task Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={formState.name}
          onChange={(e) => {
            updateFormState('name', e.target.value);
            setError('');
          }}
          required
          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                   rounded-lg text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      {/* Label Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Label{' '}
          <span className="text-xs text-gray-400">
            {MAX_LABEL_LENGTH - formState.label.length} characters remaining
          </span>
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Label your tasks for easy sorting"
            value={formState.label}
            onChange={(e) => {
              const newValue = e.target.value.slice(0, MAX_LABEL_LENGTH);
              updateFormState('label', newValue);
            }}
            maxLength={MAX_LABEL_LENGTH}
            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                     dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 
                     placeholder-gray-500 dark:placeholder-gray-400"
          />
          {formState.label && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <span
                className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 
                           text-blue-600 dark:text-blue-400 rounded-full border 
                           border-blue-200 dark:border-blue-800 text-xs"
              >
                {formState.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Description section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          placeholder="Add some details..."
          value={formState.description}
          onChange={(e) => updateFormState('description', e.target.value)}
          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                   rounded-lg text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
          rows={3}
        />
      </div>

      {/* Deadline */}
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
          value={formState.deadline}
          onChange={(e) => {
            updateFormState('deadline', e.target.value);
            setSelectedDeadline(null);
          }}
          min={`${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                   rounded-lg text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   cursor-pointer transition-colors duration-200
                   [&::-webkit-calendar-picker-indicator]:cursor-pointer
                   [&::-webkit-calendar-picker-indicator]:dark:filter 
                   [&::-webkit-calendar-picker-indicator]:dark:invert"
        />
      </div>

      {/* XP Controls Section */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          XP Settings
        </label>
        <div className="space-y-6">
          {/* Sliders Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Difficulty Slider */}
            <div>
              <CustomSlider
                value={formState.difficulty}
                onChange={(value) => updateFormState('difficulty', value)}
                snapPoints={[25, 50, 75]}
                snapLabels={['Easy', 'Medium', 'Hard']}
              />
              <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                Difficulty Level
              </div>
            </div>

            {/* Importance Slider */}
            <div>
              <CustomSlider
                value={formState.importance}
                onChange={(value) => updateFormState('importance', value)}
                snapPoints={[25, 50, 75]}
                snapLabels={['Low', 'Medium', 'High']}
              />
              <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                Priority Level
              </div>
            </div>
          </div>

          {/* XP Summary Row */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              onClick={toggleUrgent}
              className={`flex-[1.2] px-3 py-2 rounded-lg border transition-all duration-200
                ${
                  formState.urgent
                    ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                }`}
            >
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {formState.urgent ? '🚨 Urgent Task' : '⏱️ Regular Task'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formState.urgent ? '+150 XP Bonus' : 'Base XP'}
              </div>
            </button>

            <div className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Total XP
              </div>
              <div className="text-lg font-bold text-gray-700 dark:text-gray-200">
                {calculateBaseXP(
                  formState.difficulty,
                  formState.importance,
                  formState.urgent
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full p-1.5 sm:p-2 rounded-lg bg-white dark:bg-gray-800 font-bold text-base sm:text-lg 
                   border-2 border-gray-800 text-gray-800 dark:text-gray-200 
                   shadow-[2px_2px_#2563EB] hover:shadow-none hover:translate-x-0.5 
                   hover:translate-y-0.5 transition-all duration-200"
        >
          <div className="flex items-center justify-center gap-3">
            <span>✨</span>
            <span>Create New Task</span>
            <span className="text-sm opacity-75">(Enter ↵)</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default TaskForm;
