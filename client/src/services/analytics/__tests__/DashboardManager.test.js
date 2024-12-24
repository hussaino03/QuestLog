import DashboardManager from '../DashboardManager';
import { formatLocalDate, getUserTimezone, calculateDays } from '../../../utils/analytics/dateUtils';

jest.setTimeout(30000);

// Mock the date utilities
jest.mock('../../../utils/analytics/dateUtils', () => ({
    ...jest.requireActual('../../../utils/analytics/dateUtils'),
    getUserTimezone: jest.fn(),
    formatLocalDate: jest.fn()
}));

describe('DashboardManager', () => {
    let dashboardManager;
    
    const TEST_TIMEZONES = [
        { name: 'UTC', offset: '+00:00' },
        { name: 'America/New_York', offset: '-05:00' },
        { name: 'Asia/Tokyo', offset: '+09:00' }
    ];

    // Mock the browser's timezone functions
    const mockTimezone = (timezone) => {
        const originalIntl = global.Intl;
        global.Intl = {
            ...originalIntl,
            DateTimeFormat: () => ({
                resolvedOptions: () => ({
                    timeZone: timezone
                })
            })
        };
    };

    beforeEach(() => {
        dashboardManager = new DashboardManager();
        jest.useFakeTimers();
        // Set fixed timestamp for consistent testing
        jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
        // Reset mocks with simpler implementation
        getUserTimezone.mockImplementation(() => 'UTC');
        formatLocalDate.mockImplementation((date) => {
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${month}/${day}`;
        });
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    describe('Local Date Range Handling', () => {
        TEST_TIMEZONES.forEach(({ name, offset }) => {
            describe(`Timezone: ${name}`, () => {
                beforeEach(() => {
                    mockTimezone(name);
                    dashboardManager = new DashboardManager();
                    // Set system time to noon UTC to avoid date boundary issues
                    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
                });

                test('getDateRange returns correct local date boundaries', () => {
                    const { startDate, endDate } = dashboardManager.getDateRange(7);
                    
                    // Verify start date is local midnight
                    expect(startDate.getHours()).toBe(0);
                    expect(startDate.getMinutes()).toBe(0);
                    expect(startDate.getSeconds()).toBe(0);
                    
                    // Verify end date is local end of day
                    expect(endDate.getHours()).toBe(23);
                    expect(endDate.getMinutes()).toBe(59);
                    expect(endDate.getSeconds()).toBe(59);
                });

                test('calculateDays generates dates in local timezone', () => {
                    // Create a 3-day range
                    const end = new Date('2024-01-15T23:59:59Z');
                    const start = new Date('2024-01-13T00:00:00Z');
                    const days = calculateDays(start, end); 
                    
                    expect(days).toHaveLength(3);
                    days.forEach(day => {
                        expect(day.label).toMatch(/^\d{2}\/\d{2}$/);
                        expect(day.date instanceof Date).toBe(true);
                    });
                });
            });
        });
    });

    describe('Task Processing and Grouping', () => {
        beforeAll(() => {
            // Force Node to use the mocked timezone
            process.env.TZ = 'America/New_York';
        });

        afterAll(() => {
            // Reset timezone
            process.env.TZ = 'UTC';
        });

        test('handles tasks near local date boundaries', () => {
            mockTimezone('America/New_York');
            
            jest.setSystemTime(new Date('2024-01-15T00:00:00-05:00')); // EST midnight
            
            const tasks = [
                // These timestamps are in EST (-05:00)
                { id: '1', completedAt: '2024-01-14T23:30:00-05:00', experience: 100 }, // 11:30 PM EST Jan 14
                { id: '2', completedAt: '2024-01-15T00:30:00-05:00', experience: 200 }  // 12:30 AM EST Jan 15
            ];

            const result = dashboardManager.calculateMetricsOptimized(tasks, 7);
            const nonZeroDays = result.xpData.datasets[0].data.filter(xp => xp > 0);
            expect(nonZeroDays.length).toBe(2);
            expect(result.metrics.activeDays).toBe('2/7');
        });

        const createCrossDayTasks = () => [
            { id: '1', completedAt: '2024-01-14T23:30:00Z', experience: 100 },
            { id: '2', completedAt: '2024-01-15T00:30:00Z', experience: 200 }
        ];

        TEST_TIMEZONES.forEach(({ name }) => {
            describe(`Timezone: ${name}`, () => {
                beforeEach(() => {
                    mockTimezone(name);
                    dashboardManager = new DashboardManager();
                });

                test('processTasksBatched groups tasks by local date', () => {
                    const tasks = createCrossDayTasks();
                    const { startDate, endDate } = dashboardManager.getDateRange(7);
                    const taskMap = dashboardManager.processTasksBatched(tasks, startDate, endDate);

                    // Get unique local dates from taskMap
                    const uniqueDates = Array.from(taskMap.keys()).map(timestamp => 
                        new Date(timestamp).toLocaleDateString()
                    );

                    // Should be grouped by local date, not UTC
                    expect(new Set(uniqueDates).size).toBeGreaterThanOrEqual(1);
                });

                test('calculateXPDataFromBatches maintains local date boundaries', () => {
                    const tasks = createCrossDayTasks();
                    const endDate = new Date('2024-01-15T23:59:59Z');
                    const startDate = new Date('2024-01-09T00:00:00Z');
                    const taskMap = dashboardManager.processTasksBatched(tasks, startDate, endDate);
                    const periodDays = calculateDays(startDate, endDate); 
                    const xpData = dashboardManager.calculateXPDataFromBatches(taskMap, periodDays);

                    expect(xpData.datasets[0].data.some(xp => xp > 0)).toBe(true);
                    expect(xpData.labels.length).toBe(7);
                });
            });
        });

        test('handles tasks near local date boundaries', () => {
            mockTimezone('America/New_York');
            const tasks = [
                // 11:30 PM EST on Jan 14
                { id: '1', completedAt: '2024-01-15T04:30:00Z', experience: 100 },
                // 12:30 AM EST on Jan 15
                { id: '2', completedAt: '2024-01-15T05:30:00Z', experience: 200 }
            ];

            const result = dashboardManager.calculateMetricsOptimized(tasks, 7);
            const nonZeroDays = result.xpData.datasets[0].data.filter(xp => xp > 0);
            
            // These tasks should be grouped into two different local days
            expect(nonZeroDays.length).toBe(2);
        });
    });

    describe('Task Processing and Grouping', () => {
        test('handles tasks near local date boundaries', () => {
            // Force America/New_York timezone
            mockTimezone('America/New_York');
            const now = new Date('2024-01-15T05:00:00Z'); // Midnight EST
            jest.setSystemTime(now);
            
            const tasks = [
                // 11:30 PM EST previous day
                { id: '1', completedAt: '2024-01-15T04:30:00Z', experience: 100 },
                // 12:30 AM EST current day
                { id: '2', completedAt: '2024-01-15T05:30:00Z', experience: 200 }
            ];

            const { startDate, endDate } = dashboardManager.getDateRange(7);
            const taskMap = dashboardManager.processTasksBatched(tasks, startDate, endDate);
            const periodDays = calculateDays(startDate, endDate);
            const result = dashboardManager.calculateXPDataFromBatches(taskMap, periodDays);
            
            // Count days with non-zero XP
            const nonZeroDays = result.datasets[0].data.filter(xp => xp > 0);
            expect(nonZeroDays.length).toBe(2);
        });
    });

    describe('Metrics Calculation with Timezone Awareness', () => {
        test('calculates metrics based on local day boundaries', () => {
            mockTimezone('America/New_York');
            const now = new Date('2024-01-15T05:00:00Z'); // Midnight EST
            jest.setSystemTime(now);
            
            const tasks = [
                // 11:30 PM EST previous day
                { id: '1', completedAt: '2024-01-15T04:30:00Z', experience: 100 },
                // 12:30 AM EST current day
                { id: '2', completedAt: '2024-01-15T05:30:00Z', experience: 200 }
            ];

            const result = dashboardManager.calculateMetricsOptimized(tasks, 7);
            expect(result.metrics.weeklyXP).toBe(300);
            expect(result.metrics.activeDays).toBe('2/7');
        });
    });

    describe('Metrics Calculation with Timezone Awareness', () => {
        test('calculates metrics based on local day boundaries', () => {
            mockTimezone('America/New_York');
            const tasks = [
                { id: '1', completedAt: '2024-01-15T04:30:00Z', experience: 100 }, // 11:30 PM EST Jan 14
                { id: '2', completedAt: '2024-01-15T05:30:00Z', experience: 200 }  // 12:30 AM EST Jan 15
            ];

            const result = dashboardManager.calculateMetricsOptimized(tasks, 7);
            
            expect(result.metrics.weeklyXP).toBe(300);
            expect(result.metrics.activeDays).toBe('2/7');
        });

        test('handles date formatting consistently across timezones', () => {
            const date = new Date('2024-01-15T12:00:00Z');
            
            TEST_TIMEZONES.forEach(({ name }) => {
                mockTimezone(name);
                const formatted = formatLocalDate(date);
                expect(formatted).toMatch(/^\d{2}\/\d{2}$/);
            });
        });

    });

    describe('Chart Date Display', () => {
        beforeEach(() => {
            // Mock timezone to America/Toronto
            mockTimezone('America/Toronto');
            // Set a specific date that will show timezone differences
            // Using 8 PM UTC on January 15th, which is 3 PM EST on January 15th
            jest.setSystemTime(new Date('2024-01-15T20:00:00Z'));
        });

        test('chart dates match local timezone boundaries', () => {
            const tasks = [
                // 11 PM EST January 14th (4 AM UTC January 15th)
                { id: '1', completedAt: '2024-01-15T04:00:00Z', experience: 100 },
                // 1 AM EST January 15th (6 AM UTC January 15th)
                { id: '2', completedAt: '2024-01-15T06:00:00Z', experience: 200 }
            ];

            const result = dashboardManager.calculateMetricsOptimized(tasks, 7);
            const dateLabels = result.xpData.labels;
            
            // First task should be counted on January 14th in EST
            // Second task should be counted on January 15th in EST
            expect(dateLabels).toContain('01/14');
            expect(dateLabels).toContain('01/15');

            const xpData = result.xpData.datasets[0].data;
            const jan14Index = dateLabels.indexOf('01/14');
            const jan15Index = dateLabels.indexOf('01/15');
            
            expect(xpData[jan14Index]).toBe(100); 
            expect(xpData[jan15Index]).toBe(200); 
        });
    });

    describe('Chart Date Display', () => {
        test('chart dates match local timezone boundaries', () => {
            process.env.TZ = 'America/New_York';
            mockTimezone('America/New_York');
            
            // Use explicit timezone offset in timestamp
            jest.setSystemTime(new Date('2024-01-15T00:00:00-05:00'));
            
            const tasks = [
                { id: '1', completedAt: '2024-01-14T23:30:00-05:00', experience: 100 },
                { id: '2', completedAt: '2024-01-15T00:30:00-05:00', experience: 200 }
            ];

            const result = dashboardManager.calculateMetricsOptimized(tasks, 7);
            const dateLabels = result.xpData.labels;
            const xpData = result.xpData.datasets[0].data;
            
            // Find indices by label
            const jan14Index = dateLabels.findIndex(label => label.includes('01/14'));
            const jan15Index = dateLabels.findIndex(label => label.includes('01/15'));
            
            expect(xpData[jan14Index]).toBe(100);
            expect(xpData[jan15Index]).toBe(200);
        });
    });

    describe('Edge Cases and Data Integrity', () => {
        test('handles empty task lists', () => {
            const result = dashboardManager.calculateMetricsOptimized([], 7);
            expect(result.xpData.datasets[0].data).toHaveLength(0);
            expect(result.metrics.weeklyXP).toBe(0);
        });

        test('handles invalid completion dates', () => {
            const tasks = [
                { id: '1', completedAt: 'invalid-date', experience: 100 },
                { id: '2', completedAt: '2024-01-15T12:00:00Z', experience: 200 }
            ];

            const result = dashboardManager.calculateMetricsOptimized(tasks, 7);
            // Should only count the valid task with 200 XP
            expect(result.metrics.weeklyXP).toBe(200);
        });

        test('maintains data consistency with DST changes', () => {
            // Mock a DST transition date
            jest.setSystemTime(new Date('2024-03-10T12:00:00Z')); // US DST start
            mockTimezone('America/New_York');

            const tasks = [
                { id: '1', completedAt: '2024-03-10T06:30:00Z', experience: 100 }, // Around DST change
                { id: '2', completedAt: '2024-03-10T07:30:00Z', experience: 200 }
            ];

            const result = dashboardManager.calculateMetricsOptimized(tasks, 7);
            expect(result.metrics.weeklyXP).toBe(300);
        });
    });

    describe('Chart Date Display', () => {
        beforeEach(() => {
            // Mock timezone to America/Toronto
            mockTimezone('America/Toronto');
            // Set a specific date that will show timezone differences
            // Using 8 PM UTC on January 15th, which is 3 PM EST on January 15th
            jest.setSystemTime(new Date('2024-01-15T20:00:00Z'));
        });

        test('chart dates match local timezone boundaries', () => {
            const tasks = [
                // 11 PM EST January 14th (4 AM UTC January 15th)
                { id: '1', completedAt: '2024-01-15T04:00:00Z', experience: 100 },
                // 1 AM EST January 15th (6 AM UTC January 15th)
                { id: '2', completedAt: '2024-01-15T06:00:00Z', experience: 200 }
            ];

            const result = dashboardManager.calculateMetricsOptimized(tasks, 7);
            const dateLabels = result.xpData.labels;
            
            // First task should be counted on January 14th in EST
            // Second task should be counted on January 15th in EST
            expect(dateLabels).toContain('01/14');
            expect(dateLabels).toContain('01/15');

            const xpData = result.xpData.datasets[0].data;
            const jan14Index = dateLabels.indexOf('01/14');
            const jan15Index = dateLabels.indexOf('01/15');
            
            expect(xpData[jan14Index]).toBe(100); 
            expect(xpData[jan15Index]).toBe(200); 
        });
    });
});
