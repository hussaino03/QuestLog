import { calculateBadgeProgress, checkBadgeUnlocks } from '../badgeUtils';
import { BADGES } from '../../../components/Badge/BadgeGrid';

describe('badgeUtils', () => {
  describe('calculateBadgeProgress', () => {
    describe('Level-based badges', () => {
      it('should calculate progress for level badges correctly', () => {
        const noviceBadge = BADGES.NOVICE; // Level 5
        expect(calculateBadgeProgress(noviceBadge, 0)).toBe(0);
        expect(calculateBadgeProgress(noviceBadge, 2.5)).toBe(50);
        expect(calculateBadgeProgress(noviceBadge, 5)).toBe(100);
      });

      it('should not exceed 100% progress', () => {
        const noviceBadge = BADGES.NOVICE; // Level 5
        expect(calculateBadgeProgress(noviceBadge, 10)).toBe(100);
        expect(calculateBadgeProgress(noviceBadge, 100)).toBe(100);
      });

      it('should handle decimal levels', () => {
        const badge = { level: 10 };
        expect(calculateBadgeProgress(badge, 2.5)).toBe(25);
        expect(calculateBadgeProgress(badge, 7.33)).toBeCloseTo(73.3, 1);
      });
    });

    describe('Streak-based badges', () => {
      it('should calculate streak progress correctly', () => {
        const consistentBadge = BADGES.STREAK_MASTER; // 5-day streak
        expect(calculateBadgeProgress(consistentBadge, 0, 0)).toBe(0);
        expect(calculateBadgeProgress(consistentBadge, 0, 3)).toBe(60);
        expect(calculateBadgeProgress(consistentBadge, 0, 5)).toBe(100);
      });

      it('should handle long streaks', () => {
        const unstoppableBadge = BADGES.UNSTOPPABLE; // 30-day streak
        expect(calculateBadgeProgress(unstoppableBadge, 0, 15)).toBe(50);
        expect(calculateBadgeProgress(unstoppableBadge, 0, 30)).toBe(100);
        expect(calculateBadgeProgress(unstoppableBadge, 0, 60)).toBe(100);
      });
    });

    describe('Task completion badges', () => {
      it('should calculate task completion progress', () => {
        const achieverBadge = BADGES.TASK_ACHIEVER; // 20 tasks
        expect(calculateBadgeProgress(achieverBadge, 0, 0, 0)).toBe(0);
        expect(calculateBadgeProgress(achieverBadge, 0, 0, 10)).toBe(50);
        expect(calculateBadgeProgress(achieverBadge, 0, 0, 20)).toBe(100);
      });

      it('should handle large task counts', () => {
        const legendaryBadge = BADGES.LEGENDARY; // 100 tasks
        expect(calculateBadgeProgress(legendaryBadge, 0, 0, 50)).toBe(50);
        expect(calculateBadgeProgress(legendaryBadge, 0, 0, 100)).toBe(100);
      });
    });

    describe('Early completion badges', () => {
      it('should calculate early completion progress', () => {
        const earlyBirdBadge = BADGES.EARLY_BIRD; // 5 early completions
        const tasks = [
          {
            completedAt: '2023-01-01T10:00:00Z',
            deadline: '2023-01-01T15:00:00Z'
          },
          {
            completedAt: '2023-01-02T10:00:00Z',
            deadline: '2023-01-02T15:00:00Z'
          },
          {
            completedAt: '2023-01-03T10:00:00Z',
            deadline: '2023-01-03T15:00:00Z'
          }
        ];
        expect(calculateBadgeProgress(earlyBirdBadge, 0, 0, 0, tasks)).toBe(60);
      });

      it('should only count tasks completed before deadline', () => {
        const badge = { earlyCompletions: 5 };
        const tasks = [
          {
            completedAt: '2023-01-01T10:00:00Z',
            deadline: '2023-01-01T09:00:00Z'
          }, // Late
          {
            completedAt: '2023-01-02T10:00:00Z',
            deadline: '2023-01-02T15:00:00Z'
          } // Early
        ];
        expect(calculateBadgeProgress(badge, 0, 0, 0, tasks)).toBe(20);
      });

      it('should handle empty task arrays', () => {
        const earlyBirdBadge = BADGES.EARLY_BIRD;
        expect(calculateBadgeProgress(earlyBirdBadge, 0, 0, 0, [])).toBe(0);
      });
    });

    describe('Night owl badges', () => {
      it('should calculate night completion progress', () => {
        const nightOwlBadge = BADGES.NIGHT_OWL; // 5 night completions
        // Use local time that matches the criteria: 22:00-23:59 or 00:00-04:00
        const tasks = [
          { completedAt: new Date(2023, 0, 1, 22, 30).toISOString() }, // 10:30 PM
          { completedAt: new Date(2023, 0, 1, 23, 0).toISOString() }, // 11 PM
          { completedAt: new Date(2023, 0, 2, 2, 0).toISOString() }, // 2 AM
          { completedAt: new Date(2023, 0, 2, 14, 0).toISOString() } // 2 PM (not night)
        ];
        expect(calculateBadgeProgress(nightOwlBadge, 0, 0, 0, tasks)).toBe(60);
      });

      it('should count hours between 10 PM and 4 AM', () => {
        const badge = { nightCompletions: 10 };
        const tasks = [
          { completedAt: new Date(2023, 0, 1, 22, 0).toISOString() }, // 10 PM - YES
          { completedAt: new Date(2023, 0, 1, 23, 59).toISOString() }, // 11:59 PM - YES
          { completedAt: new Date(2023, 0, 2, 0, 0).toISOString() }, // 12 AM - YES
          { completedAt: new Date(2023, 0, 2, 4, 0).toISOString() }, // 4 AM - YES
          { completedAt: new Date(2023, 0, 2, 5, 0).toISOString() }, // 5 AM - NO
          { completedAt: new Date(2023, 0, 2, 21, 59).toISOString() } // 9:59 PM - NO
        ];
        expect(calculateBadgeProgress(badge, 0, 0, 0, tasks)).toBe(40);
      });
    });

    describe('Daily achievement badges', () => {
      it('should calculate tasks per day progress', () => {
        const multitaskerBadge = BADGES.MULTITASKER; // 3 tasks in one day
        const tasks = [
          { completedAt: '2023-01-01T10:00:00Z' },
          { completedAt: '2023-01-01T14:00:00Z' },
          { completedAt: '2023-01-01T18:00:00Z' }
        ];
        expect(calculateBadgeProgress(multitaskerBadge, 0, 0, 0, tasks)).toBe(
          100
        );
      });

      it('should use the day with maximum tasks', () => {
        const badge = { tasksPerDay: 5 };
        const tasks = [
          { completedAt: '2023-01-01T10:00:00Z' },
          { completedAt: '2023-01-01T11:00:00Z' }, // Day 1: 2 tasks
          { completedAt: '2023-01-02T10:00:00Z' },
          { completedAt: '2023-01-02T11:00:00Z' },
          { completedAt: '2023-01-02T12:00:00Z' } // Day 2: 3 tasks
        ];
        expect(calculateBadgeProgress(badge, 0, 0, 0, tasks)).toBe(60);
      });

      it('should return 0 for empty tasks', () => {
        const badge = { tasksPerDay: 5 };
        expect(calculateBadgeProgress(badge, 0, 0, 0, [])).toBe(0);
      });
    });

    describe('Weekend warrior badges', () => {
      it('should calculate weekend completion progress', () => {
        const weekendBadge = BADGES.WEEKEND_WARRIOR; // 10 weekend tasks
        const tasks = [
          { completedAt: '2023-01-07T10:00:00Z' }, // Saturday
          { completedAt: '2023-01-08T10:00:00Z' }, // Sunday
          { completedAt: '2023-01-09T10:00:00Z' } // Monday (not weekend)
        ];
        expect(calculateBadgeProgress(weekendBadge, 0, 0, 0, tasks)).toBe(20);
      });

      it('should only count Saturday and Sunday', () => {
        const badge = { weekendCompletions: 5 };
        const tasks = [
          { completedAt: '2023-01-06T10:00:00Z' }, // Friday - NO
          { completedAt: '2023-01-07T10:00:00Z' }, // Saturday - YES
          { completedAt: '2023-01-08T10:00:00Z' }, // Sunday - YES
          { completedAt: '2023-01-09T10:00:00Z' } // Monday - NO
        ];
        expect(calculateBadgeProgress(badge, 0, 0, 0, tasks)).toBe(40);
      });
    });

    describe('Deadline precision badges', () => {
      it('should calculate exact deadline completion progress', () => {
        const perfectionistBadge = BADGES.PERFECTIONIST; // 10 exact deadlines
        const now = new Date('2023-01-01T12:00:00Z');
        const tasks = [
          {
            completedAt: now.toISOString(),
            deadline: new Date(now.getTime() + 30 * 60000).toISOString()
          }, // 30 min before - YES
          {
            completedAt: now.toISOString(),
            deadline: new Date(now.getTime() + 90 * 60000).toISOString()
          } // 90 min before - NO
        ];
        expect(calculateBadgeProgress(perfectionistBadge, 0, 0, 0, tasks)).toBe(
          10
        );
      });

      it('should only count tasks within 1 hour of deadline', () => {
        const badge = { exactDeadlines: 5 };
        const now = new Date('2023-01-01T12:00:00Z');
        const tasks = [
          {
            completedAt: now.toISOString(),
            deadline: new Date(now.getTime() + 59 * 60000).toISOString()
          }, // 59 min - YES
          {
            completedAt: now.toISOString(),
            deadline: new Date(now.getTime() + 61 * 60000).toISOString()
          } // 61 min - NO
        ];
        expect(calculateBadgeProgress(badge, 0, 0, 0, tasks)).toBe(20);
      });
    });

    describe('Edge cases', () => {
      it('should return 0 for badges without requirements', () => {
        const emptyBadge = { id: 'test', name: 'Test' };
        expect(calculateBadgeProgress(emptyBadge)).toBe(0);
      });

      it('should handle undefined/null parameters', () => {
        const levelBadge = { level: 5 };
        expect(calculateBadgeProgress(levelBadge, undefined)).toBe(0);
        expect(calculateBadgeProgress(levelBadge, null)).toBe(0);
      });

      it('should handle empty tasks array for time-based badges', () => {
        const earlyBadge = { earlyCompletions: 5 };
        expect(calculateBadgeProgress(earlyBadge, 0, 0, 0, [])).toBe(0);
      });

      it('should handle tasks without required fields', () => {
        const nightBadge = { nightCompletions: 5 };
        const invalidTasks = [{ id: 1 }, { id: 2 }];
        expect(() =>
          calculateBadgeProgress(nightBadge, 0, 0, 0, invalidTasks)
        ).not.toThrow();
      });
    });
  });

  describe('checkBadgeUnlocks', () => {
    describe('Level achievements', () => {
      it('should unlock novice badge at level 5', () => {
        const badges = checkBadgeUnlocks(5, 0, 0, []);
        expect(badges).toContain('novice');
      });

      it('should unlock multiple level badges', () => {
        const badges = checkBadgeUnlocks(15, 0, 0, []);
        expect(badges).toContain('novice');
        expect(badges).toContain('intermediate');
        expect(badges).toContain('xp_hunter');
      });

      it('should unlock grandmaster badge at level 100', () => {
        const badges = checkBadgeUnlocks(100, 0, 0, []);
        expect(badges).toContain('grandmaster');
      });

      it('should not unlock badges before reaching level', () => {
        const badges = checkBadgeUnlocks(4, 0, 0, []);
        expect(badges).not.toContain('novice');
      });
    });

    describe('Streak achievements', () => {
      it('should unlock streak badges at milestones', () => {
        const badges5 = checkBadgeUnlocks(1, 5, 0, []);
        expect(badges5).toContain('streak_master');

        const badges10 = checkBadgeUnlocks(1, 10, 0, []);
        expect(badges10).toContain('dedication');

        const badges30 = checkBadgeUnlocks(1, 30, 0, []);
        expect(badges30).toContain('unstoppable');
      });

      it('should unlock marathon runner at 100-day streak', () => {
        const badges = checkBadgeUnlocks(1, 100, 0, []);
        expect(badges).toContain('marathon_runner');
      });
    });

    describe('Task completion achievements', () => {
      it('should unlock task badges at milestones', () => {
        const badges20 = checkBadgeUnlocks(1, 0, 20, []);
        expect(badges20).toContain('task_achiever');

        const badges50 = checkBadgeUnlocks(1, 0, 50, []);
        expect(badges50).toContain('task_master');

        const badges100 = checkBadgeUnlocks(1, 0, 100, []);
        expect(badges100).toContain('legendary');

        const badges1000 = checkBadgeUnlocks(1, 0, 1000, []);
        expect(badges1000).toContain('task_emperor');
      });
    });

    describe('Time-sensitive badges', () => {
      it('should unlock early bird badges', () => {
        const earlyTasks = Array(5)
          .fill()
          .map((_, i) => ({
            completedAt: `2023-01-0${i + 1}T10:00:00Z`,
            deadline: `2023-01-0${i + 1}T15:00:00Z`
          }));

        const badges = checkBadgeUnlocks(1, 0, 5, earlyTasks);
        expect(badges).toContain('early_bird');
      });

      it('should unlock night owl badges', () => {
        const nightTasks = Array(5)
          .fill()
          .map((_, i) => ({
            completedAt: new Date(2023, 0, i + 1, 23, 0).toISOString() // 11 PM local time
          }));

        const badges = checkBadgeUnlocks(1, 0, 5, nightTasks);
        expect(badges).toContain('night_owl');
      });

      it('should unlock weekend warrior badges', () => {
        // Jan 7, 2023 is a Saturday, Jan 8 is Sunday
        const weekendTasks = Array(10)
          .fill()
          .map((_, i) => ({
            completedAt: new Date(
              2023,
              0,
              7 + (i % 2) // Alternates between Saturday (7th) and Sunday (8th)
            ).toISOString()
          }));

        const badges = checkBadgeUnlocks(1, 0, 10, weekendTasks);
        expect(badges).toContain('weekend_warrior');
      });
    });

    describe('Daily achievement badges', () => {
      it('should unlock multitasker for 3 tasks in one day', () => {
        const sameDayTasks = Array(3)
          .fill()
          .map((_, i) => ({
            completedAt: `2023-01-01T${10 + i}:00:00Z`
          }));

        const badges = checkBadgeUnlocks(1, 0, 3, sameDayTasks);
        expect(badges).toContain('multitasker');
      });

      it('should unlock productivity king for 5 tasks in one day', () => {
        const sameDayTasks = Array(5)
          .fill()
          .map((_, i) => ({
            completedAt: `2023-01-01T${10 + i}:00:00Z`
          }));

        const badges = checkBadgeUnlocks(1, 0, 5, sameDayTasks);
        expect(badges).toContain('productivity_king');
      });
    });

    describe('Precision timing badges', () => {
      it('should unlock perfectionist badge', () => {
        const now = new Date('2023-01-01T12:00:00Z');
        const precisionTasks = Array(10)
          .fill()
          .map((_, i) => ({
            completedAt: new Date(
              now.getTime() + i * 24 * 60 * 60000
            ).toISOString(),
            deadline: new Date(
              now.getTime() + i * 24 * 60 * 60000 + 30 * 60000
            ).toISOString()
          }));

        const badges = checkBadgeUnlocks(1, 0, 10, precisionTasks);
        expect(badges).toContain('perfectionist');
      });
    });

    describe('Combined achievements', () => {
      it('should unlock multiple badge types simultaneously', () => {
        const tasks = Array(50)
          .fill()
          .map((_, i) => ({
            completedAt: `2023-01-0${Math.floor(i / 2) + 1}T10:00:00Z`,
            deadline: `2023-01-0${Math.floor(i / 2) + 1}T15:00:00Z`
          }));

        const badges = checkBadgeUnlocks(25, 30, 50, tasks);

        expect(badges).toContain('elite'); // Level 25
        expect(badges).toContain('unstoppable'); // 30-day streak
        expect(badges).toContain('task_master'); // 50 tasks
      });
    });

    describe('Edge cases', () => {
      it('should handle zero values', () => {
        const badges = checkBadgeUnlocks(0, 0, 0, []);
        expect(Array.isArray(badges)).toBe(true);
        expect(badges.length).toBeGreaterThanOrEqual(0);
      });

      it('should handle undefined parameters', () => {
        expect(() =>
          checkBadgeUnlocks(undefined, undefined, undefined)
        ).not.toThrow();
      });

      it('should handle null parameters', () => {
        const badges = checkBadgeUnlocks(null, null, null, []);
        expect(Array.isArray(badges)).toBe(true);
      });

      it('should return unique badge IDs', () => {
        const badges = checkBadgeUnlocks(100, 100, 1000, []);
        const uniqueBadges = [...new Set(badges)];
        expect(badges.length).toBe(uniqueBadges.length);
      });

      it('should handle empty completedTasks array', () => {
        const badges = checkBadgeUnlocks(15, 5, 0, []);
        expect(badges).toContain('novice');
        expect(badges).toContain('intermediate');
        expect(badges).toContain('xp_hunter');
        expect(badges).toContain('streak_master');
      });

      it('should handle tasks without timestamps', () => {
        const malformedTasks = [{ id: 1 }, { id: 2 }, { id: 3 }];
        expect(() => checkBadgeUnlocks(5, 5, 3, malformedTasks)).not.toThrow();
      });
    });
  });
});
