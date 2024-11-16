import { useState, useEffect } from 'react';

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