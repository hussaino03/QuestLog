export const mergeTasks = (localTasks, serverTasks) => {
  if (!Array.isArray(localTasks) || !Array.isArray(serverTasks)) {
    console.error('Invalid input:', { localTasks, serverTasks });
    return [];
  }

  const taskMap = new Map();

  localTasks.forEach(task => {
    if (!task.id) return; // Skip tasks without IDs
    taskMap.set(task.id, task);
  });

  serverTasks.forEach(task => {
    if (!task.id) return; // Skip tasks without IDs
    
    const existingTask = taskMap.get(task.id);
    if (!existingTask) {
      taskMap.set(task.id, task);
    } else {
      const serverDate = new Date(task.createdAt || 0).getTime();
      const localDate = new Date(existingTask.createdAt || 0).getTime();
      if (serverDate > localDate) {
        taskMap.set(task.id, task);
      }
    }
  });

  return Array.from(taskMap.values());
};