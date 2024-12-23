import DashboardManager from '../DashboardManager';

// Increase timeout for async tests
jest.setTimeout(30000);

describe('DashboardManager', () => {
    let dashboardManager;
    
    beforeEach(() => {
        dashboardManager = new DashboardManager();
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('Date Range Calculations', () => {
        test('getDateRange returns correct 7-day range', () => {
            const { startDate, endDate } = dashboardManager.getDateRange(7);
            
            const today = new Date('2024-01-15T12:00:00Z');
            const expectedStart = new Date(today);
            expectedStart.setDate(today.getDate() - 6); // 7 days including today
            expectedStart.setHours(0, 0, 0, 0);
            
            const expectedEnd = new Date(today);
            expectedEnd.setHours(23, 59, 59, 999);

            // Compare the dates in local timezone
            const localStartTime = new Date(startDate.toLocaleString()).getTime();
            const localExpectedStartTime = new Date(expectedStart.toLocaleString()).getTime();
            const localEndTime = new Date(endDate.toLocaleString()).getTime();
            const localExpectedEndTime = new Date(expectedEnd.toLocaleString()).getTime();
            
            expect(localStartTime).toBe(localExpectedStartTime);
            expect(localEndTime).toBe(localExpectedEndTime);
        });

        test('calculateDays generates correct array of dates', () => {
            const days = dashboardManager.calculateDays(3);
            
            expect(days).toHaveLength(3);
            expect(days[0].label).toBe('01/13');
            expect(days[2].label).toBe('01/15');
        });
    });

    describe('XP Calculations', () => {
        test('getTaskXP calculates total XP correctly', () => {
            const task = {
                experience: 100,
                earlyBonus: 20,
                overduePenalty: -10
            };

            expect(dashboardManager.getTaskXP(task)).toBe(110);
        });

        test('getTaskXP handles missing values', () => {
            const task = { experience: 100 };
            expect(dashboardManager.getTaskXP(task)).toBe(100);
        });
    });

    describe('Trend Analysis', () => {
        test('getTrendDescription provides accurate descriptions', () => {
            const testCases = [
                { percentage: 120, expected: 'Significant growth' },
                { percentage: 60, expected: 'Strong growth' },
                { percentage: 30, expected: 'Steady growth' },
                { percentage: 10, expected: 'Slight growth' },
                { percentage: 0, expected: 'Maintaining' },
                { percentage: -10, expected: 'Slight decline' },
                { percentage: -30, expected: 'Moderate decline' },
                { percentage: -60, expected: 'Significant decline' },
                { percentage: -120, expected: 'Sharp decline' }
            ];

            testCases.forEach(({ percentage, expected }) => {
                expect(dashboardManager.getTrendDescription(percentage)).toBe(expected);
            });
        });

        test('findPeakDay identifies correct peak', () => {
            const xpData = {
                labels: ['01/13', '01/14', '01/15'],
                datasets: [{
                    data: [100, 200, 150]
                }]
            };

            const peak = dashboardManager.findPeakDay(xpData);
            expect(peak.xp).toBe(200);
        });
    });

    describe('Metrics Calculation', () => {
        test('getMetrics calculates trend correctly', () => {
            const xpData = {
                datasets: [{
                    data: [10, 20, 30, 40, 50, 60, 70]
                }]
            };
            const periodXP = 280;
            const days = 7;

            const metrics = dashboardManager.getMetrics(xpData, periodXP, days);

            expect(metrics.weeklyXP).toBe(280);
            expect(metrics.trendDirection).toBe('Improving');
            expect(metrics.activeDays).toBe('7/7 days');
        });

        test('calculateAverageDaily computes correct average', () => {
            const completedTasks = [
                { completedAt: '2024-01-15T10:00:00Z', experience: 100 },
                { completedAt: '2024-01-14T10:00:00Z', experience: 200 },
                { completedAt: '2024-01-13T10:00:00Z', experience: 300 }
            ];

            const xpData = {
                labels: ['01/13', '01/14', '01/15'],
                datasets: [{ data: [300, 200, 100] } ]
            };

            const average = dashboardManager.calculateAverageDaily(completedTasks, xpData, 7);
            expect(average).toBe(86); // (600 total XP / 7 days)
        });
    });

    describe('Cache Management', () => {
        test('cache functionality works correctly', () => {
            const key = 'test-key';
            const value = { data: 'test-value' };

            dashboardManager.setCacheItem(key, value);
            expect(dashboardManager.getCacheItem(key)).toEqual(value);

            dashboardManager.clearCache();
            expect(dashboardManager.getCacheItem(key)).toBeNull();
        });

        test('cache expires after timeout', () => {
            const key = 'test-key';
            const value = { data: 'test-value' };

            dashboardManager.setCacheItem(key, value);
            
            // Move time forward past cache timeout
            jest.advanceTimersByTime(6 * 60 * 1000); // 6 minutes
            
            expect(dashboardManager.getCacheItem(key)).toBeNull();
        });
    });

    describe('Date and Timezone Handling', () => {
        test('normalizeDate converts to UTC correctly', () => {
            const date = new Date('2024-01-15T15:30:00-05:00'); // 3:30 PM EST
            const normalized = dashboardManager.normalizeDate(date);
            expect(new Date(normalized).toISOString()).toBe('2024-01-15T00:00:00.000Z');
        });

        test('processTasksBatched handles tasks from different timezones', async () => {
            const tasks = [
                // All these timestamps represent the same calendar day in UTC
                { completedAt: '2024-01-15T10:00:00Z' },
                { completedAt: '2024-01-15T20:00:00Z' }
            ];
            const { startDate, endDate } = dashboardManager.getDateRange(7);
            
            const tasksByDate = await dashboardManager.processTasksBatched(tasks, startDate, endDate);
            const normalizedDate = dashboardManager.normalizeDate(new Date('2024-01-15T00:00:00Z'));
            
            // Verify all tasks are grouped under the same UTC day
            expect(tasksByDate.get(normalizedDate)).toHaveLength(2);
        });

        test('calculateXPDataFromBatches preserves UTC date boundaries', async () => {
            const tasks = [
                // Two tasks on consecutive UTC days
                { completedAt: '2024-01-15T12:00:00Z', experience: 100 },
                { completedAt: '2024-01-15T12:00:00Z', experience: 100 }
            ];
            const { startDate, endDate } = dashboardManager.getDateRange(7);
            
            const tasksByDate = await dashboardManager.processTasksBatched(tasks, startDate, endDate);
            const xpData = await dashboardManager.calculateXPDataFromBatches(tasksByDate, 7);
            
            // Verify the XP is recorded on the same day
            const xpForDay = xpData.datasets[0].data.find(xp => xp === 200);
            expect(xpForDay).toBe(200);
        });
    });

    describe('Comprehensive Metrics Testing', () => {
        const mockTasks = [
            // UTC times:
            // Dec 14, 2024 - 02:54 UTC (Dec 13 local EST)
            { id: '1', name: 'Task 1', completedAt: '2024-12-14T02:54:22Z', experience: 100 },
            // Dec 14, 2024 - 19:56 UTC (Dec 14 local EST)
            { id: '2', name: 'Task 2', completedAt: '2024-12-14T19:56:25Z', experience: 200, earlyBonus: 50 },
            // Dec 14, 2024 - 23:12 UTC (Dec 14 local EST)
            { id: '3', name: 'Task 3', completedAt: '2024-12-14T23:12:07Z', experience: 150 },
            // Dec 15, 2024 - 01:30 UTC (Dec 14 local EST)
            { id: '4', name: 'Task 4', completedAt: '2024-12-15T01:30:00Z', experience: 300 },
            // Dec 15, 2024 - 15:45 UTC (Dec 15 local EST)
            { id: '5', name: 'Task 5', completedAt: '2024-12-15T15:45:00Z', experience: 250, earlyBonus: 100 }
        ];

        beforeEach(() => {
            dashboardManager = new DashboardManager();
            // Set system time to Dec 15, 2024
            jest.setSystemTime(new Date('2024-12-15T12:00:00Z'));
        });

        test('calculates daily XP totals correctly in UTC', async () => {
            const { startDate, endDate } = dashboardManager.getDateRange(7);
            const tasksByDate = await dashboardManager.processTasksBatched(mockTasks, startDate, endDate);
            const xpData = await dashboardManager.calculateXPDataFromBatches(tasksByDate, 7);

            // Dec 14 UTC tasks: 100 + 200 + 50 + 150 = 500 XP
            // Dec 15 UTC tasks: 300 + 250 + 100 = 650 XP
            const dec14XP = xpData.datasets[0].data[xpData.labels.indexOf('12/14')];
            const dec15XP = xpData.datasets[0].data[xpData.labels.indexOf('12/15')];

            expect(dec14XP).toBe(500); // Total XP for Dec 14 UTC
            expect(dec15XP).toBe(650); // Total XP for Dec 15 UTC
        });

        test('calculates tasks per day correctly in UTC', async () => {
            const { startDate, endDate } = dashboardManager.getDateRange(7);
            const tasksByDate = await dashboardManager.processTasksBatched(mockTasks, startDate, endDate);
            const tasksData = dashboardManager.calculateTasksDataFromBatches(tasksByDate, 7);

            // Dec 14 UTC: 3 tasks
            // Dec 15 UTC: 2 tasks
            const dec14Count = tasksData.datasets[0].data[tasksData.labels.indexOf('12/14')];
            const dec15Count = tasksData.datasets[0].data[tasksData.labels.indexOf('12/15')];

            expect(dec14Count).toBe(3);
            expect(dec15Count).toBe(2);
        });

        test('identifies peak day correctly', async () => {
            const { startDate, endDate } = dashboardManager.getDateRange(7);
            const tasksByDate = await dashboardManager.processTasksBatched(mockTasks, startDate, endDate);
            const xpData = await dashboardManager.calculateXPDataFromBatches(tasksByDate, 7);

            const peakDay = dashboardManager.findPeakDay(xpData);
            // Dec 15 should be peak with 650 XP
            expect(peakDay.xp).toBe(650);
        });

        test('calculates period metrics correctly', async () => {
            const result = await dashboardManager.calculateMetricsOptimized(mockTasks, 7);
            
            expect(result.metrics).toMatchObject({
                weeklyXP: 1150, // Total XP across all tasks
                activeDays: '2/7 days', // Activity on Dec 14 and 15
            });
            
            // Verify trend direction (should be improving since later days have more XP)
            expect(result.metrics.trendDirection).toBe('Improving');
        });

        test('calculates average daily XP correctly', async () => {
            const result = await dashboardManager.calculateMetricsOptimized(mockTasks, 7);
            const average = dashboardManager.calculateAverageDaily(mockTasks, result.xpData, 7);
            
            // Total XP (1150) / 7 days = ~164
            expect(average).toBe(164);
        });
    });
});
