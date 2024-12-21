import React, { useCallback } from 'react';
import Dashboard from '../Analytics/Dashboard';
import { ChartBarIcon } from '@heroicons/react/24/outline'; 


const StreakTracker = ({ completedTasks, streakData }) => {
    const [openDashboard, setOpenDashboard] = React.useState(null);

    const handleOpenDashboard = useCallback((opener) => {
        setOpenDashboard(() => opener);
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Streak</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{streakData.current}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Longest Streak</p>
                    <p className="text-2xl font-bold" style={{ color: '#77dd77' }}>{streakData.longest}</p>
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">XP Growth</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Past 7 days</p>
                    </div>
                    <button 
                        onClick={() => openDashboard?.()}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                                bg-white dark:bg-gray-800 font-medium text-sm
                                border-2 border-gray-800 text-gray-800 dark:text-gray-200 
                                shadow-[2px_2px_#2563EB] hover:shadow-none hover:translate-x-0.5 
                                hover:translate-y-0.5 transition-all duration-200"
                    >
                        <ChartBarIcon className="w-4 h-4 text-gray-900 dark:text-white" />
                        Analytics
                    </button>
                </div>
                <Dashboard 
                    completedTasks={completedTasks} 
                    onOpenDashboard={handleOpenDashboard}
                />
            </div>
        </div>
    );
};

export default StreakTracker;