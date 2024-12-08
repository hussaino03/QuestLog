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

    // Create a task that's 2 days overdue
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const overdueDeadline = twoDaysAgo.toISOString().split('T')[0];

    // Simulate completing an overdue task with base XP of 100
    act(() => {
      const baseXP = 100;
      const xpResult = result.current.calculateXP(baseXP, overdueDeadline);
      expect(xpResult.overduePenalty).toBe(-10); // 2 days * -5
      expect(xpResult.totalExperience).toBe(initialXP + baseXP - 10);
    });
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

    // Create a task that's 3 days overdue
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);
    const overdueDeadline = pastDate.toISOString().split('T')[0];

    // First simulate completing an overdue task
    let xpResult;
    act(() => {
      // Base XP of 100, with -15 penalty (3 days * -5)
      xpResult = result.current.calculateXP(100, overdueDeadline);
    });

    expect(result.current.getTotalXP()).toBe(initialXP + 85); // 100 - 15 penalty

    // Now simulate removing that completed task
    act(() => {
      result.current.calculateXP(-85); // Remove the penalized XP amount
    });

    expect(result.current.getTotalXP()).toBe(initialXP);
  });

});

describe('Timezone-aware Overdue Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('Task becomes overdue at midnight local time', () => {
    const { result } = renderHook(() => useXPManager());
    
    // Create a date that's "yesterday" in any timezone
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const deadlineStr = yesterday.toISOString().split('T')[0];
    
    // Task completed today should get penalty
    act(() => {
      const xpResult = result.current.calculateXP(100, deadlineStr);
      expect(xpResult.overduePenalty).toBe(-5); // 1 day overdue = -5
    });
  });

  test('Task is not overdue when completed on deadline day', () => {
    const { result } = renderHook(() => useXPManager());
    
    // Create today's date at start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineStr = today.toISOString().split('T')[0];
    
    // Task completed today should not get penalty
    act(() => {
      const xpResult = result.current.calculateXP(100, deadlineStr);
      expect(xpResult.overduePenalty).toBe(0);
    });
  });

  test('Task is not overdue when deadline is tomorrow', () => {
    const { result } = renderHook(() => useXPManager());
    
    // Create tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const deadlineStr = tomorrow.toISOString().split('T')[0];
    
    act(() => {
      const xpResult = result.current.calculateXP(100, deadlineStr);
      expect(xpResult.overduePenalty).toBe(0);
    });
  });

  test('Overdue calculation works across month boundaries', () => {
    const { result } = renderHook(() => useXPManager());
    
    // Create a date from last month that would be 30 days ago
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setHours(0, 0, 0, 0);
    const deadlineStr = lastMonth.toISOString().split('T')[0];
    
    act(() => {
      const xpResult = result.current.calculateXP(100, deadlineStr);
      // Should be -5 * number of days since last month
      expect(xpResult.overduePenalty).toBe(-150); // Approximately 30 days * -5
    });
  });

  test('Overdue calculation works across year boundaries', () => {
    const { result } = renderHook(() => useXPManager());
    
    // Create a date from last year
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    lastYear.setHours(0, 0, 0, 0);
    const deadlineStr = lastYear.toISOString().split('T')[0];
    
    act(() => {
      const xpResult = result.current.calculateXP(100, deadlineStr);
      expect(xpResult.overduePenalty).toBeLessThan(-1800); // Approximately 365 days * -5
    });
  });

  test('Multiple days overdue still results in same penalty', () => {
    const { result } = renderHook(() => useXPManager());
    
    // Create a date from 5 days ago
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    fiveDaysAgo.setHours(0, 0, 0, 0);
    const deadlineStr = fiveDaysAgo.toISOString().split('T')[0];
    
    act(() => {
      const xpResult = result.current.calculateXP(100, deadlineStr);
      expect(xpResult.overduePenalty).toBe(-25); // 5 days * -5
    });
  });
});

describe('Progressive Overdue Penalty Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('Overdue by 3 days results in -15 XP penalty', () => {
    const { result } = renderHook(() => useXPManager());
    
    // Set deadline to 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const deadlineStr = threeDaysAgo.toISOString().split('T')[0];
    
    act(() => {
      const xpResult = result.current.calculateXP(100, deadlineStr);
      expect(xpResult.overduePenalty).toBe(-15); // 3 days * -5
    });
  });

  test('Overdue by 7 days results in -35 XP penalty', () => {
    const { result } = renderHook(() => useXPManager());
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const deadlineStr = sevenDaysAgo.toISOString().split('T')[0];
    
    act(() => {
      const xpResult = result.current.calculateXP(100, deadlineStr);
      expect(xpResult.overduePenalty).toBe(-35); // 7 days * -5
    });
  });

  test('Overdue by 30 days results in -150 XP penalty', () => {
    const { result } = renderHook(() => useXPManager());
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const deadlineStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    act(() => {
      const xpResult = result.current.calculateXP(100, deadlineStr);
      expect(xpResult.overduePenalty).toBe(-150); // 30 days * -5
    });
  });

  test('Total XP cannot go below 0 even with large overdue penalty', () => {
    const { result } = renderHook(() => useXPManager());
    
    // Set initial XP to 50
    act(() => {
      result.current.calculateXP(50);
    });
    
    // Create task with 100XP but 30 days overdue (-150 penalty)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const deadlineStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    act(() => {
      const xpResult = result.current.calculateXP(100, deadlineStr);
      // Even though penalty is -150, total XP should be 0, not negative
      expect(xpResult.totalExperience).toBe(0);
    });
  });

  test('Overdue penalty is correctly applied when removing task', () => {
    const { result } = renderHook(() => useXPManager());
    
    // Set initial XP to 200
    act(() => {
      result.current.calculateXP(200);
    });
    
    // Complete task that's 5 days overdue
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const deadlineStr = fiveDaysAgo.toISOString().split('T')[0];
    
    let xpResult;
    act(() => {
      xpResult = result.current.calculateXP(100, deadlineStr);
      // Should be 200 + (100 - 25) = 275
      expect(xpResult.totalExperience).toBe(275);
    });
    
    // Remove the task (including penalty)
    act(() => {
      const removeResult = result.current.calculateXP(-(100 + xpResult.overduePenalty));
      // Should be back to 200
      expect(removeResult.totalExperience).toBe(200);
    });
  });
});