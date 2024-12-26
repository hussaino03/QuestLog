import { validateUserId } from '../validationservice';

class DataManager {
  static API_BASE_URL =
    process.env.REACT_APP_PROD || 'http://localhost:3001/api';

  constructor(setters) {
    this.setters = setters;
  }

  handleError(error, message, setError) {
    console.error(message, error);
    setError(`${message} ${error.message}`);
  }

  handleAuthChange = (id) => {
    this.setters.setUserId(id);
  };

  handleUserDataLoad = (userData) => {
    // pull data from server
    if (!userData) return;

    const {
      setUserId,
      setTotalExperience,
      setTasks,
      setCompletedTasks,
      setUserName,
      setUnlockedBadges
    } = this.setters;

    setUserId(userData.userId);
    setTotalExperience(userData.xp || 0);
    setTasks(userData.tasks || []);
    setCompletedTasks(userData.completedTasks || []);
    setUserName(userData.name || null);
    setUnlockedBadges(userData.unlockedBadges || []);
  };

  async checkAuth(setLoading) {
    try {
      const response = await fetch(
        `${DataManager.API_BASE_URL}/auth/current_user`,
        {
          credentials: 'include'
        }
      );
      const data = await response.json();
      if (data && data.userId) {
        this.handleAuthChange(data.userId);
        this.handleUserDataLoad(data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  }

  async updateUserData(userId, userData) {
    try {
      validateUserId(userId);
      const response = await fetch(
        `${DataManager.API_BASE_URL}/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(userData)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update user data: ${response.status}`);
      }
    } catch (error) {
      this.handleError(
        error,
        'Error updating user data:',
        this.setters.setError
      );
    }
  }

  async clearAllData(userId) {
    try {
      const { setTasks, setCompletedTasks, resetXP } = this.setters;

      setTasks([]);
      setCompletedTasks([]);
      resetXP();

      await this.updateUserData(userId, {
        xp: 0,
        level: 1,
        tasks: [],
        completedTasks: []
      });
    } catch (error) {
      this.handleError(error, 'Error clearing data:', this.setters.setError);
    }
  }

  async syncUserData(userData) {
    // send local data to server
    if (!userData.userId) return;

    try {
      await this.updateUserData(userData.userId, {
        xp: userData.getTotalXP(),
        level: userData.level,
        tasksCompleted: userData.completedTasks.length,
        tasks: userData.tasks,
        completedTasks: userData.completedTasks,
        unlockedBadges: userData.unlockedBadges
      });
    } catch (error) {
      this.handleError(
        error,
        'Error syncing user data:',
        this.setters.setError
      );
    }
  }

  async checkAndHandleAuth(setLoading) {
    if (!setLoading) return;
    try {
      const response = await fetch(
        `${DataManager.API_BASE_URL}/auth/current_user`,
        {
          credentials: 'include'
        }
      );
      const data = await response.json();
      if (data && data.userId) {
        this.handleAuthChange(data.userId);
        this.handleUserDataLoad(data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  }
}

export default DataManager;
