import MetricsManager from '../MetricsManager';

describe('MetricsManager', () => {
  let metricsManager;

  beforeEach(() => {
    metricsManager = new MetricsManager();
  });

  describe('getTaskXP', () => {
    it('should calculate total XP with bonus and penalty', () => {
      const task = {
        experience: 100,
        earlyBonus: 20,
        overduePenalty: -10
      };
      expect(metricsManager.getTaskXP(task)).toBe(110);
    });

    it('should handle null/undefined values', () => {
      expect(metricsManager.getTaskXP({})).toBe(0);
      expect(metricsManager.getTaskXP(null)).toBe(0);
      expect(metricsManager.getTaskXP(undefined)).toBe(0);
    });
  });

  describe('findPeakDay', () => {
    it('should find the day with maximum XP', () => {
      const xpData = {
        labels: ['Mon', 'Tue', 'Wed'],
        datasets: [
          {
            data: [10, 30, 20]
          }
        ]
      };
      expect(metricsManager.findPeakDay(xpData)).toEqual({
        date: 'Tue',
        xp: 30
      });
    });

    it('should handle empty data', () => {
      expect(metricsManager.findPeakDay(null)).toEqual({ date: 'N/A', xp: 0 });
      expect(metricsManager.findPeakDay({})).toEqual({ date: 'N/A', xp: 0 });
      expect(metricsManager.findPeakDay({ datasets: [{ data: [] }] })).toEqual({
        date: 'N/A',
        xp: 0
      });
    });
  });

  describe('calculateAverageDaily', () => {
    const tasks = [{ id: 1 }, { id: 2 }];
    const xpData = {
      labels: ['Mon', 'Tue', 'Wed'],
      datasets: [{ data: [10, 20, 30] }]
    };

    it('should calculate correct average', () => {
      const dateRange = {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-03')
      };
      expect(
        metricsManager.calculateAverageDaily(tasks, xpData, dateRange)
      ).toBe(20);
    });

    it('should handle invalid inputs', () => {
      expect(metricsManager.calculateAverageDaily([], xpData, {})).toBe(0);
      expect(metricsManager.calculateAverageDaily(null, null, {})).toBe(0);
    });
  });

  describe('getMetrics', () => {
    it('should handle empty data', () => {
      const result = metricsManager.getMetrics(null, 0, 7);
      expect(result).toEqual({
        weeklyXP: 0,
        trendDirection: 'Maintaining',
        trendPercentage: 0,
        activeDays: '0/7',
        trendDescription: 'No activity',
        periodLabel: '7-Day XP Total',
        compareSegmentSize: 2
      });
    });

    it('should calculate metrics for normal activity', () => {
      const xpData = {
        datasets: [
          {
            data: [10, 20, 30, 40, 50, 60]
          }
        ]
      };
      const result = metricsManager.getMetrics(xpData, 210, 6);
      expect(result.weeklyXP).toBe(210);
      expect(result.activeDays).toBe('6/6');
      expect(result.trendDirection).toBe('Improving');
    });

    it('should detect new activity pattern', () => {
      const xpData = {
        datasets: [
          {
            data: [0, 0, 0, 0, 10, 20]
          }
        ]
      };
      const result = metricsManager.getMetrics(xpData, 30, 6);
      expect(result.trendDescription).toBe('New activity');
    });

    it('should handle declining trends', () => {
      const xpData = {
        datasets: [
          {
            data: [50, 40, 30, 20, 10, 5]
          }
        ]
      };
      const result = metricsManager.getMetrics(xpData, 155, 6);
      expect(result.trendDirection).toBe('Decreasing');
    });
  });

  describe('getTrendDescription', () => {
    const testCases = [
      { input: 0, expected: 'No change' },
      { input: 10, expected: 'Slight growth' },
      { input: 30, expected: 'Steady growth' },
      { input: 60, expected: 'Strong growth' },
      { input: 120, expected: 'Significant growth' },
      { input: -10, expected: 'Slight decline' },
      { input: -30, expected: 'Moderate decline' },
      { input: -60, expected: 'Significant decline' },
      { input: -120, expected: 'Sharp decline' }
    ];

    testCases.forEach(({ input, expected }) => {
      it(`should return "${expected}" for ${input}% change`, () => {
        expect(metricsManager.getTrendDescription(input)).toBe(expected);
      });
    });
  });

  describe('cache functionality', () => {
    it('should handle cache operations', () => {
      const key = 'test-key';
      const value = { data: 'test' };

      metricsManager.setCacheItem(key, value);
      expect(metricsManager.getCacheItem(key)).toEqual(value);

      metricsManager.clearCache();
      expect(metricsManager.getCacheItem(key)).toBeNull();
    });

    it('should expire cache items', () => {
      jest.useFakeTimers();
      const key = 'test-key';

      metricsManager.setCacheItem(key, 'test');

      // Move time forward past cache timeout
      jest.advanceTimersByTime(6 * 60 * 1000);

      expect(metricsManager.getCacheItem(key)).toBeNull();
      jest.useRealTimers();
    });
  });
});
