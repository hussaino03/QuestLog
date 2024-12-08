import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import Task from './View';

describe('Task Component Overdue Display', () => {
  const mockTask = {
    id: '1',
    name: 'Test Task',
    desc: 'Test Description',
    difficulty: '50',
    importance: '50',
    collaborative: false,
    experience: 100,
    earlyBonus: 0,
  };

  const mockProps = {
    removeTask: jest.fn(),
    completeTask: jest.fn(),
    updateTask: jest.fn(),
    isCompleted: false,
  };

  test('displays correct overdue XP penalty', () => {
    // Set deadline to 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const deadlineStr = threeDaysAgo.toISOString().split('T')[0];

    const overdueTask = {
      ...mockTask,
      deadline: deadlineStr,
    };

    render(<Task task={overdueTask} {...mockProps} />);

    // Use regex to match text that might be split across elements
    expect(screen.getByText(/OVERDUE \(-10 XP\)/)).toBeInTheDocument();
  });

  test('displays correct overdue XP for longer periods', () => {
    // Set deadline to 10 days ago
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const deadlineStr = tenDaysAgo.toISOString().split('T')[0];

    const overdueTask = {
      ...mockTask,
      deadline: deadlineStr,
    };

    render(<Task task={overdueTask} {...mockProps} />);

    // Use regex to match text that might be split across elements
    expect(screen.getByText(/OVERDUE \(-45 XP\)/)).toBeInTheDocument();
  });

  test('does not display overdue XP for future deadlines', () => {
    // Set deadline to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const deadlineStr = tomorrow.toISOString().split('T')[0];

    const futureTask = {
      ...mockTask,
      deadline: deadlineStr,
    };

    render(<Task task={futureTask} {...mockProps} />);

    // Use queryByText to avoid throwing when element is not found
    expect(screen.queryByText(/OVERDUE/)).toBeNull();
  });
});
