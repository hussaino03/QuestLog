const API_BASE_URL = process.env.REACT_APP_PROD || 'http://localhost:3001/api';

class CollaborationManager {
  constructor(setTasks, setError) {
    this.setTasks = setTasks;
    this.setError = setError;
  }

  async shareProject(taskId, userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/collaboration/projects/${taskId}/share`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to share project: ${response.status}`);
      }

      const result = await response.json();

      return result;
    } catch (error) {
      console.error('[SHARE] Error sharing project:', error);
      this.setError('Failed to share project');
      throw error;
    }
  }

  async joinProject(shareCode) {
    try {

      const response = await fetch(`${API_BASE_URL}/collaboration/projects/${shareCode}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to join project: ${response.status}`);
      }

      const project = await response.json();

      // Check if project already exists in tasks
      this.setTasks(currentTasks => {
        const exists = currentTasks.some(t => t.id === project.id);
        if (!exists) {
          return [...currentTasks, project];
        }
        return currentTasks;
      });

      // Start syncing the shared project
      this.startProjectSync(project.id);
      return true;
    } catch (error) {
      console.error('[JOIN] Error joining project:', error);
      this.setError('Failed to join project');
      return false;
    }
  }

  async updateSharedProjectSubtask(taskId, subtaskIndex, completed) {
    try {
      
      const response = await fetch(`${API_BASE_URL}/collaboration/projects/${taskId}/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subtaskIndex,
          completed
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync subtask update: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('[UPDATE] Error syncing subtask update:', error);
      this.setError('Failed to update shared project');
      throw error;
    }
  }

  async updateSharedProjectDetails(taskId, updatedDetails) {
    try {
      
      const response = await fetch(`${API_BASE_URL}/collaboration/projects/${taskId}/details`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDetails),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync project update: ${response.status}`);
      }

      const result = await response.json();
      
      // Update local state with shared properties
      this.setTasks(currentTasks => 
        currentTasks.map(task => 
          task.id === taskId 
            ? { ...task, isShared: true }
            : task
        )
      );

      return result;
    } catch (error) {
      console.error('[UPDATE-DETAILS] Error updating project details:', error);
      this.setError('Failed to update project details');
      throw error;
    }
  }

  async fetchCollaboratorNames(ownerId, sharedWithIds) {
    try {
      const uniqueIds = [...new Set([ownerId, ...sharedWithIds])];
      const collaborators = await Promise.all(
        uniqueIds.map(async (userId) => {
          const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
            }
          });

          if (!response.ok) {
            console.error(`[COLLAB] Failed to fetch user ${userId}`);
            return { id: userId, name: 'Unknown User' };
          }

          const userData = await response.json();
          return {
            id: userId,
            name: userData.name,
            isOwner: userId === ownerId
          };
        })
      );

      return collaborators;
    } catch (error) {
      console.error('[COLLAB] Error fetching collaborator names:', error);
      return [];
    }
  }

  startProjectSync(taskId) {
    let syncAttempts = 0;
    const maxAttempts = 3;
    
    const syncInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/collaboration/projects/${taskId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          syncAttempts++;
          if (syncAttempts >= maxAttempts) {
            console.error(`[SYNC] Max retry attempts reached for project ${taskId}`);
            clearInterval(syncInterval);
            return;
          }
          throw new Error(`Failed to sync project: ${response.status}`);
        }

        syncAttempts = 0;
        const project = await response.json();
        
        // Update the task in state if it exists and has changed
        this.setTasks(currentTasks => {
          const taskIndex = currentTasks.findIndex(t => t.id === taskId);
          if (taskIndex === -1) return currentTasks;
          
          const currentTask = currentTasks[taskIndex];
          if (JSON.stringify(currentTask) === JSON.stringify(project)) return currentTasks;
          
          const newTasks = [...currentTasks];
          newTasks[taskIndex] = project;
          return newTasks;
        });
      } catch (error) {
        console.error('[SYNC] Project sync error:', error);
      }
    }, 5000);

    return () => {
      clearInterval(syncInterval);
    };
  }
}

export default CollaborationManager;
