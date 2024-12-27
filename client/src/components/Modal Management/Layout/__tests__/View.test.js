import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import View from '../View';
import * as taskUtils from '../../../../utils/tasks/tasksUtils';

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
      experience: 100
    };

    render(
      <View
        task={task}
        removeTask={mockRemoveTask}
        completeTask={mockCompleteTask}
        updateTask={mockUpdateTask}
        isCompleted={false}
      />
    );

    expect(
      screen.getByText((content, element) => {
        return content.includes('OVERDUE') && content.includes('-5 XP');
      })
    ).toBeInTheDocument();
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
      experience: 100
    };

    render(
      <View
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
      experience: 100
    };

    render(
      <View
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
      <View
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

describe('TaskView Integration Tests', () => {
  beforeEach(() => {
    // Mock checkTextTruncation to return true for long text
    jest.spyOn(taskUtils, 'checkTextTruncation').mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockTask = {
    id: '1',
    name: 'Test Task',
    desc: 'Test description',
    difficulty: 50,
    importance: 50,
    experience: 100,
    collaborative: false
  };

  const setup = (props = {}) => {
    return render(
      <View
        task={mockTask}
        removeTask={jest.fn()}
        completeTask={jest.fn()}
        updateTask={jest.fn()}
        isCompleted={false}
        {...props}
      />
    );
  };

  test('renders task name correctly', () => {
    setup();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('shows description when details button is clicked', () => {
    setup();
    const detailsButton = screen.getByText('Details');
    fireEvent.click(detailsButton);
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  test('handles long task names with truncation', () => {
    const longNameTask = {
      ...mockTask,
      name: 'This is a very very very very very long task name that should be truncated'
    };
    setup({ task: longNameTask });
    
    // Find the eye icon button by its SVG path
    const viewButton = screen.getByRole('button', {
      name: /View full name/i
    });
    expect(viewButton).toBeInTheDocument();
  });
});

describe('Edit Mode Tests', () => {
  const mockUpdateTask = jest.fn();
  const mockTask = {
    id: '1',
    name: 'Test Task',
    desc: 'Test description',
    difficulty: 50,
    importance: 50,
    experience: 100,
    label: 'test-label'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('enters edit mode when edit button is clicked', () => {
    render(
      <View
        task={mockTask}
        removeTask={jest.fn()}
        completeTask={jest.fn()}
        updateTask={mockUpdateTask}
        isCompleted={false}
      />
    );

    // Use a more specific selector for the edit button
    const editButton = screen.getByRole('button', {
      name: '✎'
    });
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test-label')).toBeInTheDocument();
  });

  test('updates task when edit form is submitted', () => {
    render(
      <View
        task={mockTask}
        removeTask={jest.fn()}
        completeTask={jest.fn()}
        updateTask={mockUpdateTask}
        isCompleted={false}
      />
    );

    // Use more specific selector for edit button
    const editButton = screen.getByRole('button', {
      name: '✎'
    });
    fireEvent.click(editButton);

    // Update task name
    const nameInput = screen.getByDisplayValue('Test Task');
    fireEvent.change(nameInput, { target: { value: 'Updated Task' } });

    // Submit form
    const saveButton = screen.getByText('💾');
    fireEvent.click(saveButton);

    expect(mockUpdateTask).toHaveBeenCalled();
    const updatedTaskData = mockUpdateTask.mock.calls[0][1];
    expect(updatedTaskData.name).toBe('Updated Task');
  });
});

describe('Project View Integration Tests', () => {
  const mockProjectTask = {
    id: '1',
    name: 'Project Task',
    desc: 'Project description',
    subtasks: [
      { id: '1', name: 'Subtask 1', completed: false },
      { id: '2', name: 'Subtask 2', completed: false }
    ],
    experience: 200
  };

  test('renders project view for tasks with subtasks', () => {
    render(
      <View
        task={mockProjectTask}
        removeTask={jest.fn()}
        completeTask={jest.fn()}
        updateTask={jest.fn()}
        isCompleted={false}
      />
    );

    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Subtask 1')).toBeInTheDocument();
    expect(screen.getByText('Subtask 2')).toBeInTheDocument();
  });

  test('handles subtask completion', () => {
    const mockUpdateTask = jest.fn();
    render(
      <View
        task={mockProjectTask}
        removeTask={jest.fn()}
        completeTask={jest.fn()}
        updateTask={mockUpdateTask}
        isCompleted={false}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(mockUpdateTask).toHaveBeenCalledWith(
      mockProjectTask.id,
      expect.objectContaining({
        subtasks: expect.arrayContaining([
          expect.objectContaining({ id: '1', completed: true }),
          expect.objectContaining({ id: '2', completed: false })
        ])
      })
    );
  });

  test('complete button is disabled when not all subtasks are completed', () => {
    render(
      <View
        task={mockProjectTask}
        removeTask={jest.fn()}
        completeTask={jest.fn()}
        updateTask={jest.fn()}
        isCompleted={false}
      />
    );

    const completeButton = screen.queryByText('✓');
    expect(completeButton).not.toBeInTheDocument();
  });
});

describe('Pomodoro Timer Integration', () => {
  const mockTask = {
    id: '1',
    name: 'Test Task',
    desc: 'Test description',
    difficulty: 50,
    importance: 50,
    experience: 100
  };

  test('shows timer when focus timer button is clicked', () => {
    render(
      <View
        task={mockTask}
        removeTask={jest.fn()}
        completeTask={jest.fn()}
        updateTask={jest.fn()}
        isCompleted={false}
      />
    );

    const expandButton = screen.getByRole('button', { name: /focus timer/i });
    fireEvent.click(expandButton);

    expect(screen.getByText('Hide Timer')).toBeInTheDocument();
  });
});
