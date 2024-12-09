import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = process.env.REACT_APP_PROD || 'http://localhost:3001/api';

export const addTask = async (taskData, tasks, userId, getTotalXP, level, completedTasks) => {
  try {
    const tasksToAdd = Array.isArray(taskData) ? taskData : [taskData];
    
    const newTasks = tasksToAdd.map(task => ({
      ...task,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    }));
    
    const updatedTasks = [...tasks, ...newTasks];

    if (userId) {
      // For authenticated users, only update server
      await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', 
        body: JSON.stringify({
          xp: getTotalXP(),
          level: level,
          tasksCompleted: completedTasks.length,
          tasks: updatedTasks,
          completedTasks: completedTasks
        }),
      });
    } else {
      // For unauthenticated users, use localStorage
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    }
    return updatedTasks;
  } catch (error) {
    throw error;
  }
};

export const completeTask = async (task, tasks, completedTasks, userId, getTotalXP, level, calculateXP) => {
  try {
    const updatedTasks = tasks.filter(t => t.id !== task.id);
    const completedTask = {
      ...task,
      completedAt: new Date().toISOString()
    };
    const updatedCompletedTasks = [...completedTasks, completedTask];
    
    // Calculate XP with penalty handled internally by calculateXP
    const xpResult = calculateXP(task.experience, task.deadline);
    
    // Store the early bonus and overdue penalty for record keeping
    completedTask.earlyBonus = xpResult.earlyBonus;
    completedTask.overduePenalty = xpResult.overduePenalty;

    if (userId) {
      // For authenticated users, only update server
      await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          xp: getTotalXP(),
          level: level,
          tasksCompleted: updatedCompletedTasks.length,
          tasks: updatedTasks,
          completedTasks: updatedCompletedTasks
        }),
      });
    } else {
      // For unauthenticated users, use localStorage
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      localStorage.setItem('completedtasks', JSON.stringify(updatedCompletedTasks));
    }
    return { updatedTasks, updatedCompletedTasks };
  } catch (error) {
    throw error;
  }
};

export const removeTask = async (taskId, isCompleted, tasks, completedTasks, userId, getTotalXP, level, calculateXP) => {
  try {
    let updatedTasks = tasks;
    let updatedCompletedTasks = completedTasks;

    if (isCompleted) {
      const taskToRemove = completedTasks.find(t => t.id === taskId);
      if (taskToRemove) {
        let totalXPToRemove = taskToRemove.experience;
        if (taskToRemove.earlyBonus) totalXPToRemove += taskToRemove.earlyBonus;
        if (taskToRemove.overduePenalty) totalXPToRemove += taskToRemove.overduePenalty;
        calculateXP(-totalXPToRemove);
      }
      
      updatedCompletedTasks = completedTasks.filter(t => t.id !== taskId);
      if (!userId) {
        localStorage.setItem('completedtasks', JSON.stringify(updatedCompletedTasks));
      }
    } else {
      updatedTasks = tasks.filter(t => t.id !== taskId);
      if (!userId) {
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      }
    }

    if (userId) {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          xp: getTotalXP(),
          level,
          tasksCompleted: updatedCompletedTasks.length,
          tasks: updatedTasks,
          completedTasks: updatedCompletedTasks
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user data: ${response.status}`);
      }
    }
    return { updatedTasks, updatedCompletedTasks };
  } catch (error) {
    throw error;
  }
};

export const updateTask = async (taskId, updatedTask, tasks, completedTasks, userId) => {
  try {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? updatedTask : task
    );
    
    if (!userId) {
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } else {
      await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tasks: updatedTasks,
          completedTasks
        }),
      });
    }
    return updatedTasks;
  } catch (error) {
    throw error;
  }
};

export const clearAllData = async (userId) => {
  if (!userId) {
    localStorage.removeItem('tasks');
    localStorage.removeItem('completedtasks');
    localStorage.removeItem('totalExperience');
  } else {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          xp: 0,
          level: 1,
          tasksCompleted: 0,
          tasks: [],
          completedTasks: []
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to reset user data: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }
};