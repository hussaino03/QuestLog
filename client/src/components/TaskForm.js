import React, { useState, useCallback } from 'react';
import { ClipboardList } from 'lucide-react';

const CustomSlider = ({ 
  value, 
  onChange, 
  min = 1, 
  max = 100, 
  snapPoints = [25, 50, 75],
  leftLabel,
  rightLabel,
  snapLabels = []
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  // Memoize the helper functions
  const constrainValue = useCallback((value) => {
    return Math.min(Math.max(value, min), max);
  }, [min, max]);

  const getSnapValue = useCallback((value) => {
    const snapThreshold = 5;
    let closestSnap = value;
    let minDistance = snapThreshold;

    snapPoints.forEach(point => {
      const distance = Math.abs(value - point);
      if (distance < minDistance) {
        minDistance = distance;
        closestSnap = point;
      }
    });

    return minDistance < snapThreshold ? closestSnap : value;
  }, [snapPoints]);

  const handleChange = useCallback((newValue) => {
    const constrainedValue = constrainValue(newValue);
    const finalValue = isDragging ? constrainedValue : getSnapValue(constrainedValue);
    
    setLocalValue(finalValue);
    onChange(finalValue);
  }, [isDragging, constrainValue, getSnapValue, onChange]);

  const handleTrackClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const newValue = Math.round(position * (max - min) + min);
    handleChange(newValue);
  };

  const handleSnapPointClick = (point, e) => {
    e.preventDefault();
    e.stopPropagation();
    handleChange(point);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Apply snap effect when releasing the slider
    handleChange(localValue);
  };

  const handleSliderChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    
    if (clickX >= 0 && clickX <= rect.width) {
      const percentage = (clickX / rect.width);
      const newValue = Math.round(percentage * (max - min) + min);
      handleChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-8">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      
      <div className="relative h-6 mt-8"> 
        {/* Snap point labels */}
        <div className="absolute -top-8 w-full">
          {snapPoints.map((point, index) => (
            <div
              key={`label-${point}`}
              className="absolute text-xs text-gray-500 dark:text-gray-400 transform -translate-x-1/2"
              style={{ 
                left: `${((point - min) / (max - min)) * 100}%`,
              }}
            >
              {snapLabels[index]}
            </div>
          ))}
        </div>

        <div 
          className="relative"
          onClick={handleTrackClick}
        >
          {/* Track background */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer" />
          
          {/* Active track */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 h-2 bg-blue-500 dark:bg-blue-600 rounded-full transition-all duration-150 ease-out cursor-pointer"
            style={{ width: `${((localValue - min) / (max - min)) * 100}%` }}
          />
          
          {/* Snap points */}
          {snapPoints.map((point) => (
            <button
              key={point}
              onMouseDown={(e) => handleSnapPointClick(point, e)}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full 
                         transition-all duration-150 ease-out border-2 cursor-pointer
                         ${localValue >= point 
                           ? 'bg-blue-500 dark:bg-blue-600 border-blue-500 dark:border-blue-600' 
                           : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                         } hover:border-blue-600 dark:hover:border-blue-500
                         ${Math.abs(localValue - point) < 5 ? 'scale-125' : ''}`}
              style={{ 
                left: `${((point - min) / (max - min)) * 100}%`,
                pointerEvents: isDragging ? 'none' : 'auto'
              }}
              aria-label={`Set value to ${point}`}
            />
          ))}
          
          {/* Slider container with bounds checking */}
          <div 
            className="absolute inset-0"
            onMouseMove={(e) => isDragging && handleSliderChange(e)}
          >
            <input
              type="range"
              min={min}
              max={max}
              value={localValue}
              onChange={(e) => handleChange(parseInt(e.target.value))}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="absolute top-1/2 -translate-y-1/2 w-full h-6 opacity-0 cursor-pointer"
              style={{ 
                WebkitAppearance: 'none', 
                appearance: 'none',
                pointerEvents: isDragging ? 'none' : 'auto'
              }}
            />
            <div 
              className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-800 rounded-full 
                         border-2 border-blue-500 dark:border-blue-600 shadow-md
                         -translate-x-1/2 hover:scale-110 transition-all duration-150 ease-out
                         ${isDragging ? 'scale-110' : ''}`}
              style={{ 
                left: `${((localValue - min) / (max - min)) * 100}%`,
                pointerEvents: 'none'
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
        {localValue}%
      </div>
    </div>
  );
};

const TaskForm = ({ addTask }) => {
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    difficulty: 50,
    importance: 50,
    deadline: ''
  });

  const updateFormState = useCallback((field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTask = {
      name: formState.name,
      desc: formState.description,
      difficulty: formState.difficulty,
      importance: formState.importance,
      deadline: formState.deadline || null,
      experience: (
        (parseInt(formState.difficulty) + parseInt(formState.importance) + 20) * 5 + 
        parseInt(parseInt(formState.difficulty) * parseInt(formState.importance) / 20)
      ),
      completion: false
    };
    addTask(newTask);
    setFormState({
      name: '',
      description: '',
      difficulty: 50,
      importance: 50,
      deadline: ''
    });
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
            {/* Header */}
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
            
            {/* Icon */}
            <div className="flex justify-center">
              <ClipboardList className="w-24 h-24 text-gray-600 dark:text-gray-300" />
            </div>
            
            {/* Form Fields */}
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
                  onChange={(e) => updateFormState('name', e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                           rounded-lg text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                />
              </div>
              
              {/* Description */}
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
                <input
                  type="date"
                  value={formState.deadline}
                  onChange={(e) => updateFormState('deadline', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                           rounded-lg text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           cursor-pointer transition-colors duration-200
                           [&::-webkit-calendar-picker-indicator]:cursor-pointer
                           [&::-webkit-calendar-picker-indicator]:dark:filter 
                           [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>
              
              {/* Difficulty Slider */}
              <div className="space-y-2">
                <CustomSlider
                  value={formState.difficulty}
                  onChange={(value) => updateFormState('difficulty', value)}
                  snapPoints={[25, 50, 75]}
                  snapLabels={['Beginner', 'Intermediate', 'Advanced']}
                />
              </div>
              
              {/* Importance Slider */}
              <div className="space-y-2">
                <CustomSlider
                  value={formState.importance}
                  onChange={(value) => updateFormState('importance', value)}
                  snapPoints={[25, 50, 75]}
                  snapLabels={['Low Priority', 'Medium Priority', 'High Priority']}
                />
              </div>
            </div>
            
            {/* Submit Button */}
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