import { v4 as uuidv4 } from 'uuid';
import { validateUserId } from '../utils/validation';
import { checkBadgeUnlocks } from '../utils/badgeManager';

const API_BASE_URL = process.env.REACT_APP_PROD || 'http://localhost:3001/api';

export const initializeUser = (setTasks, setCompletedTasks, setTotalExperience) => {
  const savedTasks = localStorage.getItem('tasks');
  const savedCompletedTasks = localStorage.getItem('completedtasks');
  const savedXP = localStorage.getItem('totalExperience');

  if (savedTasks) setTasks(JSON.parse(savedTasks));
  if (savedCompletedTasks) setCompletedTasks(JSON.parse(savedCompletedTasks));
  if (savedXP) setTotalExperience(parseInt(savedXP));
};

export const updateUserData = async (userId, getTotalXP, level, completedTasks, tasks, unlockedBadges) => {
  try {
    validateUserId(userId);
    const newUnlockedBadges = checkBadgeUnlocks(level);
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        xp: getTotalXP(),
        level: level,
        tasksCompleted: completedTasks.length,
        tasks: tasks,
        completedTasks: completedTasks,
        unlockedBadges: newUnlockedBadges
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user data: ${response.status}`);
    }
    
    return newUnlockedBadges;
  } catch (error) {
    throw error;
  }
};

export const addTask = async (taskData, tasks, userId, getTotalXP, level, completedTasks) => {
  const tasksToAdd = Array.isArray(taskData) ? taskData : [taskData];
  
  const newTasks = tasksToAdd.map(task => ({
    ...task,
    id: uuidv4(),
    createdAt: new Date().toISOString()
  }));
  
  const updatedTasks = [...tasks, ...newTasks];

  if (userId) {
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
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  }

  return updatedTasks;
};

export const completeTask = async (task, tasks, completedTasks, userId, getTotalXP, level, calculateXP) => {
  const updatedTasks = tasks.filter(t => t.id !== task.id);
  const completedTask = {
    ...task,
    completedAt: new Date().toISOString()
  };
  
  const xpResult = calculateXP(task.experience, task.deadline);
  completedTask.earlyBonus = xpResult.earlyBonus;
  completedTask.overduePenalty = xpResult.overduePenalty;

  const updatedCompletedTasks = [...completedTasks, completedTask];

  if (userId) {
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
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    localStorage.setItem('completedtasks', JSON.stringify(updatedCompletedTasks));
  }

  return { updatedTasks, updatedCompletedTasks };
};

export const removeTask = async (taskId, isCompleted, tasks, completedTasks, userId, getTotalXP, level, calculateXP) => {
  let updatedTasks = tasks;
  let updatedCompletedTasks = completedTasks;
  let xpToRemove = 0;

  if (isCompleted) {
    const taskToRemove = completedTasks.find(t => t.id === taskId);
    if (taskToRemove) {
      let totalXPToRemove = taskToRemove.experience;
      if (taskToRemove.earlyBonus) totalXPToRemove += taskToRemove.earlyBonus;
      if (taskToRemove.overduePenalty) totalXPToRemove += taskToRemove.overduePenalty;
      xpToRemove = -totalXPToRemove;
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
    await fetch(`${API_BASE_URL}/users/${userId}`, {
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
  }

  return { updatedTasks, updatedCompletedTasks, xpToRemove };
};

export const updateTask = async (taskId, updatedTask, tasks, completedTasks, userId) => {
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
};

export const clearAllData = async (userId) => {
  if (!userId) {
    localStorage.removeItem('tasks');
    localStorage.removeItem('completedtasks');
    localStorage.removeItem('totalExperience');
  } else {
    await fetch(`${API_BASE_URL}/users/${userId}`, {
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
  }
};
