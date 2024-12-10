import { renderHook, act } from '@testing-library/react';
import useXPManager from './XPManager';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('XPManager Hook Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('Level up from 41 to 42 with correct XP', async () => {
    // Calculate total XP needed for level 41 plus the new XP
    const xpForLevel41 = Array.from({ length: 40 }, (_, i) => (i + 1) * 200).reduce((a, b) => a + b, 0);
    localStorage.setItem('totalExperience', xpForLevel41.toString());

    const { result } = renderHook(() => useXPManager());

    expect(result.current.level).toBe(41);
    expect(result.current.experience).toBe(0);

    await act(async () => {
      result.current.calculateXP(8200);
    });

    expect(result.current.level).toBe(42);
    expect(result.current.experience).toBe(0);
    expect(result.current.showLevelUp).toBe(true);
  });

  test('XP gain without level up', async () => {
    // Calculate total XP needed for level 10
    const xpForLevel10 = Array.from({ length: 9 }, (_, i) => (i + 1) * 200).reduce((a, b) => a + b, 0);
    localStorage.setItem('totalExperience', xpForLevel10.toString());

    const { result } = renderHook(() => useXPManager());

    expect(result.current.level).toBe(10);
    expect(result.current.experience).toBe(0);

    await act(async () => {
      result.current.calculateXP(500);
    });

    expect(result.current.level).toBe(10);
    expect(result.current.experience).toBe(500);
    expect(result.current.showLevelUp).toBe(false);
  });

  test('XP gain with level up', async () => {
    // Calculate total XP needed for level 10 plus 500 experience
    const xpForLevel10 = Array.from({ length: 9 }, (_, i) => (i + 1) * 200).reduce((a, b) => a + b, 0);
    localStorage.setItem('totalExperience', (xpForLevel10 + 500).toString());

    const { result } = renderHook(() => useXPManager());

    expect(result.current.level).toBe(10);
    expect(result.current.experience).toBe(500);

    await act(async () => {
      result.current.calculateXP(1700);
    });

    expect(result.current.level).toBe(11);
    expect(result.current.experience).toBe(200); // 2200 - (10 * 200)
    expect(result.current.showLevelUp).toBe(true);
  });

  test('XP gain with overdue penalty', async () => {
    // Set initial XP at level 5 with 300 experience
    const initialXP = Array.from({ length: 4 }, (_, i) => (i + 1) * 200).reduce((a, b) => a + b, 0) + 300;
    localStorage.setItem('totalExperience', initialXP.toString());

    const { result } = renderHook(() => useXPManager());

    expect(result.current.level).toBe(5);
    expect(result.current.experience).toBe(300);

    // Simulate completing an overdue task with base XP of 100
    // The -5 XP penalty should be applied
    await act(async () => {
      const baseXP = 100;
      const penaltyXP = baseXP - 5; // 95 XP after penalty
      result.current.calculateXP(penaltyXP);
    });

    expect(result.current.level).toBe(5);
    expect(result.current.experience).toBe(395); // 300 + 95
    expect(result.current.getTotalXP()).toBe(initialXP + 95);
  });

  test('Reset functionality', async () => {
    // Set initial total XP for level 10 plus 500 experience
    const xpForLevel10 = Array.from({ length: 9 }, (_, i) => (i + 1) * 200).reduce((a, b) => a + b, 0);
    localStorage.setItem('totalExperience', (xpForLevel10 + 500).toString());

    const { result } = renderHook(() => useXPManager());

    expect(result.current.level).toBe(10);
    expect(result.current.experience).toBe(500);

    await act(async () => {
      result.current.resetXP();
    });

    expect(result.current.level).toBe(1);
    expect(result.current.experience).toBe(0);
    expect(result.current.totalExperience).toBe(0);
    expect(result.current.showLevelUp).toBe(false);
  });

  test('Get total XP', async () => {
    // Set initial total XP that would result in level 3 with 150 experience
    const totalXP = 200 + 400 + 150; // XP for level 1 + level 2 + 150
    localStorage.setItem('totalExperience', totalXP.toString());

    const { result } = renderHook(() => useXPManager());

    expect(result.current.getTotalXP()).toBe(totalXP);
    expect(result.current.level).toBe(3);
    expect(result.current.experience).toBe(150);
  });

  test('Get XP needed for next level', async () => {
    const totalXP = 200 + 400 + 150; // Level 3 with 150 experience
    localStorage.setItem('totalExperience', totalXP.toString());

    const { result } = renderHook(() => useXPManager());

    expect(result.current.getXPForNextLevel()).toBe(600); // Level 3 requires 600 XP
  });

  test('Get level progress percentage', async () => {
    const totalXP = 200 + 400 + 150; // Level 3 with 150 experience
    localStorage.setItem('totalExperience', totalXP.toString());

    const { result } = renderHook(() => useXPManager());

    expect(result.current.getLevelProgress()).toBe(25); // 150/600 = 25%
  });

  test('XP calculation with early completion bonus', async () => {
    const initialXP = 1000;
    localStorage.setItem('totalExperience', initialXP.toString());

    const { result } = renderHook(() => useXPManager());

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const futureDeadline = tomorrow.toISOString().split('T')[0];

    let xpResult;
    await act(async () => {
      xpResult = result.current.calculateXP(100, futureDeadline);
    });

    expect(xpResult.earlyBonus).toBeGreaterThan(0);
    expect(result.current.getTotalXP()).toBeGreaterThan(initialXP + 100);
  });

  test('XP calculation with no deadline', async () => {
    const initialXP = 1000;
    localStorage.setItem('totalExperience', initialXP.toString());

    const { result } = renderHook(() => useXPManager());

    await act(async () => {
      // Base XP of 100, no deadline so no bonus or penalty
      result.current.calculateXP(100, null);
    });

    expect(result.current.getTotalXP()).toBe(initialXP + 100);
  });

  test('XP adjustment when removing completed task with early bonus', async () => {
    const initialXP = 1000;
    localStorage.setItem('totalExperience', initialXP.toString());

    const { result } = renderHook(() => useXPManager());

    // Create a task due in 3 days
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const futureDeadline = futureDate.toISOString().split('T')[0];

    // Simulate completing a task early
    let xpResult;
    await act(async () => {
      // Base XP of 100
      xpResult = result.current.calculateXP(100, futureDeadline);
    });

    const totalAddedXP = 100 + xpResult.earlyBonus;
    expect(result.current.getTotalXP()).toBe(initialXP + totalAddedXP);

    // Now simulate removing that completed task
    await act(async () => {
      // Need to remove both base XP AND early bonus
      result.current.calculateXP(-(100 + xpResult.earlyBonus));
    });

    // Should be exactly back to initial XP
    expect(result.current.getTotalXP()).toBe(initialXP);
  });

  test('XP restoration when removing completed task with overdue penalty', async () => {
    const initialXP = 1000;
    localStorage.setItem('totalExperience', initialXP.toString());

    const { result } = renderHook(() => useXPManager());

    // Create a task that's 2 days overdue
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);
    const overdueDeadline = pastDate.toISOString().split('T')[0];

    // Simulate completing an overdue task
    let xpResult;
    await act(async () => {
      // Base XP of 100, with -10 XP penalty (5 * 2 days)
      xpResult = result.current.calculateXP(100, overdueDeadline);
    });

    const totalAddedXP = 100 + xpResult.overduePenalty;
    expect(result.current.getTotalXP()).toBe(initialXP + totalAddedXP);

    // Now simulate removing that completed task
    await act(async () => {
      // Need to remove both base XP AND overdue penalty
      result.current.calculateXP(-(100 + xpResult.overduePenalty));
    });

    // Should be exactly back to initial XP
    expect(result.current.getTotalXP()).toBe(initialXP);
  });

});

describe('Timezone-aware Overdue Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset to midnight UTC
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('Task becomes overdue at midnight local time', async () => {
    const { result } = renderHook(() => useXPManager());
    
    // Set deadline to yesterday in UTC
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const deadline = yesterday.toISOString().split('T')[0];

    let xpResult;
    await act(async () => {
      xpResult = result.current.calculateXP(100, deadline);
    });

    // Should have -5 XP penalty for 1 day overdue
    expect(xpResult.overduePenalty).toBe(-5);
  });

  test('Task is not overdue when completed on deadline day', async () => {
    const { result } = renderHook(() => useXPManager());
    
    // Set deadline to today in UTC
    const today = new Date();
    const deadline = today.toISOString().split('T')[0];

    let xpResult;
    await act(async () => {
      xpResult = result.current.calculateXP(100, deadline);
    });

    // Should have no penalty when completed on the same day
    expect(xpResult.overduePenalty).toBe(0);
  });

  test('Task is not overdue when deadline is tomorrow', async () => {
    const { result } = renderHook(() => useXPManager());
    
    // Set deadline to tomorrow in UTC
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const deadline = tomorrow.toISOString().split('T')[0];

    let xpResult;
    await act(async () => {
      xpResult = result.current.calculateXP(100, deadline);
    });

    // Should have no penalty for future deadline
    expect(xpResult.overduePenalty).toBe(0);
  });

  test('Overdue penalty increases with each day', async () => {
    const { result } = renderHook(() => useXPManager());
    
    // Test multiple days overdue
    const daysOverdue = 3;
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - daysOverdue);
    const deadline = pastDate.toISOString().split('T')[0];

    let xpResult;
    await act(async () => {
      xpResult = result.current.calculateXP(100, deadline);
    });

    // Penalty should be -5 XP per day overdue
    expect(xpResult.overduePenalty).toBe(-5 * daysOverdue);
  });

  test('Overdue calculation handles month boundaries correctly', async () => {
    const { result } = renderHook(() => useXPManager());
    
    // Set a date in previous month
    const lastMonth = new Date();
    lastMonth.setDate(0); // Last day of previous month
    const deadline = lastMonth.toISOString().split('T')[0];

    const today = new Date();
    const daysDiff = Math.floor((today - lastMonth) / (1000 * 60 * 60 * 24));

    let xpResult;
    await act(async () => {
      xpResult = result.current.calculateXP(100, deadline);
    });

    // Penalty should account for correct number of days across month boundary
    expect(xpResult.overduePenalty).toBe(-5 * daysDiff);
  });

});