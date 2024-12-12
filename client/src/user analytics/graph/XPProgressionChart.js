import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const XPProgressionChart = ({ xpData }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F3F4F6',
        bodyColor: '#F3F4F6',
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y} XP`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#6B7280'
        },
        grid: {
          display: false
        }
      },
      x: {
        ticks: {
          color: '#6B7280'
        },
        grid: {
          display: false
        }
      }
    }
  };

  const calculateTotalXPGain = () => {
    if (!xpData || !xpData.datasets || !xpData.datasets[0].data) return 0;
    const data = xpData.datasets[0].data;
    return data[data.length - 1] - data[0];
  };

  const renderXPStatus = () => {
    const gain = calculateTotalXPGain();
    if (gain === 0) {
      return "No XP change";  
    }
    return `+${gain} XP gain`;  
  };

  const findPeakDay = () => {
    if (!xpData || !xpData.datasets || !xpData.datasets[0].data) return null;
    const data = xpData.datasets[0].data;
    const labels = xpData.labels;
    let maxGain = 0;
    let peakDay = null;
    
    for (let i = 1; i < data.length; i++) {
      const dayGain = data[i] - data[i-1];
      if (dayGain > maxGain) {
        maxGain = dayGain;
        peakDay = labels[i];
      }
    }
    
    return { date: peakDay, xp: maxGain };
  };

  const calculateAverageDaily = () => {
    if (!xpData || !xpData.datasets || !xpData.datasets[0].data) return 0;
    const data = xpData.datasets[0].data;
    let totalDailyGains = 0;
    let days = 0;
    
    for (let i = 1; i < data.length; i++) {
      const dayGain = data[i] - data[i-1];
      if (dayGain > 0) {
        totalDailyGains += dayGain;
        days++;
      }
    }
    
    return days > 0 ? Math.round(totalDailyGains / days) : 0;
  };

  const renderPeakDay = () => {
    const peak = findPeakDay();
    if (!peak || peak.xp === 0) {
      return "No activity yet";
    }
    return `${peak.date} • ${peak.xp}XP`;
  };

  return (
    <div>
      <div className="h-48">
        {xpData ? (
          <Line data={xpData} options={chartOptions} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            No XP data available
          </div>
        )}
      </div>
      {xpData && (
        <div className="flex gap-3 mt-4 flex-wrap">
          <div className="flex items-center px-4 py-1.5 rounded-lg border" style={{
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.05)',
          }}>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Period XP</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {renderXPStatus()}
              </span>
            </div>
          </div>
          <div className="flex items-center px-4 py-1.5 rounded-lg border" style={{
            borderColor: '#77dd77',
            backgroundColor: 'rgba(119, 221, 119, 0.05)',
          }}>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Peak Day</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {renderPeakDay()}
              </span>
            </div>
          </div>
          <div className="flex items-center px-4 py-1.5 rounded-lg border" style={{
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.05)',
          }}>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Average Daily</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {calculateAverageDaily()} XP per day
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default XPProgressionChart;
