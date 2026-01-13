import { checkBadgeUnlocks } from '../../utils/badges/badgeUtils';
import { BADGES } from '../../components/Badge/BadgeGrid';

class BadgeManager {
  constructor(setUnlockedBadges, addNotification) {
    this.setUnlockedBadges = setUnlockedBadges;
    this.addNotification = addNotification;

    try {
      this.notifiedBadges = new Set(
        JSON.parse(localStorage.getItem('notifiedBadges') || '[]')
      );
    } catch (error) {
      console.error('Failed to parse notified badges:', error);
      this.notifiedBadges = new Set();
    }

    this.notifyNewBadge = this.notifyNewBadge.bind(this);
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

  checkForNewBadges(
    level,
    currentStreak,
    completedTasks,
    currentUnlockedBadges = []
  ) {
    const tasksLength = Array.isArray(completedTasks)
      ? completedTasks.length
      : 0;

    const newlyUnlockedBadges =
      checkBadgeUnlocks(level, currentStreak, tasksLength, completedTasks) ||
      [];

    const uniqueNewBadges = newlyUnlockedBadges.filter(
      (badge) => !currentUnlockedBadges.includes(badge)
    );

    if (uniqueNewBadges.length > 0) {
      uniqueNewBadges.forEach(this.notifyNewBadge);

      const updatedBadges = [
        ...new Set([...currentUnlockedBadges, ...uniqueNewBadges])
      ];
      this.setUnlockedBadges(updatedBadges);
      return updatedBadges;
    }

    return currentUnlockedBadges;
  }

  clearNotificationHistory() {
    this.notifiedBadges.clear();
    localStorage.removeItem('notifiedBadges');
  }
}

export default BadgeManager;
