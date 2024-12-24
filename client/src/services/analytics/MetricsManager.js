class MetricsManager {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

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

    getTaskXP(task) {
        const baseXP = task.experience || 0;
        const bonus = task.earlyBonus || 0;
        const penalty = task.overduePenalty || 0;
        return baseXP + bonus + penalty;
    }

    findPeakDay(xpData) {
        if (!xpData?.datasets?.[0]?.data?.length) return { date: 'N/A', xp: 0 };
        
        const data = xpData.datasets[0].data;
        const maxXP = Math.max(...data);
        if (maxXP === 0) return { date: 'N/A', xp: 0 };

        const peakIndex = data.indexOf(maxXP);
        const label = xpData.labels?.[peakIndex] || 'N/A';

        return { date: label, xp: maxXP };
    }

    calculateAverageDaily(completedTasks, xpData, dateRange) {
        if (!completedTasks?.length || !xpData?.labels) return 0;
        
        const startDate = dateRange.startDate;
        const endDate = dateRange.endDate;
        
        const periodTasks = completedTasks.filter(task => {
            return task.completedAt >= dateRange.startDate.toISOString() && 
                   task.completedAt <= dateRange.endDate.toISOString();
        });
        
        const totalXP = periodTasks.reduce((sum, task) => 
            sum + this.getTaskXP(task), 0
        );

        return Math.round(totalXP / ((endDate - startDate) / (24 * 60 * 60 * 1000)));
    }

    getMetrics(xpData, periodXP, days = 7) {
        if (!xpData?.datasets?.[0]?.data?.length) {
            return {
                weeklyXP: 0,
                trendDirection: 'Maintaining',
                trendPercentage: 0,
                activeDays: `0/${days} days`,
                trendDescription: 'No data',
                periodLabel: `${days === 7 ? '7-Day' : '30-Day'} XP Total`
            };
        }
        
        const data = xpData.datasets[0].data;
        const daysWithActivity = data.filter(xp => xp > 0).length;
        
        // Simplify trend calculation to just compare first and last third
        const segmentSize = Math.floor(days / 3);
        const firstSegment = data.slice(0, segmentSize).reduce((sum, val) => sum + val, 0);
        const lastSegment = data.slice(-segmentSize).reduce((sum, val) => sum + val, 0);
        
        const trendPercentage = firstSegment === 0 ? 0 : ((lastSegment - firstSegment) / firstSegment * 100);
        
        return {
            weeklyXP: periodXP,
            trendDirection: lastSegment >= firstSegment ? 'Improving' : 'Decreasing',
            trendPercentage: Math.abs(Math.round(trendPercentage)),
            activeDays: `${daysWithActivity}/${days} days`,
            trendDescription: this.getTrendDescription(trendPercentage),
            periodLabel: `${days === 7 ? '7-Day' : '30-Day'} XP Total`
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

export default MetricsManager;
