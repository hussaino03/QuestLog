/**
 * Merges two arrays of tasks while preventing duplicates.
 * When duplicates are found, keeps the task with the earlier creation date.
 * 
 * @param {Array} localTasks - Array of tasks from local storage
 * @param {Array} serverTasks - Array of tasks from the server
 * @returns {Array} Merged array of tasks without duplicates
 */
export const mergeTasks = (localTasks, serverTasks) => {
    // Convert tasks to a Map using task ID as key for O(1) lookup
    const taskMap = new Map();
    
    // Add all local tasks first
    localTasks.forEach(task => {
      taskMap.set(task.id, task);
    });
    
    // Add server tasks, only if they don't exist locally
    // If a task exists in both, keep the one with the earlier createdAt timestamp
    serverTasks.forEach(serverTask => {
      const existingTask = taskMap.get(serverTask.id);
      if (!existingTask) {
        taskMap.set(serverTask.id, serverTask);
      } else {
        // If task exists in both, keep the one created first
        const serverDate = new Date(serverTask.createdAt).getTime();
        const localDate = new Date(existingTask.createdAt).getTime();
        if (serverDate < localDate) {
          taskMap.set(serverTask.id, serverTask);
        }
      }
    });
    
    // Convert map back to array and sort by creation date
    return Array.from(taskMap.values())
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };