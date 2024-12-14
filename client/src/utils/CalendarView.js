import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const CalendarView = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayTasks, setSelectedDayTasks] = useState([]);
  const tasksWithDeadlines = tasks.filter(task => task.deadline);

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = monthStart.getDay();

  const weeks = [];
  let week = Array(7).fill(null);

  for (let i = 0; i < firstDayOfWeek; i++) {
    week[i] = null;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = (firstDayOfWeek + day - 1) % 7;
    week[dayOfWeek] = day;

    if (dayOfWeek === 6 || day === daysInMonth) {
      weeks.push(week);
      week = Array(7).fill(null);
    }
  }

  const getTasksForDay = (day) => {
    if (!day) return [];
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return tasksWithDeadlines.filter(task => task.deadline === dateStr);
  };

  const handleDayClick = (day) => {
    if (!day) return;
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    const tasksForDay = tasksWithDeadlines.filter(task => task.deadline === dateStr);
    setSelectedDay(day);
    setSelectedDayTasks(tasksForDay);
  };

  return (
    <div className="w-full max-w-5xl">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button 
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {monthStart.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button 
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center py-1 sm:py-2">
            {day}
          </div>
        ))}
        {weeks.map((week, i) => (
          week.map((day, j) => {
            const dayTasks = getTasksForDay(day);
            const isToday = day === new Date().getDate() && 
                           currentDate.getMonth() === new Date().getMonth() &&
                           currentDate.getFullYear() === new Date().getFullYear();
            
            return (
              <div 
                key={`${i}-${j}`} 
                onClick={() => day && handleDayClick(day)}
                className={`
                  min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 border dark:border-gray-700 rounded-lg
                  ${!day ? 'invisible' : 'cursor-pointer'}
                  ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  ${day ? 'hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all duration-200' : ''}
                  ${dayTasks.length > 0 ? 'hover:scale-[1.02]' : ''}
                `}
              >
                {day && (
                  <>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">{day}</div>
                    <div className="space-y-0.5 sm:space-y-1">
                      {dayTasks.map(task => (
                        <div 
                          key={task.id}
                          className="text-[10px] sm:text-xs p-0.5 sm:p-1 bg-white dark:bg-gray-700 rounded border 
                                   border-gray-200 dark:border-gray-600 truncate
                                   text-gray-900 dark:text-gray-100"
                          title={task.name}
                        >
                          {task.name.length > 10 ? `${task.name.substring(0, 10)}...` : task.name}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })
        ))}
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay)
                  .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                <span className="text-red-600 dark:text-red-400 text-lg">×</span>
              </button>
            </div>
            <div className="p-4">
              {selectedDayTasks.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayTasks.map(task => (
                    <div 
                      key={task.id}
                      className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{task.name}</h4>
                      {task.desc && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{task.desc}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">No tasks due on this day</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
