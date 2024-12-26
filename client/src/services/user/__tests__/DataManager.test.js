import DataManager from '../DataManager';
import { validateUserId } from '../../validationservice';

jest.mock('../../validationservice');

describe('DataManager', () => {
  let dataManager;
  let mockSetters;
  let consoleSpy;

  // Mock fetch globally
  global.fetch = jest.fn();

  beforeEach(() => {
    // Reset fetch mock
    fetch.mockReset();

    // Create mock setters
    mockSetters = {
      setUserId: jest.fn(),
      setTotalExperience: jest.fn(),
      setTasks: jest.fn(),
      setCompletedTasks: jest.fn(),
      setUserName: jest.fn(),
      setUnlockedBadges: jest.fn(),
      setError: jest.fn(),
      resetXP: jest.fn()
    };

    // Create DataManager instance
    dataManager = new DataManager(mockSetters);

    // Spy on console.error
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('handleAuthChange', () => {
    it('should update userId when auth changes', () => {
      dataManager.handleAuthChange('test-user-123');
      expect(mockSetters.setUserId).toHaveBeenCalledWith('test-user-123');
    });
  });

  describe('handleUserDataLoad', () => {
    it('should load user data correctly', () => {
      const userData = {
        userId: 'test-123',
        xp: 1000,
        tasks: ['task1', 'task2'],
        completedTasks: ['task3'],
        name: 'Test User',
        unlockedBadges: ['badge1']
      };

      dataManager.handleUserDataLoad(userData);

      expect(mockSetters.setUserId).toHaveBeenCalledWith('test-123');
      expect(mockSetters.setTotalExperience).toHaveBeenCalledWith(1000);
      expect(mockSetters.setTasks).toHaveBeenCalledWith(['task1', 'task2']);
      expect(mockSetters.setCompletedTasks).toHaveBeenCalledWith(['task3']);
      expect(mockSetters.setUserName).toHaveBeenCalledWith('Test User');
      expect(mockSetters.setUnlockedBadges).toHaveBeenCalledWith(['badge1']);
    });

    it('should handle undefined userData gracefully', () => {
      dataManager.handleUserDataLoad(undefined);
      expect(mockSetters.setUserId).not.toHaveBeenCalled();
    });
  });

  describe('checkAuth', () => {
    it('should handle successful auth check', async () => {
      const mockResponse = { userId: 'test-123', name: 'Test User' };
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      const mockSetLoading = jest.fn();
      await dataManager.checkAuth(mockSetLoading);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/current_user'),
        expect.objectContaining({ credentials: 'include' })
      );
      expect(mockSetters.setUserId).toHaveBeenCalledWith('test-123');
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });

    it('should handle failed auth check', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const mockSetLoading = jest.fn();
      await dataManager.checkAuth(mockSetLoading);

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('updateUserData', () => {
    it('should update user data successfully', async () => {
      validateUserId.mockImplementation(() => true);
      fetch.mockResolvedValueOnce({ ok: true });

      const userData = { xp: 1000, tasks: [] };
      await dataManager.updateUserData('test-123', userData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/test-123'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(userData)
        })
      );
    });

    it('should handle update errors', async () => {
      validateUserId.mockImplementation(() => true);
      fetch.mockResolvedValueOnce({ ok: false, status: 400 });

      await dataManager.updateUserData('test-123', {});

      expect(mockSetters.setError).toHaveBeenCalled();
    });
  });

  describe('clearAllData', () => {
    it('should clear all user data', async () => {
      validateUserId.mockImplementation(() => true);
      fetch.mockResolvedValueOnce({ ok: true });

      await dataManager.clearAllData('test-123');

      expect(mockSetters.setTasks).toHaveBeenCalledWith([]);
      expect(mockSetters.setCompletedTasks).toHaveBeenCalledWith([]);
      expect(mockSetters.resetXP).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/test-123'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            xp: 0,
            level: 1,
            tasks: [],
            completedTasks: []
          })
        })
      );
    });
  });

  describe('syncUserData', () => {
    it('should sync user data when userId exists', async () => {
      validateUserId.mockImplementation(() => true);
      fetch.mockResolvedValueOnce({ ok: true });

      const userData = {
        userId: 'test-123',
        getTotalXP: () => 1000,
        level: 5,
        tasks: [],
        completedTasks: [],
        unlockedBadges: []
      };

      await dataManager.syncUserData(userData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/test-123'),
        expect.objectContaining({
          method: 'PUT'
        })
      );
    });

    it('should skip sync when userId is missing', async () => {
      await dataManager.syncUserData({});
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
