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

  return (
    <div className="h-48">
      {xpData ? (
        <Line data={xpData} options={chartOptions} />
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
          No XP data available
        </div>
      )}
    </div>
  );
};

// Make sure we export default the component
export default XPProgressionChart;
