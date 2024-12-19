import StreakManager from '../StreakManager';

describe('StreakManager', () => {
    const mockSetCurrentStreak = jest.fn();
    const mockToday = new Date('2023-05-15T12:00:00Z');
    let streakManager;

    beforeEach(() => {
        jest.useFakeTimers('modern');
        jest.setSystemTime(mockToday);
        streakManager = new StreakManager(mockSetCurrentStreak);
        mockSetCurrentStreak.mockClear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('calculates current streak correctly', () => {
        const completedTasks = [
            { completedAt: '2023-05-15T10:00:00Z' }, // Today
            { completedAt: '2023-05-14T10:00:00Z' }, // Yesterday
            { completedAt: '2023-05-13T10:00:00Z' }, // 2 days ago
            { completedAt: '2023-05-11T10:00:00Z' }, // 4 days ago (break in streak)
        ];

        const result = streakManager.calculateStreak(completedTasks, mockToday);
        
        expect(result.current).toBe(3);
        expect(mockSetCurrentStreak).toHaveBeenCalledWith(3);
    });

    test('resets current streak when no tasks completed today', () => {
        const completedTasks = [
            { completedAt: '2023-05-13T10:00:00Z' }, // 2 days ago
            { completedAt: '2023-05-12T10:00:00Z' }, // 3 days ago
        ];

        const result = streakManager.calculateStreak(completedTasks, mockToday);
        
        expect(result.current).toBe(0);
        expect(mockSetCurrentStreak).toHaveBeenCalledWith(0);
    });

    test('handles empty completedTasks array', () => {
        const result = streakManager.calculateStreak([]);
        
        expect(result.current).toBe(0);
        expect(result.longest).toBe(0);
        expect(mockSetCurrentStreak).toHaveBeenCalledWith(0);
    });

    test('calculates streak correctly for multiple tasks on the same day', () => {
        const completedTasks = [
            { completedAt: '2023-05-15T10:00:00Z' }, // Today
            { completedAt: '2023-05-15T11:00:00Z' }, // Today
            { completedAt: '2023-05-14T10:00:00Z' }, // Yesterday
            { completedAt: '2023-05-14T11:00:00Z' }, // Yesterday
        ];

        const result = streakManager.calculateStreak(completedTasks);
        
        expect(result.current).toBe(2);
        expect(mockSetCurrentStreak).toHaveBeenCalledWith(2);
    });

    test('calculates longest streak correctly', () => {
        const completedTasks = [
            { completedAt: '2023-05-15T10:00:00Z' }, // Today (part of current 3-day streak)
            { completedAt: '2023-05-14T10:00:00Z' }, // Yesterday
            { completedAt: '2023-05-13T10:00:00Z' }, // 2 days ago
            { completedAt: '2023-05-10T10:00:00Z' }, // 5 days ago (part of previous 4-day streak)
            { completedAt: '2023-05-09T10:00:00Z' }, // 6 days ago
            { completedAt: '2023-05-08T10:00:00Z' }, // 7 days ago
            { completedAt: '2023-05-07T10:00:00Z' }, // 8 days ago
        ];

        const result = streakManager.calculateStreak(completedTasks, mockToday);
        
        expect(result.current).toBe(3);
        expect(result.longest).toBe(4);
        expect(mockSetCurrentStreak).toHaveBeenCalledWith(3);
    });

    test('starts new streak from 1 after a break', () => {
        // First, simulate a scenario where there was a long streak that ended
        const oldTasks = [
            { completedAt: '2023-05-10T10:00:00Z' }, // 5 days ago
            { completedAt: '2023-05-09T10:00:00Z' },
            { completedAt: '2023-05-08T10:00:00Z' },
            { completedAt: '2023-05-07T10:00:00Z' },
            { completedAt: '2023-05-06T10:00:00Z' }
        ];

        let result = streakManager.calculateStreak(oldTasks, mockToday);
        expect(result.longest).toBe(5);
        expect(result.current).toBe(0);

        // Now simulate a new task being completed after the break
        const tasksAfterBreak = [
            ...oldTasks,
            { completedAt: '2023-05-15T10:00:00Z' } // Today
        ];

        result = streakManager.calculateStreak(tasksAfterBreak, mockToday);
        expect(result.current).toBe(1);
        expect(result.longest).toBe(5);
    });
});
