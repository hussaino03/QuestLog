import { v4 as uuidv4 } from 'uuid';
import { startConfetti } from '../../utils/confettiEffect';

class TaskManager {
    constructor(calculateXP, setTasks, setCompletedTasks, setError) {
        this.calculateXP = calculateXP;
        this.setTasks = setTasks;
        this.setCompletedTasks = setCompletedTasks;
        this.setError = setError;
    }

    handleError(error, message) {
        console.error(message, error);
        this.setError(error.message);
    }

    addTask = async (taskData) => {
        try {
            const tasksToAdd = Array.isArray(taskData) ? taskData : [taskData];
            
            const newTasks = tasksToAdd.map(task => ({
                ...task,
                id: uuidv4(),
                createdAt: new Date().toISOString(),
                label: task.label || null 
            }));
            
            this.setTasks(currentTasks => [...currentTasks, ...newTasks]);
        } catch (error) {
            this.handleError(error, 'Error adding task:');
        }
    };

    completeTask = async (task) => {
        try {
            startConfetti();
            this.setTasks(currentTasks => 
                currentTasks.filter(t => t.id !== task.id)
            );

            const completedTask = {
                ...task,
                completedAt: new Date().toISOString() // Store UTC timestamp
            };
            
            const xpResult = this.calculateXP(task.experience, task.deadline);
            completedTask.earlyBonus = xpResult.earlyBonus;
            completedTask.overduePenalty = xpResult.overduePenalty;

            this.setCompletedTasks(prev => [...prev, completedTask]);
        } catch (error) {
            this.handleError(error, 'Error completing task:');
        }
    };

    removeTask = (taskId, isCompleted) => {
        try {
            if (isCompleted) {
                this.setCompletedTasks(prev => {
                    const taskToRemove = prev.find(t => t.id === taskId);
                    if (taskToRemove) {
                        let totalXPToRemove = taskToRemove.experience;
                        if (taskToRemove.earlyBonus) totalXPToRemove += taskToRemove.earlyBonus;
                        if (taskToRemove.overduePenalty) totalXPToRemove += taskToRemove.overduePenalty;
                        this.calculateXP(-totalXPToRemove);
                    }
                    return prev.filter(t => t.id !== taskId);
                });
            } else {
                this.setTasks(prev => prev.filter(t => t.id !== taskId));
            }
        } catch (error) {
            this.handleError(error, 'Error removing task:');
        }
    };

    updateTask = (taskId, updatedTask) => {
        try {
            this.setTasks(currentTasks => 
                currentTasks.map(task => task.id === taskId ? updatedTask : task)
            );
        } catch (error) {
            this.handleError(error, 'Error updating task:');
        }
    };
}

export default TaskManager;
