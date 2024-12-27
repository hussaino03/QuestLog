import { renderHook, act } from '@testing-library/react';
import useXPManager from '../XPManager';

describe('XPManager Hook Tests', () => {
  test('Level up from 41 to 42 with correct XP', async () => {
    // Calculate total XP needed for level 41
    const xpForLevel41 = Array.from(
      { length: 40 },
      (_, i) => (i + 1) * 200
    ).reduce((a, b) => a + b, 0);
    const { result } = renderHook(() => useXPManager());

    // Set initial XP directly
    await act(async () => {
      result.current.setTotalExperience(xpForLevel41);
    });

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
    const xpForLevel10 = Array.from(
      { length: 9 },
      (_, i) => (i + 1) * 200
    ).reduce((a, b) => a + b, 0);
    const { result } = renderHook(() => useXPManager());

    await act(async () => {
      result.current.setTotalExperience(xpForLevel10);
    });

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
    const xpForLevel10 = Array.from(
      { length: 9 },
      (_, i) => (i + 1) * 200
    ).reduce((a, b) => a + b, 0);
    const { result } = renderHook(() => useXPManager());

    await act(async () => {
      result.current.setTotalExperience(xpForLevel10 + 500);
    });

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
    const initialXP =
      Array.from({ length: 4 }, (_, i) => (i + 1) * 200).reduce(
        (a, b) => a + b,
        0
      ) + 300;
    const { result } = renderHook(() => useXPManager());

    await act(async () => {
      result.current.setTotalExperience(initialXP);
    });

    expect(result.current.level).toBe(5);
    expect(result.current.experience).toBe(300);

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
    const xpForLevel10 = Array.from(
      { length: 9 },
      (_, i) => (i + 1) * 200
    ).reduce((a, b) => a + b, 0);
    const { result } = renderHook(() => useXPManager());

    await act(async () => {
      result.current.setTotalExperience(xpForLevel10 + 500);
    });

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
    const totalXP = 200 + 400 + 150; // XP for level 1 + level 2 + 150
    const { result } = renderHook(() => useXPManager());

    await act(async () => {
      result.current.setTotalExperience(totalXP);
    });

    expect(result.current.getTotalXP()).toBe(totalXP);
    expect(result.current.level).toBe(3);
    expect(result.current.experience).toBe(150);
  });

  test('Get XP needed for next level', async () => {
    const totalXP = 200 + 400 + 150; // Level 3 with 150 experience
    const { result } = renderHook(() => useXPManager());

    await act(async () => {
      result.current.setTotalExperience(totalXP);
    });

    expect(result.current.getXPForNextLevel()).toBe(600); // Level 3 requires 600 XP
  });

  test('Get level progress percentage', async () => {
    const totalXP = 200 + 400 + 150; // Level 3 with 150 experience
    const { result } = renderHook(() => useXPManager());

    await act(async () => {
      result.current.setTotalExperience(totalXP);
    });

    expect(result.current.getLevelProgress()).toBe(25); // 150/600 = 25%
  });

  test('XP calculation with early completion bonus', async () => {
    const initialXP = 1000;
    const { result } = renderHook(() => useXPManager());

    await act(async () => {
      result.current.setTotalExperience(initialXP);
    });

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
    const { result } = renderHook(() => useXPManager());

    await act(async () => {
      result.current.setTotalExperience(initialXP);
    });

    await act(async () => {
      result.current.calculateXP(100, null);
    });

    expect(result.current.getTotalXP()).toBe(initialXP + 100);
  });

  test('XP adjustment when removing completed task with early bonus', async () => {
    const initialXP = 1000;
    const { result } = renderHook(() => useXPManager());

    await act(async () => {
      result.current.setTotalExperience(initialXP);
    });

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const futureDeadline = futureDate.toISOString().split('T')[0];

    let xpResult;
    await act(async () => {
      xpResult = result.current.calculateXP(100, futureDeadline);
    });

    const totalAddedXP = 100 + xpResult.earlyBonus;
    expect(result.current.getTotalXP()).toBe(initialXP + totalAddedXP);

    await act(async () => {
      result.current.calculateXP(-(100 + xpResult.earlyBonus));
    });

    expect(result.current.getTotalXP()).toBe(initialXP);
  });

  test('XP restoration when removing completed task with overdue penalty', async () => {
    const initialXP = 1000;
    const { result } = renderHook(() => useXPManager());

    await act(async () => {
      result.current.setTotalExperience(initialXP);
    });

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);
    const overdueDeadline = pastDate.toISOString().split('T')[0];

    let xpResult;
    await act(async () => {
      xpResult = result.current.calculateXP(100, overdueDeadline);
    });

    const totalAddedXP = 100 + xpResult.overduePenalty;
    expect(result.current.getTotalXP()).toBe(initialXP + totalAddedXP);

    await act(async () => {
      result.current.calculateXP(-(100 + xpResult.overduePenalty));
    });

    expect(result.current.getTotalXP()).toBe(initialXP);
  });
});

describe('Timezone-aware Overdue Tests', () => {
  beforeEach(() => {
    const mockDate = new Date('2024-01-15T12:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('Task becomes overdue at midnight local time', async () => {
    const { result } = renderHook(() => useXPManager());

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const deadline = yesterday.toISOString().split('T')[0];

    let xpResult;
    await act(async () => {
      xpResult = result.current.calculateXP(100, deadline);
    });

    expect(xpResult.overduePenalty).toBe(-5);
  });

  test('Task is not overdue when completed on deadline day', async () => {
    const { result } = renderHook(() => useXPManager());

    const today = new Date();
    const deadline = today.toISOString().split('T')[0];

    let xpResult;
    await act(async () => {
      xpResult = result.current.calculateXP(100, deadline);
    });

    expect(xpResult.overduePenalty).toBe(0);
  });

  test('Task is not overdue when deadline is tomorrow', async () => {
    const { result } = renderHook(() => useXPManager());

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const deadline = tomorrow.toISOString().split('T')[0];

    let xpResult;
    await act(async () => {
      xpResult = result.current.calculateXP(100, deadline);
    });

    expect(xpResult.overduePenalty).toBe(0);
  });

  test('Overdue penalty increases with each day', async () => {
    const { result } = renderHook(() => useXPManager());

    const daysOverdue = 3;
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - daysOverdue);
    const deadline = pastDate.toISOString().split('T')[0];

    let xpResult;
    await act(async () => {
      xpResult = result.current.calculateXP(100, deadline);
    });

    expect(xpResult.overduePenalty).toBe(-5 * daysOverdue);
  });

  test('Overdue calculation handles month boundaries correctly', async () => {
    const { result } = renderHook(() => useXPManager());

    const lastMonth = new Date();
    lastMonth.setDate(0); // Last day of previous month
    const deadline = lastMonth.toISOString().split('T')[0];

    const today = new Date();
    const daysDiff = Math.floor((today - lastMonth) / (1000 * 60 * 60 * 24));

    let xpResult;
    await act(async () => {
      xpResult = result.current.calculateXP(100, deadline);
    });

    expect(xpResult.overduePenalty).toBe(-5 * daysDiff);
  });
});

describe('Task Form XP Calculations', () => {
  test('calculates correct XP for solo task', async () => {
    const { result } = renderHook(() => useXPManager());
    const taskData = {
      difficulty: 50,
      importance: 50,
      collaborative: false
    };

    const expectedXP = (50 + 50 + 20) * 5 + parseInt((50 * 50) / 20);
    const calculatedXP = result.current.calculateBaseXP(
      taskData.difficulty,
      taskData.importance,
      taskData.collaborative
    );

    expect(calculatedXP).toBe(expectedXP);
  });

  test('adds collaborative bonus correctly', async () => {
    const { result } = renderHook(() => useXPManager());
    const taskData = {
      difficulty: 50,
      importance: 50,
      collaborative: true
    };

    const baseXP = (50 + 50 + 20) * 5 + parseInt((50 * 50) / 20);
    const expectedXP = baseXP + 150; // Collaborative bonus
    const calculatedXP = result.current.calculateBaseXP(
      taskData.difficulty,
      taskData.importance,
      taskData.collaborative
    );

    expect(calculatedXP).toBe(expectedXP);
  });

  test('handles edge case XP values', async () => {
    const { result } = renderHook(() => useXPManager());
    
    // Min values - (0 + 0 + 20) * 5 + 0 = 100
    expect(result.current.calculateBaseXP(0, 0, false)).toBe(100);
    
    // Max values calculation:
    // Base: (100 + 100 + 20) * 5 = 1100
    // Difficulty/Importance: (100 * 100) / 20 = 500
    // Collaborative bonus: 150
    // Total: 1100 + 500 + 150 = 1750
    const maxXP = result.current.calculateBaseXP(100, 100, true);
    expect(maxXP).toBe(1750);
  });
});

describe('Project Form XP Calculations', () => {
  test('calculates correct total XP for project with multiple subtasks', async () => {
    const { result } = renderHook(() => useXPManager());
    const projectData = {
      subtasks: [
        { difficulty: 50, importance: 50 },
        { difficulty: 75, importance: 25 }
      ]
    };

    const subtask1XP = (50 + 50 + 20) * 5 + parseInt((50 * 50) / 20);
    const subtask2XP = (75 + 25 + 20) * 5 + parseInt((75 * 25) / 20);
    const expectedTotalXP = subtask1XP + subtask2XP;

    let totalXP = 0;
    await act(async () => {
      totalXP = projectData.subtasks.reduce((sum, task) => {
        return sum + result.current.calculateBaseXP(task.difficulty, task.importance, false);
      }, 0);
    });

    expect(totalXP).toBe(expectedTotalXP);
  });

  test('handles project with single subtask', async () => {
    const { result } = renderHook(() => useXPManager());
    const projectData = {
      subtasks: [
        { difficulty: 50, importance: 50 }
      ]
    };

    const expectedXP = (50 + 50 + 20) * 5 + parseInt((50 * 50) / 20);
    let totalXP = 0;

    await act(async () => {
      totalXP = result.current.calculateBaseXP(
        projectData.subtasks[0].difficulty,
        projectData.subtasks[0].importance,
        false
      );
    });

    expect(totalXP).toBe(expectedXP);
  });

  test('calculates XP for project with varying difficulty levels', async () => {
    const { result } = renderHook(() => useXPManager());
    const projectData = {
      subtasks: [
        { difficulty: 25, importance: 75 }, // Easy but important
        { difficulty: 75, importance: 25 }, // Hard but less important
        { difficulty: 50, importance: 50 }  // Medium balanced
      ]
    };

    let totalXP = 0;
    await act(async () => {
      totalXP = projectData.subtasks.reduce((sum, task) => {
        return sum + result.current.calculateBaseXP(task.difficulty, task.importance, false);
      }, 0);
    });

    // Verify each subtask's XP contribution
    const subtask1XP = (25 + 75 + 20) * 5 + parseInt((25 * 75) / 20);
    const subtask2XP = (75 + 25 + 20) * 5 + parseInt((75 * 25) / 20);
    const subtask3XP = (50 + 50 + 20) * 5 + parseInt((50 * 50) / 20);
    const expectedTotalXP = subtask1XP + subtask2XP + subtask3XP;

    expect(totalXP).toBe(expectedTotalXP);
  });
});

describe('XP Calculation with Form Integration', () => {
  test('maintains XP consistency between task and project forms', async () => {
    const { result } = renderHook(() => useXPManager());
    
    // Same task configured as individual task and as project subtask
    const taskConfig = {
      difficulty: 50,
      importance: 50,
      collaborative: false
    };

    const taskXP = result.current.calculateBaseXP(
      taskConfig.difficulty,
      taskConfig.importance,
      taskConfig.collaborative
    );

    const projectSubtaskXP = result.current.calculateBaseXP(
      taskConfig.difficulty,
      taskConfig.importance,
      false // Projects don't have collaborative bonus per subtask
    );

    expect(taskXP).toBe(projectSubtaskXP);
  });

  test('correctly applies collaborative bonus only to tasks, not projects', async () => {
    const { result } = renderHook(() => useXPManager());
    
    const config = {
      difficulty: 50,
      importance: 50
    };

    const taskXP = result.current.calculateBaseXP(
      config.difficulty,
      config.importance,
      true // Collaborative task
    );

    const projectXP = result.current.calculateBaseXP(
      config.difficulty,
      config.importance,
      false // Project subtask
    );

    expect(taskXP).toBe(projectXP + 150); // Difference should be collaborative bonus
  });
});
