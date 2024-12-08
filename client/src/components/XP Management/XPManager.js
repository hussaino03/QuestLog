import { useState, useEffect } from 'react';

const useXPManager = (isAuthenticated) => {
  const [totalExperience, setTotalExperience] = useState(() => {
    if (!isAuthenticated) {
      const savedTotalXP = localStorage.getItem('totalExperience');
      return savedTotalXP ? parseInt(savedTotalXP) : 0;
    }
    return 0;
  });

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  const calculateLevelAndExperience = (xp) => {
    let remainingXP = xp;
    let currentLevel = 1;
    
    while (remainingXP >= currentLevel * 200) {
      remainingXP -= currentLevel * 200;
      currentLevel += 1;
    }
    
    return {
      level: currentLevel,
      experience: remainingXP
    };
  };

  const { level, experience } = calculateLevelAndExperience(totalExperience);

  const calculateEarlyBonus = (deadline) => {
    if (!deadline) return 0;
    
    const deadlineDate = new Date(deadline + 'T23:59:59');
    const completionDate = new Date();
    
    const normalizedDeadline = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
    const normalizedCompletion = new Date(completionDate.getFullYear(), completionDate.getMonth(), completionDate.getDate());
    
    const daysDiff = Math.floor((normalizedDeadline - normalizedCompletion) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 0;
    
    if (daysDiff >= 5) return 200;
    if (daysDiff >= 2) return 100;
    if (daysDiff >= 0) return 50;
    return 0;
  };

  const calculateOverduePenalty = (deadline) => {
    if (!deadline) return 0;
    
    // Parse the deadline string into year, month, day components
    const [year, month, day] = deadline.split('-').map(Number);
    
    // Set deadline to end of the day (23:59:59)
    const deadlineDate = new Date(year, month - 1, day, 23, 59, 59);
    
    // Set current time to start of today to avoid partial days
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // If not past deadline, no penalty
    if (now <= deadlineDate) return 0;
    
    // Calculate days past deadline (add 1 since we want to include the deadline day)
    const daysPastDeadline = Math.floor((now - deadlineDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Return penalty of -5 per day
    return daysPastDeadline * -5;
  };

  const calculateXP = (taskExperience, deadline = null) => {
    const earlyBonus = calculateEarlyBonus(deadline);
    const overduePenalty = calculateOverduePenalty(deadline);
    const totalTaskXP = taskExperience + earlyBonus + overduePenalty;
    const newTotalXP = Math.max(0, totalExperience + totalTaskXP);
    
    const currentStats = calculateLevelAndExperience(totalExperience);
    const newStats = calculateLevelAndExperience(newTotalXP);
    
    if (newStats.level > currentStats.level && totalTaskXP > 0) {
      setNewLevel(newStats.level);
      setShowLevelUp(true);
    }
    
    setTotalExperience(newTotalXP);
    
    return {
      newExperience: newStats.experience,
      currentLevel: newStats.level,
      didLevelUp: newStats.level > currentStats.level && totalTaskXP > 0,
      totalExperience: newTotalXP,
      earlyBonus,
      overduePenalty
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

  const getXPForNextLevel = () => level * 200;

  const getLevelProgress = () => {
    const xpNeeded = getXPForNextLevel();
    return (experience / xpNeeded) * 100;
  };

  // Save to localStorage only if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {  
      localStorage.setItem('totalExperience', totalExperience.toString());
    }
  }, [totalExperience, isAuthenticated]);

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
    getLevelProgress,
    setTotalExperience
  };
};

export default useXPManager;