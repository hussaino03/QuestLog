import { useState, useEffect } from 'react';

const useXPManager = () => {
  // Only track total accumulated XP, calculate level and current experience from this
  const [totalExperience, setTotalExperience] = useState(() => {
    const savedTotalXP = localStorage.getItem('totalExperience');
    return savedTotalXP ? parseInt(savedTotalXP) : 0;
  });

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  // Calculate current level and experience within that level based on total XP
  const calculateLevelAndExperience = (xp) => {
    let remainingXP = xp;
    let currentLevel = 1;
    
    // Keep subtracting XP requirements until we can't level up anymore
    while (remainingXP >= currentLevel * 200) {
      remainingXP -= currentLevel * 200;
      currentLevel += 1;
    }
    
    return {
      level: currentLevel,
      experience: remainingXP
    };
  };

  // Derived values from totalExperience
  const { level, experience } = calculateLevelAndExperience(totalExperience);

  // Save only totalExperience to localStorage
  useEffect(() => {
    localStorage.setItem('totalExperience', totalExperience.toString());
  }, [totalExperience]);

  const calculateXP = (taskExperience) => {
    const newTotalXP = totalExperience + taskExperience;
    const currentStats = calculateLevelAndExperience(totalExperience);
    const newStats = calculateLevelAndExperience(newTotalXP);
    
    // Check if leveled up
    if (newStats.level > currentStats.level) {
      setNewLevel(newStats.level);
      setShowLevelUp(true);
    }
    
    setTotalExperience(newTotalXP);
    
    return {
      newExperience: newStats.experience,
      currentLevel: newStats.level,
      didLevelUp: newStats.level > currentStats.level,
      totalExperience: newTotalXP
    };
  };

  const resetXP = () => {
    setTotalExperience(0);
    setNewLevel(1);
    setShowLevelUp(false);
    
    return {
      level: 1,
      experience: 0,
      totalExperience: 0
    };
  };

  const getTotalXP = () => totalExperience;

  // Calculate XP needed for next level
  const getXPForNextLevel = () => level * 200;

  // Calculate progress percentage within current level
  const getLevelProgress = () => {
    const xpNeeded = getXPForNextLevel();
    return (experience / xpNeeded) * 100;
  };

  return {
    level,
    experience,
    totalExperience,
    showLevelUp,
    newLevel,
    calculateXP,
    resetXP,
    setShowLevelUp,
    getTotalXP,
    getXPForNextLevel,
    getLevelProgress
  };
};

export default useXPManager;