import TaskManager from '../TaskManager';
import { startConfetti } from '../../../utils/other/confettiUtils';

jest.mock('../../../utils/other/confettiUtils');

describe('TaskManager', () => {
  let taskManager;
  let mockSetTasks;
  let mockSetCompletedTasks;
  let mockSetError;
  let mockCalculateXP;
  let consoleSpy;

  beforeEach(() => {
    // Setup mocks
    mockSetTasks = jest.fn();
    mockSetCompletedTasks = jest.fn();
    mockSetError = jest.fn();
    mockCalculateXP = jest.fn();

    // Spy on console.error to prevent logs during tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    taskManager = new TaskManager(
      mockCalculateXP,
      mockSetTasks,
      mockSetCompletedTasks,
      mockSetError
    );
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('addTask', () => {
    it('should add a single task with generated id and timestamp', async () => {
      const taskData = { title: 'Test Task', experience: 100 };
      await taskManager.addTask(taskData);

      expect(mockSetTasks).toHaveBeenCalled();
      const setTasksCallback = mockSetTasks.mock.calls[0][0];
      const result = setTasksCallback([]);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          title: 'Test Task',
          experience: 100,
          id: expect.any(String),
          createdAt: expect.any(String),
          label: null
        })
      );
    });

    it('should handle multiple tasks in an array', async () => {
      const tasksData = [
        { title: 'Task 1', experience: 100 },
        { title: 'Task 2', experience: 200 }
      ];
      await taskManager.addTask(tasksData);

      expect(mockSetTasks).toHaveBeenCalled();
      const setTasksCallback = mockSetTasks.mock.calls[0][0];
      const result = setTasksCallback([]);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Task 1');
      expect(result[1].title).toBe('Task 2');
    });

    it('should handle errors properly', async () => {
      mockSetTasks.mockImplementation(() => {
        throw new Error('Test error');
      });

      await taskManager.addTask({ title: 'Test Task' });
      expect(mockSetError).toHaveBeenCalledWith('Test error');
    });
  });

  describe('completeTask', () => {
    it('should complete a task and calculate XP correctly', async () => {
      const task = {
        id: '123',
        title: 'Test Task',
        experience: 100,
        deadline: new Date().toISOString()
      };
      const xpCalc = { earlyBonus: 10, overduePenalty: 0 };
      mockCalculateXP.mockReturnValue(xpCalc);

      await taskManager.completeTask(task);

      expect(startConfetti).toHaveBeenCalledTimes(1);
      expect(mockSetTasks).toHaveBeenCalled();
      expect(mockCalculateXP).toHaveBeenCalledWith(100, task.deadline);

      const completedTasksCallback = mockSetCompletedTasks.mock.calls[0][0];
      const result = completedTasksCallback([]);

      expect(result[0]).toMatchObject({
        ...task,
        completedAt: expect.any(String),
        earlyBonus: 10,
        overduePenalty: 0
      });
    });

    it('should handle errors during task completion', async () => {
      mockSetTasks.mockImplementation(() => {
        throw new Error('Completion error');
      });

      await taskManager.completeTask({ id: '123' });
      expect(mockSetError).toHaveBeenCalledWith('Completion error');
    });
  });

  describe('removeTask', () => {
    it('should remove an incomplete task', () => {
      taskManager.removeTask('123', false);
      expect(mockSetTasks).toHaveBeenCalled();
    });

    it('should calculate correct XP adjustment when removing completed task', () => {
      const completedTask = {
        id: '123',
        experience: 100,
        earlyBonus: 10,
        overduePenalty: -5
      };

      mockSetCompletedTasks.mockImplementation((cb) => {
        cb([completedTask]);
      });

      taskManager.removeTask('123', true);

      // Should subtract task XP + bonus - penalty
      expect(mockCalculateXP).toHaveBeenCalledWith(-105);
      expect(mockSetCompletedTasks).toHaveBeenCalled();
    });

    it('should handle errors during task removal', () => {
      mockSetTasks.mockImplementation(() => {
        throw new Error('Removal error');
      });

      taskManager.removeTask('123', false);
      expect(mockSetError).toHaveBeenCalledWith('Removal error');
    });
  });

  describe('updateTask', () => {
    it('should update a non-shared task without server sync', async () => {
      const updatedTask = { id: '123', title: 'Updated Task' };
      await taskManager.updateTask('123', updatedTask);

      expect(mockSetTasks).toHaveBeenCalled();
      const setTasksCallback = mockSetTasks.mock.calls[0][0];
      const result = setTasksCallback([{ id: '123', title: 'Old Task' }]);

      expect(result[0]).toEqual(updatedTask);
    });

    it('should handle server sync for shared tasks', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      const updatedTask = { 
        id: '123', 
        title: 'Updated Task',
        isShared: true 
      };

      await taskManager.updateTask('123', updatedTask);

      expect(global.fetch).toHaveBeenCalled();
      expect(mockSetTasks).toHaveBeenCalled();
    });

    it('should handle server sync errors for shared tasks', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          text: () => Promise.resolve('Server error')
        })
      );

      const updatedTask = { 
        id: '123', 
        title: 'Updated Task',
        isShared: true 
      };

      await expect(taskManager.updateTask('123', updatedTask))
        .rejects
        .toThrow('Failed to sync project update');
    });

    it('should handle local state update errors', async () => {
      mockSetTasks.mockImplementation(() => {
        throw new Error('Update error');
      });

      await expect(taskManager.updateTask('123', { title: 'Updated Task' }))
        .rejects
        .toThrow('Update error');
      
      expect(mockSetError).toHaveBeenCalledWith('Update error');
    });
  });
});
