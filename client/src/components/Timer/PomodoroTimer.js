import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';

// Create a global state to track active timers
const activeTimers = new Set();

const PomodoroTimer = ({ taskName }) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [originalTitle] = useState(document.title);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let interval = null;

    if (isActive) {
      if (activeTimers.size > 0 && !activeTimers.has(taskName)) {
        setIsActive(false);
        setErrorMessage(
          'Another Pomodoro timer is already running. Please create a project to focus on multiple tasks at once!'
        );
        return;
      }

      // Add this timer to active timers
      activeTimers.add(taskName);

      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            if (!isBreak) {
              setMinutes(5);
              setSeconds(0);
              setIsBreak(true);
              setCycles((c) => c + 1);
              document.title = `Break Time! - ${taskName}`;
              new Notification('Time for a break!', {
                body: `Great work on "${taskName}"! Take 5 minutes to rest.`,
                icon: '/favicon.ico'
              });
            } else {
              setMinutes(25);
              setSeconds(0);
              setIsBreak(false);
              document.title = `25:00 - ${taskName}`;
              new Notification('Break finished!', {
                body: 'Ready to focus on your task again?',
                icon: '/favicon.ico'
              });
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }

        if (isActive) {
          const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          document.title = `${timeString} - ${taskName}`;
        }
      }, 1000);
    } else {
      // Remove this timer from active timers when stopped
      activeTimers.delete(taskName);
    }

    return () => {
      clearInterval(interval);
      if (!isActive) {
        document.title = originalTitle;
        activeTimers.delete(taskName);
      }
    };
  }, [isActive, minutes, seconds, isBreak, taskName, originalTitle]);

  const toggleTimer = () => {
    setErrorMessage('');

    if (!isActive) {
      // Check if another timer is running
      if (activeTimers.size > 0 && !activeTimers.has(taskName)) {
        setErrorMessage(
          'Another Pomodoro timer is already running. Please create a project to focus on multiple tasks at once!'
        );
        return;
      }

      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    setIsActive(!isActive);
    if (!isActive) {
      document.title = `25:00 - ${taskName}`;
    } else {
      document.title = originalTitle;
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
    setErrorMessage('');
    document.title = originalTitle;
    activeTimers.delete(taskName);
  };

  return (
    <div className="flex flex-col items-center">
      {errorMessage && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4 w-full">
          <p className="p-4 text-sm text-red-600 dark:text-red-400">
            ⚠️ {errorMessage}
          </p>
        </div>
      )}

      <div className="text-3xl font-mono mb-4 text-gray-800 dark:text-gray-200">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={toggleTimer}
          className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 
                   text-blue-600 dark:text-blue-400 transition-colors"
        >
          {isActive ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          onClick={resetTimer}
          className="p-2 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 
                   text-gray-600 dark:text-gray-400 transition-colors"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        {isBreak ? (
          <Coffee size={14} className="text-green-500" />
        ) : (
          <span className="text-sm">🎯</span>
        )}
        <span>
          {isBreak ? 'Break Time' : 'Focus Mode'} • Cycle {cycles + 1}
        </span>
      </div>
    </div>
  );
};

export default PomodoroTimer;
