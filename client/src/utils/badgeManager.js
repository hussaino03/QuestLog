
import { BADGES } from '../components/Badge/BadgeGrid';

export const checkBadgeUnlocks = (level) => {
  return Object.values(BADGES)
    .filter(badge => level >= badge.level)
    .map(badge => badge.id);
};