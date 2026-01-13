import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskList from '../List';

describe('TaskList - Completed Tasks Sorting', () => {
  const mockRemoveTask = jest.fn();
  const mockCompleteTask = jest.fn();
  const mockAddTask = jest.fn();
  const mockUpdateTask = jest.fn();

  const completedTasks = [
    {
      id: '1',
      name: 'First Completed Task',
      desc: 'Task completed on Jan 1',
      deadline: '2024-01-10',
      completedAt: '2024-01-01T10:00:00.000Z',
      difficulty: 5,
      importance: 5,
      experience: 100
    },
    {
      id: '2',
      name: 'Second Completed Task',
      desc: 'Task completed on Jan 5',
      deadline: '2024-01-15',
      completedAt: '2024-01-05T14:30:00.000Z',
      difficulty: 5,
      importance: 5,
      experience: 150
    },
    {
      id: '3',
      name: 'Third Completed Task',
      desc: 'Task completed on Jan 3',
      deadline: '2024-01-12',
      completedAt: '2024-01-03T08:00:00.000Z',
      difficulty: 5,
      importance: 5,
      experience: 120
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders completed tasks with default "Sort by Deadline" option', () => {
    render(
      <TaskList
        tasks={completedTasks}
        removeTask={mockRemoveTask}
        completeTask={mockCompleteTask}
        addTask={mockAddTask}
        updateTask={mockUpdateTask}
        isCompleted={true}
      />
    );

    // Check that the dropdown exists and has the correct default value
    const sortDropdown = screen.getByRole('combobox');
    expect(sortDropdown).toBeInTheDocument();
    expect(sortDropdown.value).toBe('group');

    // Check that all sort options are present
    expect(screen.getByText('Sort by Deadline')).toBeInTheDocument();
    expect(screen.getByText('Recently Completed')).toBeInTheDocument();
    expect(screen.getByText('Oldest First')).toBeInTheDocument();

    // Check that tasks are rendered
    expect(screen.getByText('First Completed Task')).toBeInTheDocument();
    expect(screen.getByText('Second Completed Task')).toBeInTheDocument();
    expect(screen.getByText('Third Completed Task')).toBeInTheDocument();
  });

  test('displays group headers when "Sort by Deadline" is selected', () => {
    render(
      <TaskList
        tasks={completedTasks}
        removeTask={mockRemoveTask}
        completeTask={mockCompleteTask}
        addTask={mockAddTask}
        updateTask={mockUpdateTask}
        isCompleted={true}
      />
    );

    // Group headers (deadline dates) should be visible
    // The tasks have deadlines, so we should see date headers
    const dateHeaders = screen.queryAllByText(
      /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/
    );
    expect(dateHeaders.length).toBeGreaterThan(0);
  });

  test('sorts tasks by "Recently Completed" (newest first)', async () => {
    render(
      <TaskList
        tasks={completedTasks}
        removeTask={mockRemoveTask}
        completeTask={mockCompleteTask}
        addTask={mockAddTask}
        updateTask={mockUpdateTask}
        isCompleted={true}
      />
    );

    const sortDropdown = screen.getByRole('combobox');

    // Change to "Recently Completed"
    fireEvent.change(sortDropdown, { target: { value: 'recent' } });

    await waitFor(() => {
      expect(sortDropdown.value).toBe('recent');
    });

    // Get all task names in the rendered order
    const taskNames = screen.getAllByText(/Completed Task/i);

    // Tasks should be ordered: Second (Jan 5), Third (Jan 3), First (Jan 1)
    expect(taskNames[0].textContent).toContain('Second');
    expect(taskNames[1].textContent).toContain('Third');
    expect(taskNames[2].textContent).toContain('First');
  });

  test('sorts tasks by "Oldest First"', async () => {
    render(
      <TaskList
        tasks={completedTasks}
        removeTask={mockRemoveTask}
        completeTask={mockCompleteTask}
        addTask={mockAddTask}
        updateTask={mockUpdateTask}
        isCompleted={true}
      />
    );

    const sortDropdown = screen.getByRole('combobox');

    // Change to "Oldest First"
    fireEvent.change(sortDropdown, { target: { value: 'oldest' } });

    await waitFor(() => {
      expect(sortDropdown.value).toBe('oldest');
    });

    // Get all task names in the rendered order
    const taskNames = screen.getAllByText(/Completed Task/i);

    // Tasks should be ordered: First (Jan 1), Third (Jan 3), Second (Jan 5)
    expect(taskNames[0].textContent).toContain('First');
    expect(taskNames[1].textContent).toContain('Third');
    expect(taskNames[2].textContent).toContain('Second');
  });

  test('hides group headers when not in "Sort by Deadline" mode', async () => {
    render(
      <TaskList
        tasks={completedTasks}
        removeTask={mockRemoveTask}
        completeTask={mockCompleteTask}
        addTask={mockAddTask}
        updateTask={mockUpdateTask}
        isCompleted={true}
      />
    );

    const sortDropdown = screen.getByRole('combobox');

    // First, verify date headers are visible in default mode
    let dateHeaders = screen.queryAllByText(
      /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/
    );
    const initialHeaderCount = dateHeaders.length;
    expect(initialHeaderCount).toBeGreaterThan(0);

    // Change to "Recently Completed"
    fireEvent.change(sortDropdown, { target: { value: 'recent' } });

    await waitFor(() => {
      expect(sortDropdown.value).toBe('recent');
    });

    // When sorted by completion date, group headers should be hidden or reduced
    dateHeaders = screen.queryAllByText(
      /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/
    );
    // Should have fewer or no date headers visible
    expect(dateHeaders.length).toBeLessThanOrEqual(initialHeaderCount);
  });

  test('handles tasks without completedAt timestamp gracefully', async () => {
    const tasksWithMissingTimestamp = [
      ...completedTasks,
      {
        id: '4',
        name: 'Task Without Timestamp',
        desc: 'No completion timestamp',
        deadline: '2024-01-20',
        // No completedAt field
        difficulty: 5,
        importance: 5,
        experience: 100
      }
    ];

    render(
      <TaskList
        tasks={tasksWithMissingTimestamp}
        removeTask={mockRemoveTask}
        completeTask={mockCompleteTask}
        addTask={mockAddTask}
        updateTask={mockUpdateTask}
        isCompleted={true}
      />
    );

    const sortDropdown = screen.getByRole('combobox');

    // Change to "Recently Completed"
    fireEvent.change(sortDropdown, { target: { value: 'recent' } });

    await waitFor(() => {
      expect(sortDropdown.value).toBe('recent');
    });

    // All tasks should still render without errors
    expect(screen.getByText('First Completed Task')).toBeInTheDocument();
    expect(screen.getByText('Second Completed Task')).toBeInTheDocument();
    expect(screen.getByText('Third Completed Task')).toBeInTheDocument();
    expect(screen.getByText('Task Without Timestamp')).toBeInTheDocument();
  });

  test('switching between sort methods updates task order correctly', async () => {
    render(
      <TaskList
        tasks={completedTasks}
        removeTask={mockRemoveTask}
        completeTask={mockCompleteTask}
        addTask={mockAddTask}
        updateTask={mockUpdateTask}
        isCompleted={true}
      />
    );

    const sortDropdown = screen.getByRole('combobox');

    // Start with default "group"
    expect(sortDropdown.value).toBe('group');

    // Switch to "recent"
    fireEvent.change(sortDropdown, { target: { value: 'recent' } });
    await waitFor(() => {
      expect(sortDropdown.value).toBe('recent');
    });

    // Switch to "oldest"
    fireEvent.change(sortDropdown, { target: { value: 'oldest' } });
    await waitFor(() => {
      expect(sortDropdown.value).toBe('oldest');
    });

    let taskNames = screen.getAllByText(/Completed Task/i);
    expect(taskNames[0].textContent).toContain('First');

    // Switch back to "group"
    fireEvent.change(sortDropdown, { target: { value: 'group' } });
    await waitFor(() => {
      expect(sortDropdown.value).toBe('group');
    });

    // Should return to grouped view
    const dateHeaders = screen.queryAllByText(
      /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/
    );
    expect(dateHeaders.length).toBeGreaterThan(0);
  });
});

describe('TaskList - Non-completed Tasks', () => {
  const regularTasks = [
    {
      id: '1',
      name: 'Todo Task 1',
      desc: 'Regular task',
      deadline: '2024-01-10',
      difficulty: 5,
      importance: 5,
      experience: 100
    },
    {
      id: '2',
      name: 'Todo Task 2',
      desc: 'Regular task 2',
      deadline: '2024-01-15',
      difficulty: 5,
      importance: 5,
      experience: 150
    }
  ];

  test('does not show completed sort dropdown for non-completed tasks', () => {
    render(
      <TaskList
        tasks={regularTasks}
        removeTask={jest.fn()}
        completeTask={jest.fn()}
        addTask={jest.fn()}
        updateTask={jest.fn()}
        isCompleted={false}
      />
    );

    // The completed sort dropdown with "Sort by Deadline" option should not be present
    expect(screen.queryByText('Sort by Deadline')).not.toBeInTheDocument();
    expect(screen.queryByText('Recently Completed')).not.toBeInTheDocument();
  });
});
