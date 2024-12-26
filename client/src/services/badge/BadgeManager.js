import { checkBadgeUnlocks } from '../../utils/badges/badgeUtils';
import { BADGES } from '../../components/Badge/BadgeGrid';

class BadgeManager {
  constructor(setUnlockedBadges, addNotification) {
    this.setUnlockedBadges = setUnlockedBadges;
    this.addNotification = addNotification;
    this.notifiedBadges = new Set(
      JSON.parse(localStorage.getItem('notifiedBadges') || '[]')
    );
  }

  notifyNewBadge(badgeId) {
    if (this.notifiedBadges.has(badgeId)) return;

    const badge = BADGES[badgeId.toUpperCase()];
    if (badge && this.addNotification) {
      this.addNotification(
        `🏆 New Badge Unlocked: ${badge.icon} ${badge.name}!`,
        'achievement',
        `badge_${badgeId}`
      );
      this.notifiedBadges.add(badgeId);
      localStorage.setItem(
        'notifiedBadges',
        JSON.stringify([...this.notifiedBadges])
      );
    }
  }

  checkAndUpdateBadges(
    level,
    currentStreak,
    completedTasks,
    currentUnlockedBadges = []
  ) {
    const tasksLength = Array.isArray(completedTasks)
      ? completedTasks.length
      : 0;

    const newUnlockedBadges =
      checkBadgeUnlocks(level, currentStreak, tasksLength, completedTasks) ||
      [];

    newUnlockedBadges.forEach(this.notifyNewBadge.bind(this));

    if (
      JSON.stringify(newUnlockedBadges) !==
      JSON.stringify(currentUnlockedBadges)
    ) {
      this.setUnlockedBadges(newUnlockedBadges);
    }
  }
}

export default BadgeManager;
