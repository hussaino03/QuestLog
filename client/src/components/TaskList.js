import React from 'react';
import Task from './Task';

const TaskList = ({ tasks, removeTask, completeTask, isCompleted }) => {
  return (
    <div className="flex flex-col items-center w-full bg-white dark:bg-gray-800 rounded-lg p-6 transition-colors duration-200">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        {isCompleted ? 'Completed' : 'To-do'}
      </h2>
      <ul className="space-y-4 w-full flex flex-col items-center">
        {tasks.map((task) => (
          <Task
            key={task.id}
            task={task}
            removeTask={removeTask}
            completeTask={completeTask}
            isCompleted={isCompleted}
          />
        ))}
      </ul>
    </div>
  );
};

export default TaskList;