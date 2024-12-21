import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChartBarIcon, FireIcon } from '@heroicons/react/24/outline';
import DashboardManager from '../../services/analytics/DashboardManager';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ completedTasks, onOpenDashboard }) => {  
  const [isFullView, setIsFullView] = useState(false);
  const [xpData, setXpData] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const dashboardManager = useMemo(() => new DashboardManager(), []);

  const periodXP = useMemo(() => 
    dashboardManager.calculatePeriodXP(completedTasks),
    [completedTasks, dashboardManager]
  );

  const { metrics, completedTasksData } = useMemo(() => {
    if (!xpData) return { metrics: null, completedTasksData: null };
    
    return {
      metrics: dashboardManager.getMetrics(xpData, periodXP),
      completedTasksData: dashboardManager.getCompletedTasksData(completedTasks, xpData)
    };
  }, [completedTasks, xpData, periodXP, dashboardManager]);

  // Memoize chart options
  const chartOptions = useMemo(() => ({
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
  }), []);

  const tasksChartOptions = useMemo(() => ({
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
          label: (context) => `${context.parsed.y} tasks completed`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
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
  }), []);

  // Add a utility function to format dates
  const formatDate = useCallback((date, useWeekday = false) => {
    if (useWeekday) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  }, []);

  // Create separate chart data for card and modal views
  const getChartData = useCallback((data, useWeekday = false) => {
    if (!data?.labels || !data?.datasets) return null;
    
    return {
      ...data,
      labels: data.labels.map(label => {
        const [month, day] = label.split('/');
        const date = new Date(new Date().getFullYear(), Number(month) - 1, Number(day));
        return formatDate(date, useWeekday);
      })
    };
  }, [formatDate]);

  const handleCloseFullView = useCallback(() => {
    setIsFullView(false);
  }, []);

  const renderPeakDay = useCallback(() => {
    const peak = dashboardManager.findPeakDay(xpData);
    if (!peak || peak.xp === 0) return "No activity yet";
    return `${peak.date} • ${peak.xp}XP`;  
  }, [xpData, dashboardManager]);

  // Clear cache when component unmounts
  useEffect(() => {
    return () => {
        dashboardManager.clearCache();
    };
  }, [dashboardManager]);

  // Calculate XP data
  useEffect(() => {
    const data = dashboardManager.calculateXPData(completedTasks);
    setXpData(data);
  }, [completedTasks, dashboardManager]);

  // Setup dashboard opener
  useEffect(() => {
    if (onOpenDashboard) {
      onOpenDashboard(() => setIsFullView(true));
    }
  }, [onOpenDashboard]);

  // Window resize optimization
  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Move chart options to constants
  const CHART_CONSTANTS = useMemo(() => ({
    fontSizes: {
      small: windowWidth < 640 ? 10 : 12,
      regular: windowWidth < 640 ? 12 : 14
    },
    rotations: {
      x: { max: 45, min: 45 }
    }
  }), [windowWidth]);

  // Optimize chart data transformations
  const transformedChartData = useMemo(() => ({
    xpData: xpData ? getChartData(xpData, true) : null,
    modalXpData: xpData ? getChartData(xpData, false) : null,
    taskData: completedTasksData ? getChartData(completedTasksData, false) : null
  }), [xpData, completedTasksData, getChartData]);

  return (
    <div>
      <div className="h-48">
        {transformedChartData.xpData ? (
          <Line data={transformedChartData.xpData} options={chartOptions} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            No XP data available
          </div>
        )}
      </div>

      {/* Modal for full view */}
      {isFullView && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 
                     flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
          onClick={(e) => e.target === e.currentTarget && handleCloseFullView()}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-h-[90vh] overflow-y-auto
                       max-w-[95vw] sm:max-w-5xl shadow-xl transform scale-100 
                       animate-modalSlide overflow-hidden"
          >
            <div className="relative z-20 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Analytics Overview
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Past 7 Days</p>
                </div>
                <button
                  onClick={handleCloseFullView}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <span className="text-red-600 dark:text-red-400 text-lg">×</span>
                </button>
              </div>

              {/* Key Metrics */}
              <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 gap-3">
                <div className="p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <FireIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">7-Day XP Total</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white">
                    {metrics?.weeklyXP || 0}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Total XP earned this week</p>
                </div>

                {/* Activity Days card */}
                <div className="p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Activity Days</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white">
                    {metrics?.activeDays}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Days with completed tasks</p>
                </div>

                {/* Weekly Trend card */}
                <div className="p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    {metrics?.trendDirection === 'Improving' ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    )}
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Weekly Trend</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white">
                    {metrics?.trendDescription}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    {metrics?.trendPercentage}% {metrics?.trendDirection.toLowerCase()} from last week
                  </p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="px-4 sm:px-8 pb-6 sm:pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                <div className="space-y-2 sm:space-y-4">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 px-1">XP Growth</h4>
                  <div className="h-[250px] sm:h-[280px] p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 
                                border border-gray-100 dark:border-gray-600">
                    <Line data={transformedChartData.modalXpData} options={{
                      ...chartOptions, 
                      maintainAspectRatio: false,
                      scales: {
                        ...chartOptions.scales,
                        x: {
                          ...chartOptions.scales.x,
                          ticks: {
                            maxRotation: CHART_CONSTANTS.rotations.x.max,
                            minRotation: CHART_CONSTANTS.rotations.x.min,
                            font: {
                              size: CHART_CONSTANTS.fontSizes.small
                            }
                          }
                        },
                        y: {
                          ...chartOptions.scales.y,
                          ticks: {
                            font: {
                              size: CHART_CONSTANTS.fontSizes.small
                            }
                          }
                        }
                      }
                    }} />
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-4">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 px-1">Task/Project Completion</h4>
                  <div className="h-[250px] sm:h-[280px] p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 
                                border border-gray-100 dark:border-gray-600">
                    <Bar data={transformedChartData.taskData} options={{
                      ...tasksChartOptions,
                      scales: {
                        ...tasksChartOptions.scales,
                        x: {
                          ticks: {
                            maxRotation: CHART_CONSTANTS.rotations.x.max,
                            minRotation: CHART_CONSTANTS.rotations.x.min,
                            font: {
                              size: CHART_CONSTANTS.fontSizes.small
                            }
                          }
                        },
                        y: {
                          ticks: {
                            font: {
                              size: CHART_CONSTANTS.fontSizes.small
                            }
                          }
                        }
                      }
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {xpData && (
        <div className="flex gap-3 mt-4">
          {/* Peak Day card */}
          <div className="flex items-center px-4 py-1.5 rounded-lg border" style={{
            borderColor: '#2563EB'
          }}>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Peak Day</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {renderPeakDay()}
              </span>
            </div>
          </div>

          {/* Average Daily card */}
          <div className="flex items-center px-4 py-1.5 rounded-lg border" style={{
            borderColor: '#77dd77'
          }}>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Average Daily</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {dashboardManager.calculateAverageDaily(completedTasks, xpData)} XP per day
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Dashboard);
