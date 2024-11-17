export const mergeTasks = (localTasks, serverTasks) => {
  console.log('Merge function received:');
  console.log('Local tasks:', localTasks?.length, 'tasks');
  console.log('Server tasks:', serverTasks?.length, 'tasks');
  
  // Safety check for array input
  if (!Array.isArray(localTasks) || !Array.isArray(serverTasks)) {
    console.error('Invalid input:', { localTasks, serverTasks });
    return [];
  }
  
  // Convert tasks to a Map using task ID as key for O(1) lookup
  const taskMap = new Map();
  
  // Add all server tasks first (this is the key change)
  serverTasks.forEach(task => {
    if (!task.id) {
      // Generate an ID if missing using name and creation date as unique identifier
      task.id = `${task.name}-${task.createdAt || new Date().toISOString()}`;
    }
    taskMap.set(task.id, task);
  });
  
  // Then add local tasks, potentially overwriting server tasks if they're newer
  localTasks.forEach(task => {
    if (!task.id) {
      task.id = `${task.name}-${task.createdAt || new Date().toISOString()}`;
    }
    
    const existingTask = taskMap.get(task.id);
    if (!existingTask) {
      taskMap.set(task.id, task);
    } else {
      // If task exists in both, keep the newer one
      const existingDate = new Date(existingTask.createdAt || 0).getTime();
      const localDate = new Date(task.createdAt || 0).getTime();
      if (localDate > existingDate) {
        taskMap.set(task.id, task);
      }
    }
  });
  
  // Sort by creation date, defaulting to 0 if missing
  const result = Array.from(taskMap.values())
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateA - dateB;
    });
    
  console.log('Merge result:', result.length, 'total tasks after merge');
  return result;
};