import BadgeManager from '../BadgeManager';
import { checkBadgeUnlocks } from '../../../utils/badges/badgeUtils';

jest.mock('../../../utils/badges/badgeUtils');

describe('BadgeManager', () => {
  let badgeManager;
  let mockSetUnlockedBadges;
  let mockAddNotification;

  beforeEach(() => {
    mockSetUnlockedBadges = jest.fn();
    mockAddNotification = jest.fn();
    badgeManager = new BadgeManager(mockSetUnlockedBadges, mockAddNotification);
    checkBadgeUnlocks.mockReset();
  });

  describe('checkForNewBadges', () => {
    it('should update badges when new badges are unlocked', () => {
      const currentUnlockedBadges = ['badge1'];
      const newUnlockedBadges = ['badge1', 'badge2'];
      const completedTasks = Array(10).fill({ id: 'task' });

      checkBadgeUnlocks.mockReturnValue(newUnlockedBadges);

      badgeManager.checkForNewBadges(
        5,
        3,
        completedTasks,
        currentUnlockedBadges
      );

      expect(checkBadgeUnlocks).toHaveBeenCalledWith(
        5,
        3,
        10,
        completedTasks
      );
      expect(mockSetUnlockedBadges).toHaveBeenCalledWith(newUnlockedBadges);
    });

    it('should not update badges when no new badges are unlocked', () => {
      const currentUnlockedBadges = ['badge1'];

      checkBadgeUnlocks.mockReturnValue(['badge1']);

      badgeManager.checkForNewBadges(
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

      badgeManager.checkForNewBadges(1, 0, emptyTasks, []);

      expect(checkBadgeUnlocks).toHaveBeenCalledWith(
        1,
        0,
        0,
        emptyTasks
      );
      expect(mockSetUnlockedBadges).not.toHaveBeenCalled();
    });

    it('should pass correct parameters to checkBadgeUnlocks', () => {
      const completedTasks = Array(5).fill({ id: 'task' });

      badgeManager.checkForNewBadges(
        10,
        7,
        completedTasks,
        []
      );

      expect(checkBadgeUnlocks).toHaveBeenCalledWith(
        10,
        7,
        5,
        completedTasks
      );
    });

    it('should handle undefined current badges', () => {
      const newUnlockedBadges = ['badge1'];
      checkBadgeUnlocks.mockReturnValue(newUnlockedBadges);

      badgeManager.checkForNewBadges(1, 0, [], undefined);

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

        badgeManager.checkForNewBadges(10, 5, [], scenario.current);

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
