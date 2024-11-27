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

  test('Level up from 41 to 42 with correct XP', () => {
    // Calculate total XP needed for level 41 plus the new XP
    const xpForLevel41 = Array.from({ length: 40 }, (_, i) => (i + 1) * 200).reduce((a, b) => a + b, 0);
    localStorage.setItem('totalExperience', xpForLevel41.toString());

    const { result } = renderHook(() => useXPManager());

    expect(result.current.level).toBe(41);
    expect(result.current.experience).toBe(0);

    act(() => {
      result.current.calculateXP(8200);
    });

    expect(result.current.level).toBe(42);
    expect(result.current.experience).toBe(0);
    expect(result.current.showLevelUp).toBe(true);
  });

  test('XP gain without level up', () => {
    // Calculate total XP needed for level 10
    const xpForLevel10 = Array.from({ length: 9 }, (_, i) => (i + 1) * 200).reduce((a, b) => a + b, 0);
    localStorage.setItem('totalExperience', xpForLevel10.toString());

    const { result } = renderHook(() => useXPManager());

    expect(result.current.level).toBe(10);
    expect(result.current.experience).toBe(0);

    act(() => {
      result.current.calculateXP(500);
    });

    expect(result.current.level).toBe(10);
    expect(result.current.experience).toBe(500);
    expect(result.current.showLevelUp).toBe(false);
  });

  test('XP gain with level up', () => {
    // Calculate total XP needed for level 10 plus 500 experience
    const xpForLevel10 = Array.from({ length: 9 }, (_, i) => (i + 1) * 200).reduce((a, b) => a + b, 0);
    localStorage.setItem('totalExperience', (xpForLevel10 + 500).toString());

    const { result } = renderHook(() => useXPManager());

    expect(result.current.level).toBe(10);
    expect(result.current.experience).toBe(500);

    act(() => {
      result.current.calculateXP(1700);
    });

    expect(result.current.level).toBe(11);
    expect(result.current.experience).toBe(200); // 2200 - (10 * 200)
    expect(result.current.showLevelUp).toBe(true);
  });

  test('XP gain with overdue penalty', () => {
    // Set initial XP at level 5 with 300 experience
    const initialXP = Array.from({ length: 4 }, (_, i) => (i + 1) * 200).reduce((a, b) => a + b, 0) + 300;
    localStorage.setItem('totalExperience', initialXP.toString());

    const { result } = renderHook(() => useXPManager());

    expect(result.current.level).toBe(5);
    expect(result.current.experience).toBe(300);

    // Simulate completing an overdue task with base XP of 100
    // The -5 XP penalty should be applied
    act(() => {
      const baseXP = 100;
      const penaltyXP = baseXP - 5; // 95 XP after penalty
      result.current.calculateXP(penaltyXP);
    });

    expect(result.current.level).toBe(5);
    expect(result.current.experience).toBe(395); // 300 + 95
    expect(result.current.getTotalXP()).toBe(initialXP + 95);
  });

  test('Reset functionality', () => {
    // Set initial total XP for level 10 plus 500 experience
    const xpForLevel10 = Array.from({ length: 9 }, (_, i) => (i + 1) * 200).reduce((a, b) => a + b, 0);
    localStorage.setItem('totalExperience', (xpForLevel10 + 500).toString());

    const { result } = renderHook(() => useXPManager());

    expect(result.current.level).toBe(10);
    expect(result.current.experience).toBe(500);

    act(() => {
      result.current.resetXP();
    });

    expect(result.current.level).toBe(1);
    expect(result.current.experience).toBe(0);
    expect(result.current.totalExperience).toBe(0);
    expect(result.current.showLevelUp).toBe(false);
  });

  test('Get total XP', () => {
    // Set initial total XP that would result in level 3 with 150 experience
    const totalXP = 200 + 400 + 150; // XP for level 1 + level 2 + 150
    localStorage.setItem('totalExperience', totalXP.toString());

    const { result } = renderHook(() => useXPManager());

    expect(result.current.getTotalXP()).toBe(totalXP);
    expect(result.current.level).toBe(3);
    expect(result.current.experience).toBe(150);
  });

  test('Get XP needed for next level', () => {
    const totalXP = 200 + 400 + 150; // Level 3 with 150 experience
    localStorage.setItem('totalExperience', totalXP.toString());

    const { result } = renderHook(() => useXPManager());

    expect(result.current.getXPForNextLevel()).toBe(600); // Level 3 requires 600 XP
  });

  test('Get level progress percentage', () => {
    const totalXP = 200 + 400 + 150; // Level 3 with 150 experience
    localStorage.setItem('totalExperience', totalXP.toString());

    const { result } = renderHook(() => useXPManager());

    expect(result.current.getLevelProgress()).toBe(25); // 150/600 = 25%
  });

 

  test('XP calculation with early completion bonus', () => {
    const initialXP = 1000;
    localStorage.setItem('totalExperience', initialXP.toString());

    const { result } = renderHook(() => useXPManager());

    // Create a task due tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const futureDeadline = tomorrow.toISOString().split('T')[0];

    act(() => {
      // Base XP of 100, should get early completion bonus
      const xpResult = result.current.calculateXP(100, futureDeadline);
      expect(xpResult.earlyBonus).toBeGreaterThan(0);
    });

    expect(result.current.getTotalXP()).toBeGreaterThan(initialXP + 100);
  });

  test('XP calculation with no deadline', () => {
    const initialXP = 1000;
    localStorage.setItem('totalExperience', initialXP.toString());

    const { result } = renderHook(() => useXPManager());

    act(() => {
      // Base XP of 100, no deadline so no bonus or penalty
      result.current.calculateXP(100, null);
    });

    expect(result.current.getTotalXP()).toBe(initialXP + 100);
  });

  test('XP adjustment when removing completed task with early bonus', () => {
    const initialXP = 1000;
    localStorage.setItem('totalExperience', initialXP.toString());

    const { result } = renderHook(() => useXPManager());

    // Create a task due in 3 days
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const futureDeadline = futureDate.toISOString().split('T')[0];

    // Simulate completing a task early
    let xpResult;
    act(() => {
      // Base XP of 100
      xpResult = result.current.calculateXP(100, futureDeadline);
    });

    const totalAddedXP = 100 + xpResult.earlyBonus;
    expect(result.current.getTotalXP()).toBe(initialXP + totalAddedXP);

    // Now simulate removing that completed task
    act(() => {
      // Need to remove both base XP AND early bonus
      result.current.calculateXP(-(100 + xpResult.earlyBonus));
    });

    // Should be exactly back to initial XP
    expect(result.current.getTotalXP()).toBe(initialXP);
  });

  test('XP restoration when removing completed task with overdue penalty', () => {
    const initialXP = 1000;
    localStorage.setItem('totalExperience', initialXP.toString());

    const { result } = renderHook(() => useXPManager());

    // Create a task that's overdue
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);
    const overdueDeadline = pastDate.toISOString().split('T')[0];

    // First simulate completing an overdue task
    let xpResult;
    act(() => {
      // Base XP of 100, with -5 penalty
      xpResult = result.current.calculateXP(100, overdueDeadline);
    });

    expect(result.current.getTotalXP()).toBe(initialXP + 95); // 100 - 5 penalty

    // Now simulate removing that completed task
    act(() => {
      result.current.calculateXP(-95); // Remove the penalized XP amount
    });

    expect(result.current.getTotalXP()).toBe(initialXP);
  });

});