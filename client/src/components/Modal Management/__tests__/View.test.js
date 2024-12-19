import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Task from '../View';

describe('Task Component Overdue Tests', () => {
  const mockRemoveTask = jest.fn();
  const mockCompleteTask = jest.fn();
  const mockUpdateTask = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const mockDate = new Date('2024-01-15T12:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  test('displays correct overdue penalty for task 1 day overdue', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const overdueDeadline = yesterday.toISOString().split('T')[0];

    const task = {
      id: '1',
      name: 'Overdue Task',
      desc: 'Test description',
      deadline: overdueDeadline,
      difficulty: 5,
      importance: 5,
      experience: 100,
    };

    render(
      <Task
        task={task}
        removeTask={mockRemoveTask}
        completeTask={mockCompleteTask}
        updateTask={mockUpdateTask}
        isCompleted={false}
      />
    );

    expect(screen.getByText((content, element) => {
      return content.includes('OVERDUE') && content.includes('-5 XP');
    })).toBeInTheDocument();
  });

  test('displays correct overdue penalty for task 3 days overdue', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const overdueDeadline = threeDaysAgo.toISOString().split('T')[0];

    const task = {
      id: '2',
      name: 'Very Overdue Task',
      desc: 'Test description',
      deadline: overdueDeadline,
      difficulty: 5,
      importance: 5,
      experience: 100,
    };

    render(
      <Task
        task={task}
        removeTask={mockRemoveTask}
        completeTask={mockCompleteTask}
        updateTask={mockUpdateTask}
        isCompleted={false}
      />
    );

    expect(screen.getByText('OVERDUE (-15 XP)')).toBeInTheDocument();
  });

  test('does not display overdue penalty for task not yet due', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const futureDeadline = tomorrow.toISOString().split('T')[0];

    const task = {
      id: '3',
      name: 'Future Task',
      desc: 'Test description',
      deadline: futureDeadline,
      difficulty: 5,
      importance: 5,
      experience: 100,
    };

    render(
      <Task
        task={task}
        removeTask={mockRemoveTask}
        completeTask={mockCompleteTask}
        updateTask={mockUpdateTask}
        isCompleted={false}
      />
    );

    expect(screen.queryByText(/OVERDUE/)).not.toBeInTheDocument();
  });

  test('displays correct overdue penalty for completed overdue task', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const overdueDeadline = twoDaysAgo.toISOString().split('T')[0];

    const task = {
      id: '4',
      name: 'Completed Overdue Task',
      desc: 'Test description',
      deadline: overdueDeadline,
      difficulty: 5,
      importance: 5,
      experience: 100,
      overduePenalty: -10 // Penalty for 2 days
    };

    render(
      <Task
        task={task}
        removeTask={mockRemoveTask}
        completeTask={mockCompleteTask}
        updateTask={mockUpdateTask}
        isCompleted={true}
      />
    );

    expect(screen.getByText('-10xp')).toBeInTheDocument();
  });
});
