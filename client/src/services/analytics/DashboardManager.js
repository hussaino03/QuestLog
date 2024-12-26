import MetricsManager from './MetricsManager';
import {
  getDateRange,
  calculateDays,
  startOfLocalDay
} from '../../utils/analytics/dateUtils';

class DashboardManager {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.metricsManager = new MetricsManager();

    this.CHART_COLORS = {
      primary: '#60A5FA',
      background: 'rgba(96, 165, 250, 0.5)'
    };

    this._dateRangeCache = new Map();
  }

  getTaskXP(task) {
    if (!task) return 0;
    const baseXP = task.experience || 0;
    const bonus = task.earlyBonus || 0;
    const penalty = task.overduePenalty || 0;
    const total = baseXP + bonus + penalty;
    return Math.max(0, total); // Prevent negative XP
  }

  findPeakDay(xpData) {
    return this.metricsManager.findPeakDay(xpData);
  }

  getMetrics(xpData, periodXP, days) {
    return this.metricsManager.getMetrics(xpData, periodXP, days);
  }

  calculateAverageDaily(completedTasks, xpData, startDate, endDate) {
    const dateRange = { startDate, endDate };
    return this.metricsManager.calculateAverageDaily(
      completedTasks,
      xpData,
      dateRange
    );
  }

  getTrendDescription(percentage) {
    return this.metricsManager.getTrendDescription(percentage);
  }

  getCacheItem(key) {
    const item = this.cache.get(key);
    if (!item || Date.now() - item.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  setCacheItem(key, value) {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  getDateRange(days = 7) {
    const cached = this._dateRangeCache.get(days);
    if (
      cached?.timestamp &&
      Date.now() - cached.timestamp < this.cacheTimeout
    ) {
      return cached.value;
    }

    const range = getDateRange(days);
    this._dateRangeCache.set(days, { value: range, timestamp: Date.now() });
    return range;
  }

  calculateDays(startDateOrNumDays, endDate = null) {
    if (typeof startDateOrNumDays === 'number' && endDate === null) {
      const { startDate, endDate } = this.getDateRange(startDateOrNumDays);
      return calculateDays(startDate, endDate);
    }

    return calculateDays(startDateOrNumDays, endDate);
  }

  processTasksBatched(tasks, startDate, endDate) {
    if (!tasks?.length) return new Map();

    const taskMap = new Map();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    tasks.forEach((task) => {
      if (!task?.completedAt) return;

      const completedDate = new Date(task.completedAt);
      if (isNaN(completedDate.getTime())) return;

      const dateKey = startOfLocalDay(completedDate).getTime();

      if (dateKey >= startTime && dateKey <= endTime) {
        if (!taskMap.has(dateKey)) {
          taskMap.set(dateKey, []);
        }
        taskMap.get(dateKey).push(task);
      }
    });

    return taskMap;
  }

  calculateXPDataFromBatches(tasksByDate, periodDays) {
    const dailyXP = periodDays.map((day) => {
      const dateKey = startOfLocalDay(day.date).getTime();
      const tasksForDay = tasksByDate.get(dateKey) || [];
      return {
        label: day.label,
        xp: tasksForDay.reduce((sum, task) => sum + this.getTaskXP(task), 0)
      };
    });

    return {
      labels: dailyXP.map((d) => d.label),
      datasets: [
        {
          label: 'XP Gained',
          data: dailyXP.map((d) => d.xp),
          fill: false,
          borderColor: this.CHART_COLORS.primary,
          tension: 0.3,
          pointBackgroundColor: this.CHART_COLORS.primary,
          backgroundColor: this.CHART_COLORS.background,
          borderWidth: 3,
          borderRadius: 5
        }
      ]
    };
  }

  calculatePeriodXPFromBatches(tasksByDate) {
    return Array.from(tasksByDate.values())
      .flat()
      .reduce((total, task) => total + this.getTaskXP(task), 0);
  }

  calculateTasksDataFromBatches(tasksByDate, periodDays) {
    const dailyTasks = periodDays.map((day) => {
      const dateKey = startOfLocalDay(day.date).getTime();
      const tasksForDay = tasksByDate.get(dateKey) || [];
      return {
        label: day.label,
        count: tasksForDay.length
      };
    });

    return {
      labels: dailyTasks.map((d) => d.label),
      datasets: [
        {
          label: 'Tasks Completed',
          data: dailyTasks.map((d) => d.count),
          backgroundColor: this.CHART_COLORS.background,
          borderColor: this.CHART_COLORS.primary,
          borderWidth: 1,
          borderRadius: 5
        }
      ]
    };
  }

  clearCache() {
    this.cache.clear();
    this._dateRangeCache.clear();
  }

  calculateMetricsOptimized(completedTasks, startDate, endDate) {
    const { startDate: start, endDate: end } = getDateRange(startDate, endDate);
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (!completedTasks?.length) {
      const emptyData = this.createEmptyChartData();
      return {
        xpData: emptyData,
        metrics: this.metricsManager.getMetrics(emptyData, 0, days),
        completedTasksData: emptyData,
        periodXP: 0
      };
    }

    const cacheKey = `metrics-${start.getTime()}-${end.getTime()}-${completedTasks.length}-${completedTasks[0].completedAt}`;
    const cached = this.getCacheItem(cacheKey);
    if (cached) return cached;

    const tasksByDate = this.processTasksBatched(completedTasks, start, end);
    const periodDays = calculateDays(start, end);

    const result = {
      xpData: this.calculateXPDataFromBatches(tasksByDate, periodDays),
      periodXP: this.calculatePeriodXPFromBatches(tasksByDate),
      completedTasksData: this.calculateTasksDataFromBatches(
        tasksByDate,
        periodDays
      )
    };

    result.metrics = this.metricsManager.getMetrics(
      result.xpData,
      result.periodXP,
      days
    );
    this.setCacheItem(cacheKey, result);

    return result;
  }

  createEmptyChartData() {
    return {
      labels: [],
      datasets: [
        {
          label: 'XP Gained',
          data: [],
          fill: false,
          borderColor: this.CHART_COLORS.primary,
          tension: 0.3,
          pointBackgroundColor: this.CHART_COLORS.primary,
          backgroundColor: this.CHART_COLORS.background,
          borderWidth: 1,
          borderRadius: 5
        }
      ]
    };
  }
}

export default DashboardManager;
