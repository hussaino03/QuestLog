import React from 'react';
import Badge from './Badge';

export const BADGES = {
  NOVICE: {
    id: 'novice',
    name: 'Novice',
    icon: '🌟',
    description: 'Reach level 5',
    level: 5
  },
  INTERMEDIATE: {
    id: 'intermediate',
    name: 'Intermediate',
    icon: '⭐',
    description: 'Reach level 10',
    level: 10
  },
  XP_HUNTER: {
    id: 'xp_hunter',
    name: 'XP Hunter',
    icon: '💫',
    description: 'Reach level 15',
    level: 15
  }
};

const BadgeGrid = ({ unlockedBadges }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
        <span className="mr-2">🏆</span>
        Badges (more soon!)
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {Object.values(BADGES).map(badge => (
          <Badge
            key={badge.id}
            badge={badge}
            isUnlocked={unlockedBadges.includes(badge.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default BadgeGrid;