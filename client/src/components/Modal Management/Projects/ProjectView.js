import React, { useState, useEffect } from 'react';
import {
  formatDeadline,
  isOverdue,
  calculateOverduePenalty
} from '../../../utils/tasks/tasksUtils';
import ShareCode from './ShareCode';
import { Users, Plus, X, Dumbbell, Target } from 'lucide-react';

const ProjectView = ({
  task,
  isCompleted,
  updateTask,
  collaborationManager,
  userId
}) => {
  const [collaborators, setCollaborators] = useState([]);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtask, setNewSubtask] = useState({
    name: '',
    difficulty: 50,
    importance: 50,
    completed: false
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (task.isShared && task.sharedWith) {
      const fetchCollaborators = async () => {
        const collabData = await collaborationManager.fetchCollaboratorNames(
          task.ownerId,
          task.sharedWith
        );
        setCollaborators(collabData);
      };
      fetchCollaborators();
    }
  }, [task.isShared, task.sharedWith, task.ownerId, collaborationManager]);

  const completedSubtasks = task.subtasks.filter(
    (subtask) => subtask.completed
  ).length;
  const progress = (completedSubtasks / task.subtasks.length) * 100;

  const handleSubtaskToggleWithSync = async (index) => {
    const newCompletedState = !task.subtasks[index].completed;

    // Always sync with server if it's a shared project, regardless of owner/collaborator
    if (task.isShared) {
      try {
        console.log(
          `[SERVER] Syncing subtask ${index} to ${newCompletedState}`
        );
        await collaborationManager.updateSharedProjectSubtask(
          task.id,
          index,
          newCompletedState
        );
      } catch (error) {
        console.error('[ERROR] Failed to sync subtask update:', error);
        return; // Don't update local state if server sync fails
      }
    }

    // Update local state only after successful sync (or if not shared)
    updateTask(task.id, {
      ...task,
      subtasks: task.subtasks.map((subtask, i) =>
        i === index ? { ...subtask, completed: newCompletedState } : subtask
      )
    });
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.name.trim()) {
      setError('Task name is required');
      return;
    }

    const updatedTask = {
      ...task,
      subtasks: [...task.subtasks, newSubtask],
      experience: task.experience + calculateSubtaskXP(newSubtask)
    };

    try {
      if (task.isShared) {
        // Sync with server first
        await collaborationManager.updateSharedProjectDetails(
          task.id,
          updatedTask
        );
      }

      // Update local state after successful sync (or if not shared)
      updateTask(task.id, updatedTask);
      setNewSubtask({
        name: '',
        difficulty: 50,
        importance: 50,
        completed: false
      });
      setShowAddSubtask(false);
      setError('');
    } catch (error) {
      console.error('[ERROR] Failed to add subtask:', error);
      setError('Failed to add subtask. Please try again.');
    }
  };

  const calculateSubtaskXP = (subtask) => {
    return (
      (parseInt(subtask.difficulty) + parseInt(subtask.importance) + 20) * 5 +
      parseInt(
        (parseInt(subtask.difficulty) * parseInt(subtask.importance)) / 20
      )
    );
  };

  const renderAddSubtaskInterface = () => {
    if (!showAddSubtask) {
      return (
        <button
          onClick={() => setShowAddSubtask(true)}
          className="w-full py-2 flex items-center justify-center gap-2 
                   text-sm text-gray-500 dark:text-gray-400
                   hover:bg-gray-50 dark:hover:bg-gray-700/50 
                   rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subtask</span>
        </button>
      );
    }

    return (
      <div className="p-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Task Name Input */}
          <div className="flex-1 w-full sm:w-auto">
            <input
              type="text"
              placeholder="New subtask name"
              value={newSubtask.name}
              onChange={(e) => {
                setNewSubtask({ ...newSubtask, name: e.target.value });
                setError('');
              }}
              className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 
                       border border-gray-300 dark:border-gray-600 
                       rounded-lg text-sm text-gray-900 dark:text-gray-200"
            />
            {error && (
              <p className="absolute text-xs text-red-600 dark:text-red-400 mt-1">
                {error}
              </p>
            )}
          </div>

          {/* Mobile: Single Combined Slider */}
          <div className="sm:hidden w-full bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              <input
                type="range"
                min="0"
                max="100"
                value={
                  (parseInt(newSubtask.difficulty) +
                    parseInt(newSubtask.importance)) /
                  2
                }
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setNewSubtask({
                    ...newSubtask,
                    difficulty: value,
                    importance: value
                  });
                }}
                className="flex-1 h-1 appearance-none bg-gray-200 dark:bg-gray-700 rounded-full
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 
                         [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:bg-blue-500 dark:[&::-webkit-slider-thumb]:bg-blue-400"
              />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 min-w-[32px] text-right">
                {calculateSubtaskXP(newSubtask)}xp
              </span>
            </div>
          </div>

          {/* Desktop: Separate Sliders */}
          <div className="hidden sm:flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 px-3 rounded-lg w-[300px] h-[34px]">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              <input
                type="range"
                min="0"
                max="100"
                value={newSubtask.difficulty}
                onChange={(e) =>
                  setNewSubtask({
                    ...newSubtask,
                    difficulty: Number(e.target.value)
                  })
                }
                className="w-16 h-1 appearance-none bg-gray-200 dark:bg-gray-700 rounded-full
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 
                         [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:bg-blue-500 dark:[&::-webkit-slider-thumb]:bg-blue-400"
              />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 w-4 text-right">
                {Math.round(newSubtask.difficulty / 10)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              <input
                type="range"
                min="0"
                max="100"
                value={newSubtask.importance}
                onChange={(e) =>
                  setNewSubtask({
                    ...newSubtask,
                    importance: Number(e.target.value)
                  })
                }
                className="w-16 h-1 appearance-none bg-gray-200 dark:bg-gray-700 rounded-full
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 
                         [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:bg-blue-500 dark:[&::-webkit-slider-thumb]:bg-blue-400"
              />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 w-4 text-right">
                {Math.round(newSubtask.importance / 10)}
              </span>
            </div>

            <div className="ml-1 flex items-center">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {calculateSubtaskXP(newSubtask)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleAddSubtask}
              className="flex-1 sm:flex-initial p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 
                       text-blue-600 dark:text-blue-400 transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setShowAddSubtask(false);
                setError('');
              }}
              className="flex-1 sm:flex-initial p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 
                       text-red-600 dark:text-red-400 transition-colors flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    let cleanup;
    if (task.isShared) {
      // Start syncing the project
      cleanup = collaborationManager.startProjectSync(task.id);
    }
    return () => {
      if (cleanup) cleanup();
    };
  }, [task.id, task.isShared, collaborationManager]);

  return (
    <div className="space-y-4">
      {/* Progress Bar and Share Button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            Progress
          </span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {completedSubtasks}/{task.subtasks.length}
            </span>
          </div>
        </div>
        <ShareCode
          taskId={task.id}
          collaborationManager={collaborationManager}
          task={task}
          userId={userId}
        />
      </div>

      {/* Collaborators Section */}
      {task.isShared && (
        <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>Collaborators</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="px-2 py-1 rounded-full text-xs
                  bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
              >
                {collaborator.name}
                {collaborator.isOwner && <span className="ml-1">👑</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description Section */}
      {task.desc && (
        <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {task.desc}
          </p>
        </div>
      )}

      {/* Subtasks List with Add Button */}
      <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {task.subtasks.map((subtask, index) => (
            <div
              key={index}
              className={`p-3 transition-colors ${
                subtask.completed
                  ? 'bg-gray-50 dark:bg-gray-800/50'
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {!isCompleted && (
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="peer h-4 w-4 appearance-none rounded border border-gray-300 
                               dark:border-gray-600 bg-white dark:bg-gray-700 
                               checked:bg-blue-500 dark:checked:bg-blue-400
                               focus:outline-none focus:ring-2 focus:ring-blue-500/20
                               transition-all duration-200"
                      checked={subtask.completed || false}
                      onChange={() => handleSubtaskToggleWithSync(index)}
                    />
                    <div className="absolute inset-0 pointer-events-none">
                      <div
                        className="absolute top-1/2 w-full border-t border-white dark:border-gray-900
                                    opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                      />
                    </div>
                  </div>
                )}
                <span
                  className={`text-sm ${
                    subtask.completed || isCompleted
                      ? 'text-gray-400 dark:text-gray-500 line-through'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {subtask.name}
                </span>
              </div>
            </div>
          ))}

          {/* Subtask Interface */}
          {!isCompleted && renderAddSubtaskInterface()}
        </div>
      </div>

      {/* Task Info Footer */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 pt-2">
        {task.deadline && (
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>
              Due: {formatDeadline(task.deadline)}
              {isOverdue(task.deadline) && !isCompleted && (
                <span className="text-red-500 ml-1">
                  ({calculateOverduePenalty(task.deadline)}xp)
                </span>
              )}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span>⭐</span>
          <span>
            {task.experience}xp
            {isCompleted && task.earlyBonus > 0 && (
              <span className="text-green-600 dark:text-green-400">
                {` + ${task.earlyBonus}xp early bonus!`}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
