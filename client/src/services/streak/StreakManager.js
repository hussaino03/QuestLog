class StreakManager {
  constructor(setCurrentStreak) {
    this.setCurrentStreak = setCurrentStreak;
  }

  calculateStreak(completedTasks, today = new Date()) {
    if (!completedTasks.length) {
      this.setCurrentStreak(0);
      return { current: 0, longest: 0 };
    }

    const todayDate = new Date(today).setHours(0, 0, 0, 0);
    let current = 0;
    let longest = 0;
    let previousDate = null;

    // Sort tasks by completion date and remove duplicate dates
    const sortedTasks = [...completedTasks]
      .filter((task) => task.completedAt)
      .map((task) => ({
        ...task,
        normalizedDate: new Date(task.completedAt).setHours(0, 0, 0, 0)
      }))
      .sort((a, b) => a.normalizedDate - b.normalizedDate)
      .filter(
        (task, index, self) =>
          index ===
          self.findIndex((t) => t.normalizedDate === task.normalizedDate)
      );

    // Calculate streaks
    for (let i = 0; i < sortedTasks.length; i++) {
      const taskDate = sortedTasks[i].normalizedDate;

      if (previousDate === null) {
        current = 1;
      } else {
        const daysDifference = Math.round(
          (taskDate - previousDate) / (1000 * 60 * 60 * 24)
        );

        if (daysDifference === 1) {
          current += 1;
        } else {
          longest = Math.max(longest, current);
          current = 1;
        }
      }

      previousDate = taskDate;
    }

    longest = Math.max(longest, current);

    // Check if streak is still active
    const lastTaskDate = sortedTasks[sortedTasks.length - 1].normalizedDate;
    const daysSinceLastTask = Math.round(
      (todayDate - lastTaskDate) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastTask > 1) {
      current = 0;
    }

    this.setCurrentStreak(current);
    return { current, longest };
  }
}

export default StreakManager;
