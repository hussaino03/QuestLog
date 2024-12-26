import BadgeManager from '../BadgeManager';
import { checkBadgeUnlocks } from '../../../utils/badges/badgeUtils';

jest.mock('../../../utils/badges/badgeUtils');

describe('BadgeManager', () => {
  let badgeManager;
  let mockSetUnlockedBadges;

  beforeEach(() => {
    mockSetUnlockedBadges = jest.fn();
    badgeManager = new BadgeManager(mockSetUnlockedBadges);
    checkBadgeUnlocks.mockReset();
  });

  describe('checkAndUpdateBadges', () => {
    it('should update badges when new badges are unlocked', () => {
      const currentUnlockedBadges = ['badge1'];
      const newUnlockedBadges = ['badge1', 'badge2'];
      const completedTasks = Array(10).fill({ id: 'task' });

      checkBadgeUnlocks.mockReturnValue(newUnlockedBadges);

      badgeManager.checkAndUpdateBadges(
        5, // level
        3, // currentStreak
        completedTasks, // completedTasks array
        currentUnlockedBadges // current badges
      );

      expect(checkBadgeUnlocks).toHaveBeenCalledWith(
        5, // level
        3, // streak
        10, // tasks length
        completedTasks // tasks array
      );
      expect(mockSetUnlockedBadges).toHaveBeenCalledWith(newUnlockedBadges);
    });

    it('should not update badges when no new badges are unlocked', () => {
      const currentUnlockedBadges = ['badge1'];

      checkBadgeUnlocks.mockReturnValue(['badge1']);

      badgeManager.checkAndUpdateBadges(
        5,
        3,
        Array(10).fill({ id: 'task' }),
        currentUnlockedBadges
      );

      expect(checkBadgeUnlocks).toHaveBeenCalled();
      expect(mockSetUnlockedBadges).not.toHaveBeenCalled();
    });

    it('should handle empty badge arrays', () => {
      const emptyTasks = [];
      checkBadgeUnlocks.mockReturnValue([]);

      badgeManager.checkAndUpdateBadges(1, 0, emptyTasks, []);

      expect(checkBadgeUnlocks).toHaveBeenCalledWith(
        1, // level
        0, // streak
        0, // tasks length
        emptyTasks // tasks array
      );
      expect(mockSetUnlockedBadges).not.toHaveBeenCalled();
    });

    it('should pass correct parameters to checkBadgeUnlocks', () => {
      const completedTasks = Array(5).fill({ id: 'task' });

      badgeManager.checkAndUpdateBadges(
        10, // level
        7, // streak
        completedTasks,
        [] // current badges
      );

      expect(checkBadgeUnlocks).toHaveBeenCalledWith(
        10, // level
        7, // streak
        5, // completed tasks count
        completedTasks
      );
    });

    it('should handle undefined current badges', () => {
      const newUnlockedBadges = ['badge1'];
      checkBadgeUnlocks.mockReturnValue(newUnlockedBadges);

      badgeManager.checkAndUpdateBadges(1, 0, [], undefined);

      expect(checkBadgeUnlocks).toHaveBeenCalled();
      expect(mockSetUnlockedBadges).toHaveBeenCalledWith(newUnlockedBadges);
    });

    it('should handle complex badge state changes', () => {
      const scenarios = [
        {
          current: ['beginner'],
          new: ['beginner', 'intermediate'],
          shouldUpdate: true
        },
        {
          current: ['beginner', 'intermediate'],
          new: ['beginner', 'intermediate'],
          shouldUpdate: false
        },
        {
          current: ['beginner', 'intermediate'],
          new: ['beginner', 'intermediate', 'expert'],
          shouldUpdate: true
        }
      ];

      scenarios.forEach((scenario) => {
        checkBadgeUnlocks.mockReturnValue(scenario.new);

        badgeManager.checkAndUpdateBadges(10, 5, [], scenario.current);

        if (scenario.shouldUpdate) {
          expect(mockSetUnlockedBadges).toHaveBeenCalledWith(scenario.new);
        } else {
          expect(mockSetUnlockedBadges).not.toHaveBeenCalled();
        }

        mockSetUnlockedBadges.mockClear();
      });
    });
  });
});
