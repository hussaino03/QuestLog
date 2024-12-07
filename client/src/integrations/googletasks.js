
const API_BASE_URL = process.env.REACT_APP_PROD || 'http://localhost:3001/api';

export const importFromGoogleTasks = async (addTask, setIsLoading) => {
  setIsLoading(true);
  try {
    const messageHandler = async (event) => {
      if (event.data.type === 'googletasks-auth-success') {
        window.removeEventListener('message', messageHandler);
        if (event.data.tasks && Array.isArray(event.data.tasks)) {
          const tasksToAdd = event.data.tasks.map(taskName => ({
            name: taskName,
            desc: 'Imported from Google Tasks',
            difficulty: 5,
            importance: 5,
            deadline: null,
            collaborative: false,
            experience: 150
          }));
          addTask(tasksToAdd);
        }
        setIsLoading(false);
      } else if (event.data.type === 'googletasks-auth-error') {
        window.removeEventListener('message', messageHandler);
        setIsLoading(false);
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      `${API_BASE_URL}/auth/googletasks`,
      'Import from Google Tasks',
      `width=${width},height=${height},left=${left},top=${top},popup=1`
    );

    if (!popup || popup.closed) {
      throw new Error('Popup blocked! Please allow popups for this site.');
    }
  } catch (error) {
    console.error('Google Tasks import failed:', error);
    setIsLoading(false);
  }
};