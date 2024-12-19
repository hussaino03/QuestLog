import React, { useEffect, useState } from 'react';
import XPProgressionChart from '../../user analytics/graph/XPProgressionChart';

const StreakTracker = ({ completedTasks, streakData }) => {
    const [xpData, setXpData] = useState(null);
    
    // Keep only XP data calculation in component
    useEffect(() => {
        if (!completedTasks.length) {
            setXpData(null);
            return;
        }

        // Group tasks by date and sum XP
        const xpByDate = completedTasks.reduce((acc, task) => {
            if (!task.completedAt) return acc;
            
            const date = new Date(task.completedAt).toLocaleDateString();
            const xp = (task.experience || 0) + (task.earlyBonus || 0) + (task.overduePenalty || 0);
            
            acc[date] = (acc[date] || 0) + xp;
            return acc;
        }, {});

        // Get last 7 days of data
        const dates = Object.keys(xpByDate).sort().slice(-7);
        const xpValues = dates.map(date => xpByDate[date]);

        setXpData({
            labels: dates.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
            datasets: [{
                label: 'XP Gained',
                data: xpValues,
                fill: false,
                borderColor: '#60A5FA',
                tension: 0.3,
                pointBackgroundColor: '#60A5FA'
            }]
        });
    }, [completedTasks]);

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
            
            {/* XP Graph Section */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
                    XP Progression (Last 7 Days)
                </h3>
                <XPProgressionChart xpData={xpData} />
            </div>
        </div>
    );
};

export default StreakTracker;