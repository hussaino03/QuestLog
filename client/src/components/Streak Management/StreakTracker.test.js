import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StreakTracker from './StreakTracker';

describe('StreakTracker Component', () => {
  const mockToday = new Date('2023-05-15T12:00:00Z');

  beforeEach(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(mockToday);
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

    render(<StreakTracker completedTasks={completedTasks} today={mockToday} />);
    
    const currentStreakElement = screen.getByText('Current').nextElementSibling;
    expect(currentStreakElement).toHaveTextContent('3');
  });

  test('resets current streak when no tasks completed today', () => {
    const completedTasks = [
      { completedAt: '2023-05-13T10:00:00Z' }, // 2 days ago
      { completedAt: '2023-05-12T10:00:00Z' }, // 3 days ago
    ];

    render(<StreakTracker completedTasks={completedTasks} today={mockToday} />);
    
    const currentStreakElement = screen.getByText('Current').nextElementSibling;
    expect(currentStreakElement).toHaveTextContent('0');
  });

  test('handles empty completedTasks array', () => {
    render(<StreakTracker completedTasks={[]} />);
    
    const currentStreakElement = screen.getByText('Current').nextElementSibling;
    const longestStreakElement = screen.getByText('Longest').nextElementSibling;
    expect(currentStreakElement).toHaveTextContent('0');
    expect(longestStreakElement).toHaveTextContent('0');
  });

  test('calculates streak correctly for multiple tasks on the same day', () => {
    const completedTasks = [
      { completedAt: '2023-05-15T10:00:00Z' }, // Today
      { completedAt: '2023-05-15T11:00:00Z' }, // Today
      { completedAt: '2023-05-14T10:00:00Z' }, // Yesterday
      { completedAt: '2023-05-14T11:00:00Z' }, // Yesterday
    ];

    render(<StreakTracker completedTasks={completedTasks} />);
    
    const currentStreakElement = screen.getByText('Current').nextElementSibling;
    expect(currentStreakElement).toHaveTextContent('2');
  });

  test('calculates longest streak correctly', () => {
    const completedTasks = [
      { completedAt: '2023-05-15T10:00:00Z' }, // Today
      { completedAt: '2023-05-14T10:00:00Z' }, // Yesterday
      { completedAt: '2023-05-13T10:00:00Z' }, // 2 days ago
      { completedAt: '2023-05-10T10:00:00Z' }, // 5 days ago
      { completedAt: '2023-05-09T10:00:00Z' }, // 6 days ago
      { completedAt: '2023-05-08T10:00:00Z' }, // 7 days ago
      { completedAt: '2023-05-07T10:00:00Z' }, // 8 days ago
    ];

    render(<StreakTracker completedTasks={completedTasks} today={mockToday} />);
    
    const longestStreakElement = screen.getByText('Longest').nextElementSibling;
    expect(longestStreakElement).toHaveTextContent('4');
  });

  test('starts new streak from 1 after a break, regardless of longest streak', () => {
    // First, simulate a scenario where there was a long streak that ended
    const mockPastDate = new Date('2023-05-10T12:00:00Z');
    jest.setSystemTime(mockPastDate);

    const oldTasks = [
      { completedAt: '2023-05-10T10:00:00Z' }, // Current day for first render
      { completedAt: '2023-05-09T10:00:00Z' },
      { completedAt: '2023-05-08T10:00:00Z' },
      { completedAt: '2023-05-07T10:00:00Z' },
      { completedAt: '2023-05-06T10:00:00Z' }
    ];

    const { rerender } = render(<StreakTracker completedTasks={oldTasks} today={mockPastDate} />);
    
    // Verify the longest streak was recorded
    expect(screen.getByText('Longest').nextElementSibling).toHaveTextContent('5');

    // Now simulate a gap in tasks and a new task being completed
    jest.setSystemTime(mockToday); // Move to current test date

    const tasksAfterBreak = [
      ...oldTasks,
      { completedAt: '2023-05-15T10:00:00Z' } // New task after a break
    ];

    rerender(<StreakTracker completedTasks={tasksAfterBreak} today={mockToday} />);

    // Verify the current streak is 1, not 6
    expect(screen.getByText('Current').nextElementSibling).toHaveTextContent('1');
    // Longest streak should remain 5
    expect(screen.getByText('Longest').nextElementSibling).toHaveTextContent('5');
  });
});