import { v4 as uuidv4 } from 'uuid';
import { startConfetti } from '../../utils/other/confettiUtils';

class TaskManager {
  constructor(calculateXP, setTasks, setCompletedTasks, setError, badgeManager = null) {
    this.calculateXP = calculateXP;
    this.setTasks = setTasks;
    this.setCompletedTasks = setCompletedTasks;
    this.setError = setError;
    this.badgeManager = badgeManager;
  }

  handleError(error, message) {
    console.error(message, error);
    this.setError(error.message);
  }

  addTask = async (taskData) => {
    try {
      const tasksToAdd = Array.isArray(taskData) ? taskData : [taskData];

      const newTasks = tasksToAdd.map((task) => ({
        ...task,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        label: task.label || null
      }));

      this.setTasks((currentTasks) => [...currentTasks, ...newTasks]);
    } catch (error) {
      this.handleError(error, 'Error adding task:');
    }
  };

  completeTask = async (task) => {
    try {
      startConfetti();
      this.setTasks((currentTasks) =>
        currentTasks.filter((t) => t.id !== task.id)
      );

      const completedTask = {
        ...task,
        completedAt: new Date().toISOString() // Store UTC timestamp
      };

      const xpResult = this.calculateXP(task.experience, task.deadline);
      completedTask.earlyBonus = xpResult.earlyBonus;
      completedTask.overduePenalty = xpResult.overduePenalty;

      // Update completed tasks and check for badges
      this.setCompletedTasks((prev) => {
        const updatedTasks = [...prev, completedTask];
        if (this.badgeManager) {
          this.badgeManager.checkForNewBadges(
            undefined, 
            undefined, 
            updatedTasks 
          );
        }
        return updatedTasks;
      });
    } catch (error) {
      this.handleError(error, 'Error completing task:');
    }
  };

  removeTask = (taskId, isCompleted) => {
    try {
      if (isCompleted) {
        this.setCompletedTasks((prev) => {
          const taskToRemove = prev.find((t) => t.id === taskId);
          if (taskToRemove) {
            let totalXPToRemove = taskToRemove.experience;
            if (taskToRemove.earlyBonus)
              totalXPToRemove += taskToRemove.earlyBonus;
            if (taskToRemove.overduePenalty)
              totalXPToRemove += taskToRemove.overduePenalty;
            this.calculateXP(-totalXPToRemove);
          }
          return prev.filter((t) => t.id !== taskId);
        });
      } else {
        this.setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch (error) {
      this.handleError(error, 'Error removing task:');
    }
  };

  updateTask = async (taskId, updatedTask) => {
    try {
      // First check if this is a shared project update
      if (updatedTask.isShared) {
        const baseUrl = process.env.REACT_APP_PROD || 'http://localhost:3001/api';
        
        // Sync the update with server first
        const response = await fetch(
          `${baseUrl}/collaboration/projects/${taskId}/details`,
          {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[UPDATE-TASK] Server error:', errorText);
          throw new Error(`Failed to sync project update: ${response.status}`);
        }
      }

      // Update local state after successful sync (or if not shared)
      this.setTasks((currentTasks) =>
        currentTasks.map((task) => {
          if (task.id === taskId) {
            return { ...task, ...updatedTask };
          }
          return task;
        })
      );
    } catch (error) {
      this.handleError(error, '[UPDATE-TASK] Error updating task:');
      throw error; // Re-throw to let caller handle the error
    }
  };

  async joinProject(shareCode) {
    try {
      const baseUrl = process.env.REACT_APP_PROD || 'http://localhost:3001/api';
      const response = await fetch(`${baseUrl}/collaboration/projects/${shareCode}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        return false;
      }

      const project = await response.json();
      
      this.setTasks(currentTasks => {
        const exists = currentTasks.some(t => t.id === project.id);
        if (!exists) {
          return [...currentTasks, project];
        }
        return currentTasks;
      });

      return true;
    } catch (error) {
      console.error('[JOIN] Error joining project:', error);
      return false;
    }
  }

  startProjectSync(taskId) {
    console.log(`[SYNC] Starting sync for project: ${taskId}`);
    let syncAttempts = 0;
    const maxAttempts = 3;
    
    const syncInterval = setInterval(async () => {
      try {
        console.log(`[SYNC] Polling updates for project ${taskId}`);
        const baseUrl = process.env.REACT_APP_PROD || 'http://localhost:3001/api';
        const url = `${baseUrl}/collaboration/projects/${taskId}`;
        console.log(`[SYNC] Making request to: ${url}`);

        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          syncAttempts++;
          const errorText = await response.text();
          console.error(`[SYNC] Server error response (attempt ${syncAttempts}/${maxAttempts}):`, errorText);
          
          if (syncAttempts >= maxAttempts) {
            console.error(`[SYNC] Max retry attempts reached for project ${taskId}`);
            clearInterval(syncInterval);
            return;
          }
          
          throw new Error(`Failed to sync project: ${response.status}`);
        }

        // Reset attempts on successful response
        syncAttempts = 0;

        const rawResponse = await response.text();
        console.log('[SYNC] Raw server response:', rawResponse);

        let project;
        try {
          project = JSON.parse(rawResponse);
        } catch (e) {
          console.error('[SYNC] Failed to parse response as JSON:', e);
          throw new Error('Invalid response format from server');
        }

        console.log(`[SYNC] Received project update:`, project);
        
        // Update the task in state if it exists and has changed
        this.setTasks(currentTasks => {
          const taskIndex = currentTasks.findIndex(t => t.id === taskId);
          if (taskIndex === -1) {
            console.log(`[SYNC] Task ${taskId} not found in current tasks`);
            return currentTasks;
          }
          
          const currentTask = currentTasks[taskIndex];
          if (JSON.stringify(currentTask) === JSON.stringify(project)) {
            console.log(`[SYNC] No changes detected for project ${taskId}`);
            return currentTasks;
          }
          
          console.log(`[SYNC] Updating local state for project ${taskId}`);
          const newTasks = [...currentTasks];
          newTasks[taskIndex] = project;
          return newTasks;
        });
        
      } catch (error) {
        console.error('[SYNC] Project sync error:', error);
      }
    }, 5000);

    return () => {
      console.log(`[SYNC] Stopping sync for project ${taskId}`);
      clearInterval(syncInterval);
    };
  }
}

export default TaskManager;
