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

  const calculateEarlyBonus = (deadline) => {
    if (!deadline) return 0;
    
    // Normalize both dates to UTC midnight for fair comparison
    const deadlineDate = new Date(deadline + 'T23:59:59');
    const completionDate = new Date();
    
    // Normalize both dates to remove time portion
    const normalizedDeadline = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
    const normalizedCompletion = new Date(completionDate.getFullYear(), completionDate.getMonth(), completionDate.getDate());
    
    // Calculate days difference
    const daysDiff = Math.floor((normalizedDeadline - normalizedCompletion) / (1000 * 60 * 60 * 24));
    
    // Adjust the comparison to consider same-day completion as 1 day early
    if (daysDiff < 0) return 0;  // Only if completed after deadline
    
    // Bonus calculation (adjusted):
    // Same day or 1 day early: 50 XP
    // 2-4 days early: 100 XP
    // 5+ days early: 200 XP
    if (daysDiff >= 5) return 200;
    if (daysDiff >= 2) return 100;
    if (daysDiff >= 0) return 50;  // includes same-day completion
    return 0;
  };

  const calculateOverduePenalty = (deadline) => {
    if (!deadline) return 0;
    const now = new Date();
    const deadlineDate = new Date(deadline + 'T23:59:59');
    return now > deadlineDate ? -5 : 0; // -5 XP penalty for overdue tasks
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