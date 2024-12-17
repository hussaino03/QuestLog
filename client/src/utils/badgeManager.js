import { BADGES } from '../components/Badge/BadgeGrid';

export const checkBadgeUnlocks = (level, streak = 0, completedTasksCount = 0, completedTasks = []) => {
  const unlockedBadges = [];

  Object.values(BADGES).forEach(badge => {
    if (badge.level && level >= badge.level) {
      unlockedBadges.push(badge.id);
    }
    if (badge.streakRequired && streak >= badge.streakRequired) {
      unlockedBadges.push(badge.id);
    }
    if (badge.tasksRequired && completedTasksCount >= badge.tasksRequired) {
      unlockedBadges.push(badge.id);
    }

    if (badge.earlyCompletions) {
      const earlyCount = completedTasks.filter(task => {
        const completedDate = new Date(task.completedAt);
        const deadline = new Date(task.deadline);
        return completedDate < deadline;
      }).length;
      if (earlyCount >= badge.earlyCompletions) {
        unlockedBadges.push(badge.id);
      }
    }

    if (badge.nightCompletions) {
      const nightCount = completedTasks.filter(task => {
        const completedHour = new Date(task.completedAt).getHours();
        return completedHour >= 22 || completedHour <= 4;
      }).length;
      if (nightCount >= badge.nightCompletions) {
        unlockedBadges.push(badge.id);
      }
    }

    if (badge.tasksPerDay) {
      const tasksPerDayMap = completedTasks.reduce((acc, task) => {
        const date = new Date(task.completedAt).toDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      if (Object.values(tasksPerDayMap).some(count => count >= badge.tasksPerDay)) {
        unlockedBadges.push(badge.id);
      }
    }

    if (badge.weekendCompletions) {
      const weekendCount = completedTasks.filter(task => {
        const day = new Date(task.completedAt).getDay();
        return day === 0 || day === 6; // Sunday or Saturday
      }).length;
      if (weekendCount >= badge.weekendCompletions) {
        unlockedBadges.push(badge.id);
      }
    }

    if (badge.exactDeadlines) {
      const exactCount = completedTasks.filter(task => {
        const completedDate = new Date(task.completedAt);
        const deadline = new Date(task.deadline);
        return Math.abs(completedDate - deadline) < 1000 * 60 * 60; 
      }).length;
      if (exactCount >= badge.exactDeadlines) {
        unlockedBadges.push(badge.id);
      }
    }
  });

  return [...new Set(unlockedBadges)];
};