import React, { useState } from 'react';
import BadgesModal from './BadgesModal';
import { Trophy } from 'lucide-react';

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
  },
  STREAK_MASTER: {
    id: 'streak_master',
    name: 'Consistent',
    icon: '🔥',
    description: 'Reach a 5-day streak',
    streakRequired: 5
  },
  TASK_ACHIEVER: {
    id: 'task_achiever',
    name: 'Achiever',
    icon: '✅',
    description: 'Complete 20 tasks',
    tasksRequired: 20
  },
  TASK_MASTER: {
    id: 'task_master',
    name: 'Task Master',
    icon: '👑',
    description: 'Complete 50 tasks',
    tasksRequired: 50
  },
  DEDICATION: {
    id: 'dedication',
    name: 'Dedication',
    icon: '💪',
    description: 'Reach a 10-day streak',
    streakRequired: 10
  },
  ELITE: {
    id: 'elite',
    name: 'Elite',
    icon: '🏆',
    description: 'Reach level 25',
    level: 25
  },
  LEGENDARY: {
    id: 'legendary',
    name: 'Legendary',
    icon: '⚡',
    description: 'Complete 100 tasks',
    tasksRequired: 100
  },
  UNSTOPPABLE: {
    id: 'unstoppable',
    name: 'Unstoppable',
    icon: '🔱',
    description: 'Reach a 30-day streak',
    streakRequired: 30
  },
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Early Bird',
    icon: '🌅',
    description: 'Complete 5 tasks before their deadline',
    earlyCompletions: 5
  },
  NIGHT_OWL: {
    id: 'night_owl',
    name: 'Night Owl',
    icon: '🦉',
    description: 'Complete 5 tasks between 10 PM and 4 AM',
    nightCompletions: 5
  },
  MULTITASKER: {
    id: 'multitasker',
    name: 'Multitasker',
    icon: '🎯',
    description: 'Complete 3 tasks in one day',
    tasksPerDay: 3
  },
  WEEKEND_WARRIOR: {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    icon: '⚔️',
    description: 'Complete 10 tasks during weekends',
    weekendCompletions: 10
  },
  PERFECTIONIST: {
    id: 'perfectionist',
    name: 'Perfectionist',
    icon: '💎',
    description: 'Complete 10 tasks exactly on their deadline',
    exactDeadlines: 10
  },
  MASTER_OF_TIME: {
    id: 'master_of_time',
    name: 'Time Lord',
    icon: '⌛',
    description: 'Complete 25 tasks before their deadline',
    earlyCompletions: 25
  },
  NIGHT_CHAMPION: {
    id: 'night_champion',
    name: 'Night Champion',
    icon: '🌙',
    description: 'Complete 15 tasks between 10 PM and 4 AM',
    nightCompletions: 15
  },
  PRODUCTIVITY_KING: {
    id: 'productivity_king',
    name: 'Productivity King',
    icon: '👨‍💼',
    description: 'Complete 5 tasks in one day',
    tasksPerDay: 5
  },
  WEEKEND_MASTER: {
    id: 'weekend_master',
    name: 'Weekend Master',
    icon: '🎯',
    description: 'Complete 50 tasks during weekends',
    weekendCompletions: 50
  },
  GRANDMASTER: {
    id: 'grandmaster',
    name: 'Grandmaster',
    icon: '🎭',
    description: 'Reach level 100',
    level: 100
  },
  MARATHON_RUNNER: {
    id: 'marathon_runner',
    name: 'Marathon Runner',
    icon: '🏃',
    description: 'Reach a 100-day streak',
    streakRequired: 100
  },
  TASK_EMPEROR: {
    id: 'task_emperor',
    name: 'Task Emperor',
    icon: '👑',
    description: 'Complete 1000 tasks',
    tasksRequired: 1000
  },
  ULTIMATE_CHAMPION: {
    id: 'ultimate_champion',
    name: 'Ultimate Champion',
    icon: '🏅',
    description: 'Complete 50 tasks before their deadline',
    earlyCompletions: 50
  }
};

const BadgeGrid = ({ unlockedBadges }) => {
  const [showModal, setShowModal] = useState(false);
  const totalBadges = Object.keys(BADGES).length;
  const progress = (unlockedBadges.length / totalBadges) * 100;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
              Badges
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {unlockedBadges.length} of {totalBadges} unlocked
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                     bg-white dark:bg-gray-800 font-medium text-sm
                     border-2 border-gray-800 text-gray-800 dark:text-gray-200 
                     shadow-[2px_2px_#2563EB] hover:shadow-none hover:translate-x-0.5 
                     hover:translate-y-0.5 transition-all duration-200"
          >
            <Trophy className="w-4 h-4 text-gray-900 dark:text-white" />
            View All
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-2">
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 
                       rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <BadgesModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        badges={BADGES}
        unlockedBadges={unlockedBadges}
      />
    </>
  );
};

export default BadgeGrid;
