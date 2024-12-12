import { BADGES } from '../components/Badge/BadgeGrid';

export const checkBadgeUnlocks = (level, streak = 0, completedTasksCount = 0) => {
  const unlockedBadges = [];

  // Check level-based badges
  Object.values(BADGES).forEach(badge => {
    if (badge.level && level >= badge.level) {
      unlockedBadges.push(badge.id);
    }
    // Check streak badge
    if (badge.streakRequired && streak >= badge.streakRequired) {
      unlockedBadges.push(badge.id);
    }
    // Check completed tasks badge
    if (badge.tasksRequired && completedTasksCount >= badge.tasksRequired) {
      unlockedBadges.push(badge.id);
    }
  });

  return [...new Set(unlockedBadges)];
};