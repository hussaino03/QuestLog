import { checkBadgeUnlocks } from '../../utils/badgeManager';

class BadgeManager {
    constructor(setUnlockedBadges) {
        this.setUnlockedBadges = setUnlockedBadges;
    }

    checkAndUpdateBadges(level, currentStreak, completedTasks, currentUnlockedBadges) {
        const tasksLength = Array.isArray(completedTasks) ? completedTasks.length : 0;
        
        const newUnlockedBadges = checkBadgeUnlocks(
            level,
            currentStreak,
            tasksLength,    
            completedTasks  
        );

        if (JSON.stringify(newUnlockedBadges) !== JSON.stringify(currentUnlockedBadges)) {
            this.setUnlockedBadges(newUnlockedBadges);
        }
    }
}

export default BadgeManager;
