class DashboardManager {
    constructor() {
        // Enhanced cache with timestamp
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        // Constants
        this.CHART_COLORS = {
            primary: '#60A5FA',
            background: 'rgba(96, 165, 250, 0.5)'
        };
        
        // Batch size for processing large datasets
        this.BATCH_SIZE = 100;
    }

    // Improved cache handling with timeout
    getCacheItem(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }

    setCacheItem(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    // Optimized date helpers
    getDateRange() {
        const cacheKey = 'dateRange';
        const cached = this.getCacheItem(cacheKey);
        if (cached) return cached;

        const result = {
            startDate: new Date(),
            endDate: new Date()
        };

        result.startDate.setDate(result.startDate.getDate() - 7);
        result.startDate.setHours(0, 0, 0, 0);
        result.endDate.setDate(result.endDate.getDate() - 1);
        result.endDate.setHours(23, 59, 59, 999);

        this.setCacheItem(cacheKey, result);
        return result;
    }

    calculateLast7Days() {
        const days = [];
        const { startDate } = this.getDateRange();
        
        // Generate 7 days from startDate
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const day = d.getDate().toString().padStart(2, '0');
            days.push({
                date: d,
                label: `${month}/${day}` 
            });
        }
        return days;
    }

    // Helper to normalize date for consistent comparison using UTC
    normalizeDate(date, taskTimezone) {
        const d = new Date(date);
        // Use the timezone from when the task was completed
        const localDate = new Date(d.toLocaleString('en-US', { 
            timeZone: taskTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone 
        }));
        localDate.setHours(0, 0, 0, 0);
        return localDate.getTime();
    }

    // Helper to calculate task XP
    getTaskXP(task) {
        const baseXP = task.experience || 0;
        const bonus = task.earlyBonus || 0;
        const penalty = task.overduePenalty || 0;
        return baseXP + bonus + penalty;
    }

    // Optimized task processing
    processTasks(tasks, startDate, endDate) {
        if (!tasks?.length) return new Map();
        
        const tasksByDate = new Map();
        const batches = Math.ceil(tasks.length / this.BATCH_SIZE);

        for (let i = 0; i < batches; i++) {
            const batchTasks = tasks.slice(i * this.BATCH_SIZE, (i + 1) * this.BATCH_SIZE);
            
            batchTasks.forEach(task => {
                const taskDate = new Date(task.completedAt);
                if (taskDate >= startDate && taskDate <= endDate) {
                    const normalizedDate = this.normalizeDate(task.completedAt, task.completedTimezone);
                    if (!tasksByDate.has(normalizedDate)) {
                        tasksByDate.set(normalizedDate, []);
                    }
                    tasksByDate.get(normalizedDate).push(task);
                }
            });
        }

        return tasksByDate;
    }

    calculateXPData(completedTasks) {
        if (!completedTasks?.length) return null;

        const cacheKey = `xpData-${completedTasks.length}-${completedTasks[0].completedAt}-${completedTasks[completedTasks.length-1].completedAt}`;
        const cached = this.getCacheItem(cacheKey);
        if (cached) return cached;

        const { startDate, endDate } = this.getDateRange();
        const tasksByDate = this.processTasks(completedTasks, startDate, endDate);
        const last7Days = this.calculateLast7Days();

        // Calculate daily XP
        const dailyXP = last7Days.map(day => {
            const normalizedDate = this.normalizeDate(day.date);
            const tasksForDay = tasksByDate.get(normalizedDate) || [];
            return {
                label: day.label,
                xp: tasksForDay.reduce((sum, task) => sum + this.getTaskXP(task), 0)
            };
        });

        const result = {
            labels: dailyXP.map(d => d.label),
            datasets: [{
                label: 'XP Gained',
                data: dailyXP.map(d => d.xp),
                fill: false,
                borderColor: this.CHART_COLORS.primary,
                tension: 0.3,
                pointBackgroundColor: this.CHART_COLORS.primary
            }]
        };

        this.setCacheItem(cacheKey, result);
        return result;
    }

    calculatePeriodXP(completedTasks) {
        if (!completedTasks?.length) return 0;
        
        const cacheKey = `periodXP-${completedTasks.map(t => t.completedAt).join('-')}`;
        const cached = this.getCacheItem(cacheKey);
        if (cached) return cached;

        const { startDate, endDate } = this.getDateRange();
        
        const result = completedTasks
            .filter(task => {
                const taskDate = new Date(task.completedAt);
                return taskDate >= startDate && taskDate <= endDate;
            })
            .reduce((total, task) => total + this.getTaskXP(task), 0);

        this.setCacheItem(cacheKey, result);
        return result;
    }

    calculateAverageDaily(completedTasks, xpData) {
        if (!completedTasks?.length || !xpData?.labels) return 0;
        
        const { startDate, endDate } = this.getDateRange();
        
        const periodTasks = completedTasks.filter(task => {
            const taskDate = new Date(task.completedAt);
            return taskDate >= startDate && taskDate <= endDate;
        });
        
        const totalXP = periodTasks.reduce((sum, task) => 
            sum + this.getTaskXP(task), 0
        );

        return Math.round(totalXP / 7);
    }

    findPeakDay(xpData) {
        if (!xpData?.labels) return null;
        const data = xpData.datasets[0].data;
        const maxXP = Math.max(...data);
        const peakIndex = data.indexOf(maxXP);
        const [month, day] = xpData.labels[peakIndex].split('/');
        const date = new Date(new Date().getFullYear(), Number(month) - 1, Number(day));
        return {
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            xp: maxXP
        };
    }

    getCompletedTasksData(completedTasks, xpData) {
        if (!completedTasks?.length || !xpData?.labels) return null;
        
        const daysMap = this.calculateLast7Days().reduce((acc, day) => {
            acc[day.label] = this.normalizeDate(day.date);
            return acc;
        }, {});
        
        const taskCounts = xpData.labels.reduce((acc, date) => {
            const normalizedDate = daysMap[date];
            acc[date] = completedTasks.filter(task => 
                this.normalizeDate(task.completedAt) === normalizedDate
            ).length;
            return acc;
        }, {});

        return {
            labels: xpData.labels,
            datasets: [{
                label: 'Tasks Completed',
                data: Object.values(taskCounts),
                backgroundColor: this.CHART_COLORS.background,
                borderColor: this.CHART_COLORS.primary,
                borderWidth: 1,
                borderRadius: 5,
            }]
        };
    }

    getMetrics(xpData, periodXP) {
        if (!xpData?.datasets?.[0]?.data) return null;
        const data = xpData.datasets[0].data;
        
        const firstHalf = data.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
        const secondHalf = data.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
        
        const trendPercentage = firstHalf === 0 ? 0 : ((secondHalf - firstHalf) / firstHalf * 100);
        const daysWithActivity = data.filter(xp => xp > 0).length;
        
        return {
            weeklyXP: periodXP,
            trendDirection: secondHalf >= firstHalf ? 'Improving' : 'Decreasing',
            trendPercentage: Math.abs(Math.round(trendPercentage)),
            activeDays: `${daysWithActivity}/7 days`,
            trendDescription: this.getTrendDescription(trendPercentage)
        };
    }

    getTrendDescription(percentage) {
        if (percentage === 0) return 'Maintaining';
        if (percentage > 0) {
            if (percentage > 100) return 'Significant growth';
            if (percentage > 50) return 'Strong growth';
            if (percentage > 20) return 'Steady growth';
            return 'Slight growth';
        } else {
            if (percentage < -100) return 'Sharp decline';
            if (percentage < -50) return 'Significant decline';
            if (percentage < -20) return 'Moderate decline';
            return 'Slight decline';
        }
    }

    clearCache() {
        this.cache.clear();
    }
}

export default DashboardManager;
