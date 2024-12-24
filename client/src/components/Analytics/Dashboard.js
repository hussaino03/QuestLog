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
import RangeToggle from './RangeToggle';
import { LoadingSpinner } from '../../utils/other/spinnerUtils';
import { formatLocalDate } from '../../utils/analytics/dateUtils';

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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const dashboardManager = useMemo(() => new DashboardManager(), []);
  const [dashboardData, setDashboardData] = useState({
    xpData: null,
    metrics: null,
    completedTasksData: null,
    periodXP: 0
  });

  const chartConfig = useMemo(() => ({
    ...createChartOptions(startDate, endDate, dashboardManager.CHART_COLORS, getChartFontSizes(windowWidth)),
    transformedData: {
        xpData: dashboardData.xpData || createEmptyChartData(dashboardManager.CHART_COLORS),
        taskData: dashboardData.completedTasksData || createEmptyChartData(dashboardManager.CHART_COLORS)
    },
    chartFontSizes: getChartFontSizes(windowWidth)
  }), [windowWidth, startDate, endDate, dashboardData, dashboardManager.CHART_COLORS]);

  const formatDateForDisplay = useCallback((date) => {
    return formatLocalDate(date);
  }, []);

  // Memoize peak day calculation
  const peakDay = useMemo(() => {
    const peak = dashboardManager.findPeakDay(dashboardData.xpData);
    if (peak.xp > 0) {
        const localDate = formatDateForDisplay(new Date(peak.date));
        return `${localDate} • ${peak.xp}XP`;
    }
    return "No activity yet";
  }, [dashboardData.xpData, dashboardManager, formatDateForDisplay]);

  // Memoize average daily calculation
  const averageDaily = useMemo(() => {
    // Use same effective dates logic as in computeMetrics
    const effectiveStartDate = startDate || (() => {
      const date = new Date();
      date.setDate(date.getDate() - 6);
      date.setHours(0, 0, 0, 0);
      return date;
    })();
    
    const effectiveEndDate = endDate || (() => {
      const date = new Date();
      date.setHours(23, 59, 59, 999);
      return date;
    })();

    return dashboardManager.calculateAverageDaily(
      completedTasks, 
      dashboardData.xpData, 
      effectiveStartDate, 
      effectiveEndDate
    );
  }, [completedTasks, dashboardData.xpData, startDate, endDate, dashboardManager]);

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

  const handleRangeChange = (start, end) => {
    setIsLoading(true);
    setStartDate(start);
    setEndDate(end);
    setTimeout(() => setIsLoading(false), 300);
  };

  useEffect(() => {
    let isMounted = true;
    
    const computeMetrics = () => {
        try {
            // If no custom range is selected, use default 7 days
            const effectiveStartDate = startDate || (() => {
                const date = new Date();
                date.setDate(date.getDate() - 6);
                date.setHours(0, 0, 0, 0);
                return date;
            })();
            
            const effectiveEndDate = endDate || (() => {
                const date = new Date();
                date.setHours(23, 59, 59, 999);
                return date;
            })();

            const result = dashboardManager.calculateMetricsOptimized(
                completedTasks, 
                effectiveStartDate, 
                effectiveEndDate
            );
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
  }, [completedTasks, dashboardManager, startDate, endDate]);

  return (
    <div>
      <div className="mb-3">
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <RangeToggle startDate={startDate} endDate={endDate} onRangeChange={handleRangeChange} />
        </span>
      </div>
      <div className="h-48">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <SafeChartWrapper data={chartConfig.transformedData.xpData}>
            {chartConfig.transformedData.xpData && (
              <Line 
                data={chartConfig.transformedData.xpData} 
                options={chartConfig.xpChartOptions} 
              />
            )}
          </SafeChartWrapper>
        )}
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
                    <RangeToggle startDate={startDate} endDate={endDate} onRangeChange={handleRangeChange} />
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
                      Period Trend
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white">
                    {dashboardData.metrics?.trendDescription}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Comparing First {dashboardData.metrics?.compareSegmentSize} day{dashboardData.metrics?.compareSegmentSize === 1 ? '' : 's'} vs Last {dashboardData.metrics?.compareSegmentSize} day{dashboardData.metrics?.compareSegmentSize === 1 ? '' : 's'}
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
                      {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                          <LoadingSpinner />
                        </div>
                      ) : (
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
                                    ...chartConfig.xpChartOptions.scales.x.ticks,
                                    font: {
                                      size: chartConfig.chartFontSizes.small
                                    }
                                  }
                                },
                                y: {
                                  ...chartConfig.xpChartOptions.scales.y,
                                  ticks: {
                                    ...chartConfig.xpChartOptions.scales.y.ticks,
                                    font: {
                                      size: chartConfig.chartFontSizes.small
                                    }
                                  }
                                }
                              }
                            }}
                          />
                        </SafeChartWrapper>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 px-1">Task/Project Completion</h4>
                    <div className="h-[250px] sm:h-[280px] p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 
                                  border border-gray-100 dark:border-gray-600">
                      {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                          <LoadingSpinner />
                        </div>
                      ) : (
                        <SafeChartWrapper data={chartConfig.transformedData.taskData}>
                          <Bar data={chartConfig.transformedData.taskData} options={{
                            ...chartConfig.tasksChartOptions,
                            scales: {
                              ...chartConfig.tasksChartOptions.scales,
                              x: {
                                ...chartConfig.tasksChartOptions.scales.x,
                                ticks: {
                                  ...chartConfig.tasksChartOptions.scales.x.ticks,
                                  font: {
                                    size: chartConfig.chartFontSizes.small
                                  }
                                }
                              },
                              y: {
                                ...chartConfig.tasksChartOptions.scales.y,
                                ticks: {
                                  ...chartConfig.tasksChartOptions.scales.y.ticks,
                                  font: {
                                    size: chartConfig.chartFontSizes.small
                                  }
                                }
                              }
                            }
                          }} />
                        </SafeChartWrapper>
                      )}
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
