class ViewManager {
  constructor(setShowCompleted, setCurrentView) {
    this.setShowCompleted = setShowCompleted;
    this.setCurrentView = setCurrentView;
  }

  toggleView = (showCompleted) => {
    this.setShowCompleted(!showCompleted);
    this.setCurrentView(!showCompleted ? 'completed' : 'todo');
  };
}

export default ViewManager;
