import { useState, useEffect } from 'react';

const API_BASE_URL = 'https://smart-list-hjea.vercel.app/api';

const useXPManager = () => {
  const [level, setLevel] = useState(() => {
    const savedLevel = localStorage.getItem('level');
    return savedLevel ? parseInt(savedLevel) : 1;
  });

  const [experience, setExperience] = useState(() => {
    const savedExperience = localStorage.getItem('experience');
    return savedExperience ? parseInt(savedExperience) : 0;
  });

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(level);

  useEffect(() => {
    localStorage.setItem('level', level.toString());
    localStorage.setItem('experience', experience.toString());
  }, [level, experience]);

  const calculateXP = (taskExperience) => {
    let newExperience = experience + taskExperience;
    let currentLevel = level;
    let didLevelUp = false;

    while (newExperience >= currentLevel * 200) {
      newExperience -= currentLevel * 200;
      currentLevel += 1;
      didLevelUp = true;
    }

    if (didLevelUp) {
      setLevel(currentLevel);
      setNewLevel(currentLevel);
      setShowLevelUp(true);
    }
    
    setExperience(newExperience);

    return {
      newExperience,
      currentLevel,
      didLevelUp,
      totalExperience: getTotalXP() + taskExperience
    };
  };
  const syncWithServer = async (authToken) => {
    if (!authToken) return null;
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: localStorage.getItem('sessionId'),
          xp: getTotalXP(),
          level,
          tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
          completedTasks: JSON.parse(localStorage.getItem('completedtasks') || '[]'),
          authToken
        }),
      });

      if (!response.ok) throw new Error('Failed to sync with server');
      
      const serverData = await response.json();
      return serverData;
    } catch (error) {
      console.error('Sync error:', error);
      return null;
    }
  };

  const getTotalXP = () => {
    let totalXP = 0;
    for (let i = 1; i < level; i++) {
      totalXP += i * 200;
    }
    totalXP += experience;
    return totalXP;
  };

  const resetXP = () => {
    setLevel(1);
    setExperience(0);
    setNewLevel(1);
    setShowLevelUp(false);
    return {
      level: 1,
      experience: 0,
      totalExperience: 0
    };
  };

  return {
    syncWithServer,
    level,
    experience,
    showLevelUp,
    newLevel,
    calculateXP,
    resetXP,
    setShowLevelUp,
    getTotalXP
  };
};

export default useXPManager;