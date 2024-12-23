import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
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
import { getChartFontSizes, createChartOptions, createEmptyChartData } from '../../utils/analytics/chartUtils';
import { transformChartDates } from '../../utils/analytics/dateUtils';
import RangeToggle from '../../utils/analytics/rangeToggle';

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

const SafeChartWrapper = memo(({ children, data }) => {
  if (!data || !data.labels || !data.datasets || data.labels.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        No data available
      </div>
    );
  }
  return children;
});

const Dashboard = ({ completedTasks, onOpenDashboard }) => {  
  const [isFullView, setIsFullView] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [dateRange, setDateRange] = useState(7);
  
  const dashboardManager = useMemo(() => new DashboardManager(), []);
  const [dashboardData, setDashboardData] = useState({
    xpData: null,
    metrics: null,
    completedTasksData: null,
    periodXP: 0
  });

  // Consolidate chart-related calculations
  const chartConfig = useMemo(() => {
    const fontSizes = getChartFontSizes(windowWidth);
    const { xpChartOptions, tasksChartOptions } = createChartOptions(
      dateRange, 
      dashboardManager.CHART_COLORS, 
      fontSizes
    );

    const emptyChart = createEmptyChartData(dashboardManager.CHART_COLORS);
    const transformedData = {
      xpData: transformChartDates(dashboardData.xpData) || emptyChart,
      taskData: transformChartDates(dashboardData.completedTasksData) || emptyChart
    };

    const rotations = { x: { max: 45, min: 45 } };
    const chartFontSizes = {
      small: windowWidth < 640 ? 10 : 12,
      regular: windowWidth < 640 ? 12 : 14
    };

    return {
      xpChartOptions,
      tasksChartOptions,
      transformedData,
      rotations,
      chartFontSizes
    };
  }, [windowWidth, dateRange, dashboardData.xpData, dashboardData.completedTasksData, dashboardManager.CHART_COLORS]);

  // Memoize peak day calculation
  const peakDay = useMemo(() => {
    const peak = dashboardManager.findPeakDay(dashboardData.xpData);
    return peak.xp > 0 ? `${peak.date} • ${peak.xp}XP` : "No activity yet";
  }, [dashboardData.xpData, dashboardManager]);

  // Memoize average daily calculation
  const averageDaily = useMemo(() => 
    dashboardManager.calculateAverageDaily(completedTasks, dashboardData.xpData, dateRange),
    [completedTasks, dashboardData.xpData, dateRange, dashboardManager]
  );

  const handleCloseFullView = useCallback(() => {
    setIsFullView(false);
  }, []);

  // Clear cache when component unmounts
  useEffect(() => {
    return () => {
        dashboardManager.clearCache();
    };
  }, [dashboardManager]);

  useEffect(() => {
    if (onOpenDashboard) {
      onOpenDashboard(() => setIsFullView(true));
    }
  }, [onOpenDashboard]);

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

  const handleRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  useEffect(() => {
    let isMounted = true;
    
    const computeMetrics = async () => {
        try {
            const result = await dashboardManager.calculateMetricsOptimized(completedTasks, dateRange);
            if (isMounted) {
                setDashboardData(result);
            }
        } catch (error) {
            console.error('Error computing metrics:', error);
        }
    };

    computeMetrics();
    
    return () => {
        isMounted = false;
    };
  }, [completedTasks, dashboardManager, dateRange]);

  return (
    <div>
      <div className="mb-3">
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
          Past <RangeToggle currentRange={dateRange} onRangeChange={handleRangeChange} /> days
        </span>
      </div>
      <div className="h-48">
        <SafeChartWrapper data={chartConfig.transformedData.xpData}>
          {chartConfig.transformedData.xpData && (
            <Line 
              data={chartConfig.transformedData.xpData} 
              options={chartConfig.xpChartOptions} 
            />
          )}
        </SafeChartWrapper>
      </div>

      {/* Modal */}
      {isFullView && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 
                     flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
          onClick={(e) => e.target === e.currentTarget && handleCloseFullView()}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-h-[90vh]
                       max-w-[95vw] sm:max-w-5xl shadow-xl transform scale-100 
                       animate-modalSlide overflow-hidden flex flex-col sm:block"
          >
            <div className="relative z-20 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Analytics Overview
                  </h2>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                    Past 
                    <span className="inline-flex items-center p-0.5 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                      <button
                        onClick={() => handleRangeChange(7)}
                        className={`px-2 py-0.5 text-xs rounded-md transition-colors ${
                          dateRange === 7 
                          ? 'bg-white dark:bg-gray-600 shadow-sm' 
                          : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        7
                      </button>
                      <button
                        onClick={() => handleRangeChange(30)}
                        className={`px-2 py-0.5 text-xs rounded-md transition-colors ${
                          dateRange === 30 
                          ? 'bg-white dark:bg-gray-600 shadow-sm' 
                          : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        30
                      </button>
                    </span>
                    days
                  </span>
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
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      {dashboardData.metrics?.periodLabel}
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white">
                    {dashboardData.metrics?.weeklyXP || 0}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Total XP earned in this period</p>
                </div>

                {/* Activity Days card */}
                <div className="p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Activity Days</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white">
                    {dashboardData.metrics?.activeDays}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Days with completed tasks</p>
                </div>

                {/* Weekly Trend card */}
                <div className="p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    {dashboardData.metrics?.trendDirection === 'Improving' ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    )}
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      {dateRange === 7 ? 'Weekly' : 'Monthly'} Trend
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white">
                    {dashboardData.metrics?.trendDescription}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    {dashboardData.metrics?.trendPercentage}% {dashboardData.metrics?.trendDirection.toLowerCase()} from {dateRange === 7 ? 'last week' : 'last month'}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <>
              {/* Key Metrics */}
              <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 gap-3 px-3 sm:px-6">
              </div>

              {/* Charts Section */}
              <div className="px-4 sm:px-8 pb-6 sm:pb-8 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                  <div className="space-y-2 sm:space-y-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 px-1">XP Growth</h4>
                    <div className="h-[250px] sm:h-[280px] p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 
                                  border border-gray-100 dark:border-gray-600">
                      <SafeChartWrapper data={chartConfig.transformedData.xpData}>
                        <Line 
                          data={chartConfig.transformedData.xpData}
                          options={{
                            ...chartConfig.xpChartOptions, 
                            maintainAspectRatio: false,
                            scales: {
                              ...chartConfig.xpChartOptions.scales,
                              x: {
                                ...chartConfig.xpChartOptions.scales.x,
                                ticks: {
                                  maxRotation: chartConfig.rotations.x.max,
                                  minRotation: chartConfig.rotations.x.min,
                                  font: {
                                    size: chartConfig.chartFontSizes.small
                                  }
                                }
                              },
                              y: {
                                ...chartConfig.xpChartOptions.scales.y,
                                ticks: {
                                  font: {
                                    size: chartConfig.chartFontSizes.small
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </SafeChartWrapper>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 px-1">Task/Project Completion</h4>
                    <div className="h-[250px] sm:h-[280px] p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 
                                  border border-gray-100 dark:border-gray-600">
                      <SafeChartWrapper data={chartConfig.transformedData.taskData}>
                        <Bar data={chartConfig.transformedData.taskData} options={{
                          ...chartConfig.tasksChartOptions,
                          scales: {
                            ...chartConfig.tasksChartOptions.scales,
                            x: {
                              ticks: {
                                maxRotation: chartConfig.rotations.x.max,
                                minRotation: chartConfig.rotations.x.min,
                                font: {
                                  size: chartConfig.chartFontSizes.small
                                }
                              }
                            },
                            y: {
                              ticks: {
                                font: {
                                  size: chartConfig.chartFontSizes.small
                                }
                              }
                            }
                          }
                        }} />
                      </SafeChartWrapper>
                    </div>
                  </div>
                </div>
              </div>
            </>
          </div>
        </div>
      )}
      {dashboardData?.xpData && (
        <div className="flex gap-3 mt-4">
          {/* Peak Day card */}
          <div className="flex items-center px-4 py-1.5 rounded-lg border" style={{
            borderColor: '#2563EB'
          }}>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Peak Day</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {peakDay}
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
                {averageDaily} XP
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Dashboard);
