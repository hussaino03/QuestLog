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