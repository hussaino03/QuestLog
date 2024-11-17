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
});