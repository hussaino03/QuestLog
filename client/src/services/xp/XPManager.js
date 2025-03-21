import { useState } from 'react';

const useXPManager = () => {
  const [totalExperience, setTotalExperience] = useState(0);
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

    const normalizedDeadline = new Date(
      deadlineDate.getFullYear(),
      deadlineDate.getMonth(),
      deadlineDate.getDate()
    );
    const normalizedCompletion = new Date(
      completionDate.getFullYear(),
      completionDate.getMonth(),
      completionDate.getDate()
    );

    const daysDiff = Math.floor(
      (normalizedDeadline - normalizedCompletion) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff < 0) return 0;

    if (daysDiff >= 5) return 200;
    if (daysDiff >= 2) return 100;
    if (daysDiff >= 0) return 50;
    return 0;
  };

  const calculateOverduePenalty = (deadline) => {
    if (!deadline) return 0;

    const [year, month, day] = deadline.split('-').map(Number);
    const now = new Date();

    // Use UTC to avoid timezone issues
    const normalizedDeadline =
      Date.UTC(year, month - 1, day) / (1000 * 60 * 60 * 24);
    const normalizedNow =
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) /
      (1000 * 60 * 60 * 24);

    const daysOverdue = Math.floor(normalizedNow - normalizedDeadline);
    return daysOverdue > 0 ? -5 * daysOverdue : 0;
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

  const calculateBaseXP = (difficulty, importance, urgent = false) => {
    return (parseInt(difficulty) + parseInt(importance) + 20) * 5 +
      parseInt((parseInt(difficulty) * parseInt(importance)) / 20) +
      (urgent ? 150 : 0);
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
    calculateBaseXP,
    setTotalExperience: (xp) => {
      setTotalExperience(xp);
    }
  };
};

export default useXPManager;
