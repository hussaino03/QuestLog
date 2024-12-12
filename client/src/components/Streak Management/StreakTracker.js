import React, { useState, useEffect } from 'react';
import XPProgressionChart from '../../user analytics/graph/XPProgressionChart';

const StreakTracker = ({ completedTasks, today = new Date(), onStreakChange = () => {} }) => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [xpData, setXpData] = useState(null);

  useEffect(() => {
    const calculateStreak = () => {
      if (!completedTasks.length) {
        setCurrentStreak(0);
        setLongestStreak(0);
        return;
      }

      const todayDate = new Date(today).setHours(0, 0, 0, 0);
      let current = 0;
      let max = 0;
      let previousDate = null;

      // Sort tasks by completion date and remove duplicate dates
      const sortedTasks = [...completedTasks]
        .filter(task => task.completedAt)
        .map(task => ({
          ...task,
          normalizedDate: new Date(task.completedAt).setHours(0, 0, 0, 0)
        }))
        .sort((a, b) => a.normalizedDate - b.normalizedDate)
        .filter((task, index, self) => 
          index === self.findIndex(t => t.normalizedDate === task.normalizedDate)
        );

      for (let i = 0; i < sortedTasks.length; i++) {
        const taskDate = sortedTasks[i].normalizedDate;
        
        if (previousDate === null) {
          current = 1;
        } else {
          const daysDifference = Math.round((taskDate - previousDate) / (1000 * 60 * 60 * 24));
          
          if (daysDifference === 1) {
            current += 1;
          } else {
            // If there's a gap, update max and reset current
            max = Math.max(max, current);
            current = 1;
          }
        }
        
        previousDate = taskDate;
      }

      // Update max one final time
      max = Math.max(max, current);

      // Check if the streak is still active (last task was today or yesterday)
      const lastTaskDate = sortedTasks[sortedTasks.length - 1].normalizedDate;
      const daysSinceLastTask = Math.round((todayDate - lastTaskDate) / (1000 * 60 * 60 * 24));

      if (daysSinceLastTask > 1) {
        // If the last task was completed more than 1 day ago, current streak is 0
        current = 0;
      } else if (daysSinceLastTask === 1) {
        // If the last task was yesterday and no task today, streak is still active but frozen
        // Keep current value
      } else if (daysSinceLastTask === 0) {
        // If we completed a task today after a break, and it's the only task, current should be 1
        if (sortedTasks.length === 1 || 
            Math.round((lastTaskDate - sortedTasks[sortedTasks.length - 2].normalizedDate) / (1000 * 60 * 60 * 24)) > 1) {
          current = 1;
        }
      }

      setCurrentStreak(current);
      setLongestStreak(max);
      onStreakChange(current); 
    };

    calculateStreak();
  }, [completedTasks, today, onStreakChange]);

  // Calculate XP data for the graph
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
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Streak</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentStreak}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-color duration-200">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Longest Streak</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{longestStreak}</p>
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