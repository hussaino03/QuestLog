import React, { useCallback, useEffect, useState } from 'react';
import Dashboard from '../Analytics/Dashboard';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import Chat from '../AI/Chat';
import { createFireElement } from '../../utils/other/animationsUtils';

const StreakTracker = ({ completedTasks, streakData }) => {
  const [openDashboard, setOpenDashboard] = React.useState(null);
  const [showFireAnimation, setShowFireAnimation] = useState(false);
  const [prevStreak, setPrevStreak] = useState(streakData.current);

  useEffect(() => {
    if (streakData.current > prevStreak) {
      setShowFireAnimation(true);
      const fireTimer = setTimeout(() => {
        setShowFireAnimation(false);
      }, 2000);
      return () => clearTimeout(fireTimer);
    }
    setPrevStreak(streakData.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevStreak, streakData?.current]);

  const handleOpenDashboard = useCallback((opener) => {
    setOpenDashboard(() => opener);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="relative text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Current Streak
          </p>
          <div className="relative">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {streakData.current}
            </p>
            {createFireElement(showFireAnimation)}
          </div>
        </div>
        <div className="relative text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Longest Streak
          </p>
          <div className="relative">
            <p className="text-2xl font-bold" style={{ color: '#77dd77' }}>
              {streakData.longest}
            </p>
            {createFireElement(
              showFireAnimation && streakData.current >= streakData.longest
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            XP Growth
          </h3>
          <button
            onClick={() => openDashboard?.()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                                  bg-white dark:bg-gray-800 font-medium text-sm
                                  border-2 border-gray-800 text-gray-800 dark:text-gray-200 
                                  shadow-[2px_2px_#2563EB] hover:shadow-none hover:translate-x-0.5 
                                  hover:translate-y-0.5 transition-all duration-200"
          >
            <ChartBarIcon className="w-4 h-4 text-gray-900 dark:text-white" />
            Stats
          </button>
        </div>
        <Dashboard
          completedTasks={completedTasks}
          onOpenDashboard={handleOpenDashboard}
        />
      </div>
      <Chat />
    </div>
  );
};

export default StreakTracker;
