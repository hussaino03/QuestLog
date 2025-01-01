import BadgeManager from '../BadgeManager';
import { checkBadgeUnlocks } from '../../../utils/badges/badgeUtils';
import { BADGES } from '../../../components/Badge/BadgeGrid';

jest.mock('../../../utils/badges/badgeUtils');

describe('BadgeManager', () => {
  let badgeManager;
  let mockSetUnlockedBadges;
  let mockAddNotification;

  beforeEach(() => {
    mockSetUnlockedBadges = jest.fn();
    mockAddNotification = jest.fn();

    const mockStorage = {};
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(
      key => mockStorage[key] || null
    );
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(
      (key, value) => mockStorage[key] = value
    );
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(
      key => delete mockStorage[key]
    );

    badgeManager = new BadgeManager(mockSetUnlockedBadges, mockAddNotification);
    checkBadgeUnlocks.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  describe('Notification History', () => {
    it('should track which badges have shown notifications', () => {
      const badge = 'novice';
      checkBadgeUnlocks.mockReturnValue([badge]);

      // First time should show notification
      badgeManager.checkForNewBadges(5, 0, [], []);
      expect(mockAddNotification).toHaveBeenCalledTimes(1);

      // Second time should not show notification
      mockAddNotification.mockClear();
      badgeManager.checkForNewBadges(5, 0, [], []);
      expect(mockAddNotification).not.toHaveBeenCalled();
    });
  });

  describe('Badge Persistence', () => {
    it('should load previously notified badges from localStorage', () => {
      const previousBadges = ['novice', 'streak_master'];
      localStorage.setItem('notifiedBadges', JSON.stringify(previousBadges));
      
      const newBadgeManager = new BadgeManager(mockSetUnlockedBadges, mockAddNotification);
      
      previousBadges.forEach(badge => {
        expect(newBadgeManager.notifiedBadges.has(badge))
          .toBeTruthy();
      });
    });

    it('should persist newly notified badges to localStorage', () => {
      checkBadgeUnlocks.mockReturnValue(['novice']);
      
      badgeManager.checkForNewBadges(5, 0, [], []);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'notifiedBadges',
        expect.any(String)
      );
      const savedBadges = JSON.parse(
        localStorage.getItem('notifiedBadges')
      );
      expect(savedBadges).toContain('novice');
    });

    it('should clear notification history correctly', () => {
      badgeManager.notifiedBadges.add('test_badge');
      badgeManager.clearNotificationHistory();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('notifiedBadges');
      expect(badgeManager.notifiedBadges.size).toBe(0);
    });
  });

  describe('Badge Unlock Conditions', () => {
    it('should correctly unlock level-based badges', () => {
      const level = 5;
      const expectedBadge = 'novice';
      checkBadgeUnlocks.mockReturnValue([expectedBadge]);

      badgeManager.checkForNewBadges(level, 0, [], []);
      
      expect(checkBadgeUnlocks).toHaveBeenCalledWith(level, 0, 0, []);
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.stringContaining(BADGES[expectedBadge.toUpperCase()].name),
        'achievement',
        expect.any(String)
      );
    });

    it('should correctly unlock streak-based badges', () => {
      const streak = 5;
      const expectedBadge = 'streak_master';
      checkBadgeUnlocks.mockReturnValue([expectedBadge]);

      badgeManager.checkForNewBadges(1, streak, [], []);
      
      expect(checkBadgeUnlocks).toHaveBeenCalledWith(1, streak, 0, []);
      expect(mockSetUnlockedBadges).toHaveBeenCalledWith([expectedBadge]);
    });

    it('should correctly unlock task completion badges', () => {
      const completedTasks = Array(20).fill({ completedAt: new Date().toISOString() });
      const expectedBadge = 'task_achiever';
      checkBadgeUnlocks.mockReturnValue([expectedBadge]);

      badgeManager.checkForNewBadges(1, 0, completedTasks, []);
      
      expect(checkBadgeUnlocks).toHaveBeenCalledWith(1, 0, 20, completedTasks);
      expect(mockSetUnlockedBadges).toHaveBeenCalledWith([expectedBadge]);
    });
  });

  describe('Notification Behavior', () => {
    it('should not notify for already notified badges', () => {
      const badge = 'novice';
      badgeManager.notifiedBadges.add(badge);
      checkBadgeUnlocks.mockReturnValue([badge]);

      badgeManager.checkForNewBadges(5, 0, [], []);
      
      expect(mockAddNotification).not.toHaveBeenCalled();
    });

    it('should notify only for newly unlocked badges', () => {
      const existingBadge = 'novice';
      const newBadge = 'streak_master';
      
      // Set up the test conditions
      checkBadgeUnlocks.mockReturnValue([existingBadge, newBadge]);
      badgeManager.notifiedBadges = new Set([existingBadge]); // Pre-notify existing badge
      
      // Trigger the check
      badgeManager.checkForNewBadges(5, 5, [], [existingBadge]);
      
      // Verify notifications
      expect(mockAddNotification).toHaveBeenCalledTimes(1);
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.stringContaining(BADGES[newBadge.toUpperCase()].name),
        'achievement',
        expect.any(String)
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined or null completed tasks', () => {
      checkBadgeUnlocks.mockReturnValue([]);
      
      expect(() => {
        badgeManager.checkForNewBadges(1, 0, undefined, []);
      }).not.toThrow();
      
      expect(() => {
        badgeManager.checkForNewBadges(1, 0, null, []);
      }).not.toThrow();
    });

    it('should handle corrupt localStorage data', () => {
      const originalError = console.error;
      console.error = jest.fn();
      
      localStorage.setItem('notifiedBadges', 'invalid-json');
      
      const newBadgeManager = new BadgeManager(mockSetUnlockedBadges, mockAddNotification);
      
      expect(newBadgeManager.notifiedBadges.size).toBe(0);
      
      console.error = originalError;
    });

    it('should handle concurrent badge unlocks', () => {
      const multipleBadges = ['novice', 'streak_master', 'task_achiever'];
      checkBadgeUnlocks.mockReturnValue(multipleBadges);

      badgeManager.notifiedBadges.clear();
      
      badgeManager.checkForNewBadges(5, 5, Array(20).fill({}), []);
      
      expect(mockSetUnlockedBadges).toHaveBeenCalledWith(multipleBadges);
      expect(mockAddNotification).toHaveBeenCalledTimes(multipleBadges.length);
    });
  });

  describe('Badge Business Logic', () => {
    it('should unlock multiple level-based badges when reaching higher levels', () => {
      const level = 15;
      const expectedBadges = ['novice', 'intermediate', 'xp_hunter'];
      checkBadgeUnlocks.mockReturnValue(expectedBadges);

      const result = badgeManager.checkForNewBadges(level, 0, [], []);
      
      expect(checkBadgeUnlocks).toHaveBeenCalledWith(level, 0, 0, []);
      expect(result).toEqual(expectedBadges);
      expect(mockAddNotification).toHaveBeenCalledTimes(3);
    });

    it('should handle streak progression badges correctly', () => {
      const streaks = [5, 10, 30];
      const expectedBadges = ['streak_master', 'dedication', 'unstoppable'];
      
      streaks.forEach((streak, index) => {
        const currentBadges = expectedBadges.slice(0, index);
        checkBadgeUnlocks.mockReturnValue([expectedBadges[index]]);
        
        badgeManager.checkForNewBadges(1, streak, [], currentBadges);
        
        expect(checkBadgeUnlocks).toHaveBeenCalledWith(1, streak, 0, []);
      });
    });

    it('should handle task completion milestone badges', () => {
      const tasks = Array(100).fill({ completedAt: new Date().toISOString() });
      const expectedBadges = ['task_achiever', 'task_master'];
      checkBadgeUnlocks.mockReturnValue(expectedBadges);

      const result = badgeManager.checkForNewBadges(1, 0, tasks, []);
      
      expect(checkBadgeUnlocks).toHaveBeenCalledWith(1, 0, 100, tasks);
      expect(result).toEqual(expectedBadges);
    });

    it('should handle time-sensitive badges (early/night/weekend)', () => {
      const timeBasedTasks = [
        { completedAt: '2023-01-01T02:00:00Z', deadline: '2023-01-01T05:00:00Z' }, // Early
        { completedAt: '2023-01-01T23:30:00Z' }, // Night
        { completedAt: '2023-01-07T14:00:00Z' }  // Weekend (Saturday)
      ];
      
      const expectedBadges = ['early_bird', 'night_owl', 'weekend_warrior'];
      checkBadgeUnlocks.mockReturnValue(expectedBadges);

      const result = badgeManager.checkForNewBadges(1, 0, timeBasedTasks, []);
      
      expect(checkBadgeUnlocks).toHaveBeenCalledWith(1, 0, 3, timeBasedTasks);
      expect(result).toEqual(expectedBadges);
    });

    it('should handle daily achievement badges', () => {
      const sameDayTasks = Array(5).fill({
        completedAt: new Date().toISOString()
      });
      const expectedBadge = 'productivity_king';
      checkBadgeUnlocks.mockReturnValue([expectedBadge]);

      const result = badgeManager.checkForNewBadges(1, 0, sameDayTasks, []);
      
      expect(checkBadgeUnlocks).toHaveBeenCalledWith(1, 0, 5, sameDayTasks);
      expect(result).toEqual([expectedBadge]);
    });

    it('should handle precision timing badges', () => {
      const now = new Date();
      const almostDeadlineTasks = Array(10).fill({
        completedAt: now.toISOString(),
        deadline: new Date(now.getTime() + 5 * 60000).toISOString() // 5 minutes later
      });
      
      const expectedBadge = 'perfectionist';
      checkBadgeUnlocks.mockReturnValue([expectedBadge]);

      const result = badgeManager.checkForNewBadges(1, 0, almostDeadlineTasks, []);
      
      expect(checkBadgeUnlocks).toHaveBeenCalledWith(1, 0, 10, almostDeadlineTasks);
      expect(result).toEqual([expectedBadge]);
    });

    it('should handle epic achievement badges', () => {
      const level = 100;
      const streak = 100;
      const tasks = Array(1000).fill({ completedAt: new Date().toISOString() });
      
      const epicBadges = ['grandmaster', 'marathon_runner', 'task_emperor'];
      checkBadgeUnlocks.mockReturnValue(epicBadges);

      const result = badgeManager.checkForNewBadges(level, streak, tasks, []);
      
      expect(checkBadgeUnlocks).toHaveBeenCalledWith(level, streak, 1000, tasks);
      expect(result).toEqual(epicBadges);
      expect(mockAddNotification).toHaveBeenCalledTimes(3);
    });
  });
});
