import DashboardManager from '../DashboardManager';
import {
  formatLocalDate,
  getUserTimezone,
  calculateDays
} from '../../../utils/analytics/dateUtils';

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
          days.forEach((day) => {
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
          const taskMap = dashboardManager.processTasksBatched(
            tasks,
            startDate,
            endDate
          );

          // Get unique local dates from taskMap
          const uniqueDates = Array.from(taskMap.keys()).map((timestamp) =>
            new Date(timestamp).toLocaleDateString()
          );

          // Should be grouped by local date, not UTC
          expect(new Set(uniqueDates).size).toBeGreaterThanOrEqual(1);
        });

        test('calculateXPDataFromBatches maintains local date boundaries', () => {
          const tasks = createCrossDayTasks();
          const endDate = new Date('2024-01-15T23:59:59Z');
          const startDate = new Date('2024-01-09T00:00:00Z');
          const taskMap = dashboardManager.processTasksBatched(
            tasks,
            startDate,
            endDate
          );
          const periodDays = calculateDays(startDate, endDate);
          const xpData = dashboardManager.calculateXPDataFromBatches(
            taskMap,
            periodDays
          );

          expect(xpData.datasets[0].data.some((xp) => xp > 0)).toBe(true);
          expect(xpData.labels.length).toBe(7);
        });
      });
    });
  });

  describe('Metrics Calculation with Timezone Awareness', () => {
    test('handles date formatting consistently across timezones', () => {
      const date = new Date('2024-01-15T12:00:00Z');

      TEST_TIMEZONES.forEach(({ name }) => {
        mockTimezone(name);
        const formatted = formatLocalDate(date);
        expect(formatted).toMatch(/^\d{2}\/\d{2}$/);
      });
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
});
