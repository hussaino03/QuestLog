import React, { useState, useCallback } from 'react';
import { ClipboardList, FolderTree } from 'lucide-react';
import CustomSlider from './CustomSlider';

const TaskForm = ({ addTask }) => {
  const defaultFormState = {
    name: '',
    description: '',
    difficulty: 50,
    importance: 50,
    deadline: '',
    collaborative: false
  };

  const [formState, setFormState] = useState(defaultFormState);
  const [selectedDeadline, setSelectedDeadline] = useState(null); 
  const [isProjectView, setIsProjectView] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    deadline: '',
  });
  const [subTasks, setSubTasks] = useState([{
    name: '',
    difficulty: 50,
    importance: 50,
  }]);

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
      collaborative: formState.collaborative,  
      experience: (
        (parseInt(formState.difficulty) + parseInt(formState.importance) + 20) * 5 + 
        parseInt(parseInt(formState.difficulty) * parseInt(formState.importance) / 20) +
        (formState.collaborative ? 150 : 0)  
      ),
      completion: false
    };
    addTask(newTask);
    // Reset form to default values
    setFormState(defaultFormState);
    setSelectedDeadline(null); 
    handleClose();
  };

  const handleProjectSubmit = (e) => {
    e.preventDefault();
    const totalXP = subTasks.reduce((sum, task) => {
      return sum + ((parseInt(task.difficulty) + parseInt(task.importance) + 20) * 5 + 
             parseInt(parseInt(task.difficulty) * parseInt(task.importance) / 20));
    }, 0);

    addTask({
      name: projectForm.name,
      desc: projectForm.description,
      deadline: projectForm.deadline || null,
      difficulty: 50,
      importance: 50,
      collaborative: false,
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
    // Reset all form states
    setFormState(defaultFormState);
    setProjectForm({ name: '', description: '', deadline: '' });
    setSubTasks([{ name: '', difficulty: 50, importance: 50 }]);
    setSelectedDeadline(null);
    setIsProjectView(false);
  };

  const handleOutsideClick = (e) => {
    if (e.target.id === 'newtask-form') {
      handleClose();
    }
  };

  const toggleCollaborative = () => {
    updateFormState('collaborative', !formState.collaborative);
  };

  const handleDeadlineClick = (days, buttonType) => {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    if (isProjectView) {
      setProjectForm(prev => ({...prev, deadline: formattedDate}));
    } else {
      updateFormState('deadline', formattedDate);
    }
    setSelectedDeadline(buttonType);
  };

  const addSubTask = () => {
    setSubTasks([...subTasks, {
      name: '',
      difficulty: 50,
      importance: 50,
    }]);
  };

  const removeSubTask = (index) => {
    setSubTasks(subTasks.filter((_, i) => i !== index));
  };

  const updateSubTask = (index, field, value) => {
    const updatedTasks = [...subTasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setSubTasks(updatedTasks);
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
          onSubmit={isProjectView ? handleProjectSubmit : handleSubmit}
          className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl"
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
                    ${!isProjectView 
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
                    ${isProjectView 
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
                <span className="text-red-600 dark:text-red-400 text-lg">×</span>
              </button>
            </div>

            {isProjectView ? (
              // Project View Form
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
                    onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                             dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 
                             placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                {/* Project Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    placeholder="Add some details about this project..."
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
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
                               ${selectedDeadline === 'tomorrow'
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
                               ${selectedDeadline === 'dayAfter'
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
                               ${selectedDeadline === 'nextWeek'
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
                      setProjectForm({...projectForm, deadline: e.target.value});  
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
                          Task {index + 1} <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {(
                              (parseInt(task.difficulty) + parseInt(task.importance) + 20) * 5 + 
                              parseInt(parseInt(task.difficulty) * parseInt(task.importance) / 20)
                            )} XP
                          </span>
                          {subTasks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSubTask(index)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center 
                                       hover:bg-red-500/10 transition-colors"
                            >
                              <span className="text-red-600 dark:text-red-400 text-lg">×</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Subtask name"
                        value={task.name}
                        onChange={(e) => updateSubTask(index, 'name', e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                                 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 
                                 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <CustomSlider
                            value={task.difficulty}
                            onChange={(value) => updateSubTask(index, 'difficulty', value)}
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
                            onChange={(value) => updateSubTask(index, 'importance', value)}
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

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full px-3 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 
                           font-bold text-lg border-3 border-gray-800 dark:border-gray-200 
                           shadow-[4px_4px_#77dd77] hover:shadow-none 
                           hover:translate-x-1 hover:translate-y-1 transition-all duration-200 rounded-none"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>✨</span>
                    <span>Create Project</span>
                    <span className="text-sm opacity-75">(Enter ↵)</span>
                  </div>
                </button>
              </div>
            ) : (
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
                               ${selectedDeadline === 'tomorrow'
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
                               ${selectedDeadline === 'dayAfter'
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
                               ${selectedDeadline === 'nextWeek'
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
                    min={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
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
                        onClick={toggleCollaborative}
                        className={`flex-[1.2] px-3 py-2 rounded-lg border transition-all duration-200
                          ${formState.collaborative 
                            ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800' 
                            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                          }`}
                      >
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {formState.collaborative ? '👥 Team Task' : '👤 Solo Task'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formState.collaborative ? '+150 XP Bonus' : 'Base XP'}
                        </div>
                      </button>

                      <div className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total XP</div>
                        <div className="text-lg font-bold text-gray-700 dark:text-gray-200">
                          {(
                            (parseInt(formState.difficulty) + parseInt(formState.importance) + 20) * 5 + 
                            parseInt(parseInt(formState.difficulty) * parseInt(formState.importance) / 20) +
                            (formState.collaborative ? 150 : 0)
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full px-3 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 
                             font-bold text-lg border-3 border-gray-800 dark:border-gray-200 
                             shadow-[4px_4px_#77dd77] hover:shadow-none 
                             hover:translate-x-1 hover:translate-y-1 transition-all duration-200 rounded-none"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <span>✨</span>
                      <span>Create New Task</span>
                      <span className="text-sm opacity-75">(Enter ↵)</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;