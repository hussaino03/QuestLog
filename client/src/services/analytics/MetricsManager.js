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
        if (!task) return 0;
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
        if (!completedTasks?.length || !xpData?.labels || !dateRange.startDate || !dateRange.endDate) return 0;
        
        // Get total XP across all days
        const totalXP = xpData.datasets[0].data.reduce((sum, xp) => sum + xp, 0);
        
        const daysDiff = Math.floor((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        
        return Math.round(totalXP / daysDiff);
    }

    getMetrics(xpData, periodXP, days = 7) {
        const totalDays = xpData?.datasets?.[0]?.data?.length || days;
        const segmentSize = Math.max(1, Math.floor(totalDays / 3));

        if (!xpData?.datasets?.[0]?.data?.length) {
            return {
                weeklyXP: 0,
                trendDirection: 'Maintaining',
                trendPercentage: 0,
                activeDays: `0/${totalDays}`,
                trendDescription: 'No activity',
                periodLabel: `${totalDays}-Day XP Total`,
                compareSegmentSize: segmentSize
            };
        }
        
        const data = xpData.datasets[0].data;
        const daysWithActivity = data.filter(xp => xp > 0).length;
        
        const firstSegment = data.slice(0, segmentSize).reduce((sum, val) => sum + val, 0);
        const lastSegment = data.slice(-segmentSize).reduce((sum, val) => sum + val, 0);
        
        if (firstSegment === 0 && lastSegment > 0) {
            return {
                weeklyXP: periodXP,
                trendDirection: 'Improving',
                trendPercentage: 100,
                activeDays: `${daysWithActivity}/${totalDays}`,
                trendDescription: 'New activity',
                periodLabel: `${totalDays}-Day XP Total`,
                compareSegmentSize: segmentSize
            };
        }
        
        // If both segments are empty, it's "no activity"
        if (firstSegment === 0 && lastSegment === 0) {
            return {
                weeklyXP: periodXP,
                trendDirection: 'Maintaining',
                trendPercentage: 0,
                activeDays: `${daysWithActivity}/${totalDays}`,
                trendDescription: 'No activity',
                periodLabel: `${totalDays}-Day XP Total`,
                compareSegmentSize: segmentSize
            };
        }
        
        const trendPercentage = ((lastSegment - firstSegment) / firstSegment * 100);
        
        return {
            weeklyXP: periodXP,
            trendDirection: lastSegment >= firstSegment ? 'Improving' : 'Decreasing',
            trendPercentage: Math.abs(Math.round(trendPercentage)),
            activeDays: `${daysWithActivity}/${totalDays}`,
            trendDescription: this.getTrendDescription(trendPercentage),
            periodLabel: `${totalDays}-Day XP Total`,
            compareSegmentSize: segmentSize
        };
    }

    getTrendDescription(percentage) {
        if (percentage === 0) return 'No change';
        if (percentage === Infinity) return 'New activity'; 
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
