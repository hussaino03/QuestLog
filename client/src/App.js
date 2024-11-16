import './styles/globals.css';
import React, { useState, useEffect } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import TaskButtons from './components/TaskButtons';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import LevelUpModal from './components/LevelUpModal';
import StreakTracker from './components/StreakTracker';
import Leaderboard from './components/Leaderboard';
import useXPManager from './components/XPManager';
import ThemeToggle from './components/ThemeToggle';
import Auth from './components/Auth';

const API_BASE_URL = 'https://smart-list-hjea.vercel.app/api';

const App = () => {
  const [isDark, setIsDark] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('todo');
  const [authToken, setAuthToken] = useState(null);

  const handleAuthChange = (token, id) => {
    setAuthToken(token);
    setUserId(id);
  };

  const {
    level,
    experience,
    showLevelUp,
    newLevel,
    calculateXP,
    resetXP,
    setShowLevelUp,
    getTotalXP
  } = useXPManager();

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Initialize user data
  useEffect(() => {
    const loadData = async () => {
      if (authToken && userId) {
        // For authenticated users, fetch from API
        try {
          const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              xp: getTotalXP(),
              level: level,
              tasksCompleted: completedTasks.length
            })
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }

          const userData = await response.json();
          // Update local state with server data
          setTasks(userData.tasks || []);
          setCompletedTasks(userData.completedTasks || []);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError(error.message);
        }
      } else {
        // For unauthenticated users, load from localStorage
        const savedTasks = localStorage.getItem('tasks');
        const savedCompletedTasks = localStorage.getItem('completedtasks');
        
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedCompletedTasks) setCompletedTasks(JSON.parse(savedCompletedTasks));
      }
    };

    loadData();
  }, [authToken, userId]);

  // Sync data with server for authenticated users
  useEffect(() => {
    const syncData = async () => {
      if (authToken && userId) {
        try {
          await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              xp: getTotalXP(),
              level: level,
              tasksCompleted: completedTasks.length,
              tasks: tasks,
              completedTasks: completedTasks
            })
          });
        } catch (error) {
          console.error('Error syncing data:', error);
          setError('Failed to sync with server');
        }
      }
    };

    syncData();
  }, [authToken, userId, tasks, completedTasks, level, getTotalXP]);

  const addTask = (taskData) => {
    try {
      const newTask = {
        ...taskData,
        id: uuidv4(),
        createdAt: new Date().toISOString()
      };
      
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      
      // Only save to localStorage for unauthenticated users
      if (!authToken) {
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      }
    } catch (error) {
      console.error('Error adding task:', error);
      setError(error.message);
    }
  };

  const completeTask = async (task) => {
    try {
      const updatedTasks = tasks.filter(t => t.id !== task.id);
      const completedTask = {
        ...task,
        completedAt: new Date().toISOString()
      };
      const updatedCompletedTasks = [...completedTasks, completedTask];
      
      const xpResult = calculateXP(task.experience);
      
      setTasks(updatedTasks);
      setCompletedTasks(updatedCompletedTasks);
      
      // Only save to localStorage for unauthenticated users
      if (!authToken) {
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        localStorage.setItem('completedtasks', JSON.stringify(updatedCompletedTasks));
      }
    } catch (error) {
      console.error('Error completing task:', error);
      setError(error.message);
    }
  };

  const removeTask = (taskId, isCompleted) => {
    try {
      if (isCompleted) {
        const updatedCompletedTasks = completedTasks.filter(t => t.id !== taskId);
        setCompletedTasks(updatedCompletedTasks);
        if (!authToken) {
          localStorage.setItem('completedtasks', JSON.stringify(updatedCompletedTasks));
        }
      } else {
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        setTasks(updatedTasks);
        if (!authToken) {
          localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        }
      }
    } catch (error) {
      console.error('Error removing task:', error);
      setError(error.message);
    }
  };

  const clearAllData = async () => {
    try {
      setTasks([]);
      setCompletedTasks([]);
      const { level: resetLevel, experience: resetExp } = resetXP();
      
      if (authToken && userId) {
        // Clear data in database for authenticated users
        await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            xp: resetExp,
            level: resetLevel,
            tasksCompleted: 0,
            tasks: [],
            completedTasks: []
          })
        });
      } else {
        // Clear localStorage for unauthenticated users
        localStorage.removeItem('tasks');
        localStorage.removeItem('completedtasks');
        localStorage.removeItem('experience');
        localStorage.removeItem('level');
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      setError(error.message);
    }
  };


  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
    setCurrentView(showLeaderboard ? 'todo' : 'leaderboard');
  };

  const handleShowCompleted = () => {
    setShowCompleted(true);
    setShowLeaderboard(false);
    setCurrentView('completed');
  };
  const handleShowTodo = () => {
    setShowCompleted(false);
    setShowLeaderboard(false);
    setCurrentView('todo');
  };

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="fixed top-4 w-full flex justify-between px-4">
        <div className="flex items-center">
          <Auth onAuthChange={handleAuthChange} />
        </div>
        <div>
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </div>
      </div>
      
      <Header />
      {error && (
        <div className="mx-4 my-2 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
          Error: {error}
        </div>
      )}
      
      <div className="relative max-w-4xl mx-auto px-4 py-6 space-y-6">
        <ProgressBar level={level} experience={experience} />
        <StreakTracker tasks={tasks} completedTasks={completedTasks} />
        
        <CSSTransition
          in={!showLeaderboard}
          timeout={300}
          classNames="fade"
          unmountOnExit
        >
          <div>
            <TaskButtons 
              showCompleted={showCompleted} 
              setShowCompleted={handleShowCompleted}
              setShowTodo={handleShowTodo}
            />
            <TaskForm addTask={addTask} />
          </div>
        </CSSTransition>

        <div className="flex justify-between gap-4">
          <button 
            onClick={() => {
              setShowLeaderboard(!showLeaderboard);
              setCurrentView(showLeaderboard ? 'todo' : 'leaderboard');
            }}
            className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 font-bold text-lg border-3 border-gray-800 dark:border-gray-200 
                     text-gray-800 dark:text-gray-200 shadow-[4px_4px_#77dd77] hover:shadow-none hover:translate-x-1 
                     hover:translate-y-1 transition-all duration-200 rounded-none"
          >
            {showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'}
          </button>
          <button 
            onClick={clearAllData}
            className="px-3 py-2 bg-white dark:bg-gray-800 font-bold text-lg border-3 border-gray-800 dark:border-gray-200 
                     text-gray-800 dark:text-gray-200 shadow-[4px_4px_#77dd77] hover:shadow-none hover:translate-x-1 
                     hover:translate-y-1 transition-all duration-200 rounded-none"
          >
            Clear All Data
          </button>
        </div>
        
        <div className="relative z-0 overflow-hidden">
          <SwitchTransition mode="out-in">
            <CSSTransition
              key={currentView}
              classNames="slide"
              timeout={300}
              unmountOnExit
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
                {currentView === 'leaderboard' && <Leaderboard authToken={authToken} />}
                {currentView === 'todo' && (
                  <TaskList 
                    tasks={tasks} 
                    removeTask={removeTask}
                    completeTask={completeTask}
                    isCompleted={false}
                  />
                )}
                {currentView === 'completed' && (
                  <TaskList 
                    tasks={completedTasks} 
                    removeTask={removeTask}
                    completeTask={completeTask}
                    isCompleted={true}
                  />
                )}
              </div>
            </CSSTransition>
          </SwitchTransition>
        </div>
      </div>

      <LevelUpModal 
        show={showLevelUp}
        onClose={() => setShowLevelUp(false)} 
        level={newLevel}
      />
    </div>
  );
};

export default App;