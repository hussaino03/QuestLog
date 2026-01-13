import { BADGES } from '../../components/Badge/BadgeGrid';

/**
 * Calculate progress percentage for a specific badge
 *
 * @param {Object} badge - Badge object with requirements
 * @param {number} level - Current user level
 * @param {number} streak - Current streak count
 * @param {number} completedTasksCount - Total completed tasks
 * @param {Array} completedTasks - Array of task objects with completion details
 * @returns {number} Progress percentage (0-100)
 */
export const calculateBadgeProgress = (
  badge,
  level = 0,
  streak = 0,
  completedTasksCount = 0,
  completedTasks = []
) => {
  // Level-based badges
  if (badge.level) {
    return Math.min((level / badge.level) * 100, 100);
  }

  // Streak-based badges
  if (badge.streakRequired) {
    return Math.min((streak / badge.streakRequired) * 100, 100);
  }

  // Task count badges
  if (badge.tasksRequired) {
    return Math.min((completedTasksCount / badge.tasksRequired) * 100, 100);
  }

  // Early completion badges
  if (badge.earlyCompletions) {
    const earlyCount = completedTasks.filter((task) => {
      const completedDate = new Date(task.completedAt);
      const deadline = new Date(task.deadline);
      return completedDate < deadline;
    }).length;
    return Math.min((earlyCount / badge.earlyCompletions) * 100, 100);
  }

  // Night owl badges (10 PM - 4 AM)
  if (badge.nightCompletions) {
    const nightCount = completedTasks.filter((task) => {
      const completedHour = new Date(task.completedAt).getHours();
      return completedHour >= 22 || completedHour <= 4;
    }).length;
    return Math.min((nightCount / badge.nightCompletions) * 100, 100);
  }

  // Daily achievement badges
  if (badge.tasksPerDay) {
    const tasksPerDayMap = completedTasks.reduce((acc, task) => {
      const date = new Date(task.completedAt).toDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    const maxTasksInDay = Math.max(...Object.values(tasksPerDayMap), 0);
    return Math.min((maxTasksInDay / badge.tasksPerDay) * 100, 100);
  }

  // Weekend warrior badges
  if (badge.weekendCompletions) {
    const weekendCount = completedTasks.filter((task) => {
      const day = new Date(task.completedAt).getDay();
      return day === 0 || day === 6;
    }).length;
    return Math.min((weekendCount / badge.weekendCompletions) * 100, 100);
  }

  // Deadline precision badges
  if (badge.exactDeadlines) {
    const exactCount = completedTasks.filter((task) => {
      const completedDate = new Date(task.completedAt);
      const deadline = new Date(task.deadline);
      return Math.abs(completedDate - deadline) < 1000 * 60 * 60;
    }).length;
    return Math.min((exactCount / badge.exactDeadlines) * 100, 100);
  }

  return 0;
};

/**
 * Badge Unlock Manager
 * Checks various achievement conditions and returns unlocked badge IDs
 *
 * Handles multiple badge types:
 * - Level-based badges
 * - Streak-based achievements
 * - Task completion milestones
 * - Time-sensitive completions (early/night/weekend)
 * - Daily completion challenges
 * - Precision timing achievements
 *
 * @param {number} level - Current user level
 * @param {number} streak - Current streak count
 * @param {number} completedTasksCount - Total completed tasks
 * @param {Array} completedTasks - Array of task objects with completion details
 * @returns {Array} Array of unlocked badge IDs
 */
export const checkBadgeUnlocks = (
  level,
  streak = 0,
  completedTasksCount = 0,
  completedTasks = []
) => {
  const unlockedBadges = [];

  Object.values(BADGES).forEach((badge) => {
    // Level achievements
    if (badge.level && level >= badge.level) {
      unlockedBadges.push(badge.id);
    }

    // Streak achievements
    if (badge.streakRequired && streak >= badge.streakRequired) {
      unlockedBadges.push(badge.id);
    }

    // Task count achievements
    if (badge.tasksRequired && completedTasksCount >= badge.tasksRequired) {
      unlockedBadges.push(badge.id);
    }

    // Early completion badges
    if (badge.earlyCompletions) {
      const earlyCount = completedTasks.filter((task) => {
        const completedDate = new Date(task.completedAt);
        const deadline = new Date(task.deadline);
        return completedDate < deadline;
      }).length;
      if (earlyCount >= badge.earlyCompletions) {
        unlockedBadges.push(badge.id);
      }
    }

    // Night owl badges (10 PM - 4 AM)
    if (badge.nightCompletions) {
      const nightCount = completedTasks.filter((task) => {
        const completedHour = new Date(task.completedAt).getHours();
        return completedHour >= 22 || completedHour <= 4;
      }).length;
      if (nightCount >= badge.nightCompletions) {
        unlockedBadges.push(badge.id);
      }
    }

    // Daily achievement badges
    if (badge.tasksPerDay) {
      const tasksPerDayMap = completedTasks.reduce((acc, task) => {
        const date = new Date(task.completedAt).toDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      if (
        Object.values(tasksPerDayMap).some(
          (count) => count >= badge.tasksPerDay
        )
      ) {
        unlockedBadges.push(badge.id);
      }
    }

    // Weekend warrior badges
    if (badge.weekendCompletions) {
      const weekendCount = completedTasks.filter((task) => {
        const day = new Date(task.completedAt).getDay();
        return day === 0 || day === 6; // Sunday or Saturday
      }).length;
      if (weekendCount >= badge.weekendCompletions) {
        unlockedBadges.push(badge.id);
      }
    }

    // Deadline precision badges (within 1 hour)
    if (badge.exactDeadlines) {
      const exactCount = completedTasks.filter((task) => {
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
