import './styles/globals.css';
import React, { useState, useEffect } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { v4 as uuidv4 } from 'uuid';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import TaskButtons from './components/TaskButtons';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import LevelUpModal from './components/LevelUpModal';
import StreakTracker from './components/StreakTracker';
import Leaderboard from './components/Leaderboard';
import useXPManager from './components/XPManager';
import AppControls from './components/AppControls';
import Auth from './components/Auth';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ClearDataModal from './components/ClearDataModal';
import Feedback from './components/Feedback';
import { validateUserId } from './utils/validation';

const API_BASE_URL = process.env.REACT_APP_PROD || 'http://localhost:3001/api';

const App = () => {
  const [isDark, setIsDark] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('todo');
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [userName, setUserName] = useState(null);

  const handleAuthChange = (id, isLogout = false) => {
    setUserId(id);
    if (!id && isLogout) {  // Only clear data if actively logging out
      setTasks([]);
      setCompletedTasks([]);
      resetXP();
      setError(null);
      setShowLeaderboard(false);
      setCurrentView('todo');
    }
  };

  const handleLogout = () => {
    // Auth component now handles logout cleanup
    setCurrentView('todo');
  };

  const handleUserDataLoad = (userData) => {
    // Add name handling
    setUserName(userData.name || null);
    // Update XP and level
    const loadedXP = userData.xp || 0;    
    resetXP();
    setTotalExperience(loadedXP); // Replace calculateXP with direct set
    
    // Load tasks from server data only
    if (userData.tasks) {
      setTasks(userData.tasks);
    }
    
    if (userData.completedTasks) {
      setCompletedTasks(userData.completedTasks);
    }
};

  const {
    level,
    experience,
    showLevelUp,
    newLevel,
    calculateXP,
    resetXP,
    setShowLevelUp,
    getTotalXP,
    setTotalExperience
  } = useXPManager();

  useEffect(() => {
    // Check for saved theme preference
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

  const toggleView = () => {
    setShowCompleted(!showCompleted);
    setShowLeaderboard(false);
    setCurrentView(!showCompleted ? 'completed' : 'todo');
  };

  const initializeUser = async () => {
    // Load local storage data for all users
  const savedTasks = localStorage.getItem('tasks');
  const savedCompletedTasks = localStorage.getItem('completedtasks');
  const savedXP = localStorage.getItem('totalExperience');

  if (savedTasks) {
    setTasks(JSON.parse(savedTasks));
  }

  if (savedCompletedTasks) {
    setCompletedTasks(JSON.parse(savedCompletedTasks));
  }

  // Direct set instead of calculate
  if (savedXP) {
    setTotalExperience(parseInt(savedXP));
  }
  
    if (userId) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            xp: getTotalXP(),
            level: level,
            tasksCompleted: completedTasks?.length || 0
          }),
        });
  
        if (!response.ok) {
          throw new Error(`Failed to update user: ${response.status}`);
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        setError(error.message);
      }
    }
  };
  

useEffect(() => {
  initializeUser();
}, []); // eslint-disable-line react-hooks/exhaustive-deps


useEffect(() => {
  if (!userId) return;

  const updateUserData = async () => {
    try {
      validateUserId(userId);
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          xp: getTotalXP(),
          level: level,
          tasksCompleted: completedTasks.length,
          tasks: tasks,
          completedTasks: completedTasks
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user data: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      setError(`Failed to update user data: ${error.message}`);
    }
  };

  updateUserData();
}, [userId, tasks, completedTasks, experience, level]); // eslint-disable-line react-hooks/exhaustive-deps

const addTask = async (taskData) => {
  try {
    const newTask = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));

    if (userId) {
      await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', 
        body: JSON.stringify({
          xp: getTotalXP(),
          level: level,
          tasksCompleted: completedTasks.length,
          tasks: updatedTasks,
          completedTasks: completedTasks
        }),
      });
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
    
    // Calculate XP with penalty handled internally by calculateXP
    const xpResult = calculateXP(task.experience, task.deadline);
    
    // Store the early bonus and overdue penalty for record keeping
    completedTask.earlyBonus = xpResult.earlyBonus;
    completedTask.overduePenalty = xpResult.overduePenalty;

    setTasks(updatedTasks);
    setCompletedTasks(updatedCompletedTasks);

    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    localStorage.setItem('completedtasks', JSON.stringify(updatedCompletedTasks));

    // Update the database with the correct total XP
    if (userId) {
      await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          xp: getTotalXP(),
          level: level,
          tasksCompleted: updatedCompletedTasks.length,
          tasks: updatedTasks,
          completedTasks: updatedCompletedTasks
        }),
      });
    }
  } catch (error) {
    console.error('Error completing task:', error);
    setError(error.message);
  }
};


const removeTask = async (taskId, isCompleted) => {
  try {
    let updatedTasks = tasks;
    let updatedCompletedTasks = completedTasks;

    if (isCompleted) {
      // Find the task being removed
      const taskToRemove = completedTasks.find(t => t.id === taskId);
      if (taskToRemove) {
        // Calculate total XP to remove
        let totalXPToRemove = taskToRemove.experience;
        if (taskToRemove.earlyBonus) {
          totalXPToRemove += taskToRemove.earlyBonus;
        }
        if (taskToRemove.overduePenalty) {
          totalXPToRemove += taskToRemove.overduePenalty;
        }

        // Remove the XP and store the result
        calculateXP(-totalXPToRemove);
      }
      
      updatedCompletedTasks = completedTasks.filter(t => t.id !== taskId);
      setCompletedTasks(updatedCompletedTasks);
      localStorage.setItem('completedtasks', JSON.stringify(updatedCompletedTasks));
    } else {
      updatedTasks = tasks.filter(t => t.id !== taskId);
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    }

    // Update server if user is authenticated
    if (userId) {
      const currentTotalXP = getTotalXP();
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          xp: currentTotalXP, 
          level,
          tasksCompleted: updatedCompletedTasks.length,
          tasks: updatedTasks,
          completedTasks: updatedCompletedTasks
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user data: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('Error removing task:', error);
    setError(error.message);
  }
};


  const clearAllData = async () => {
    // Clear local storage for all users
    localStorage.removeItem('tasks');
    localStorage.removeItem('completedtasks');
    localStorage.removeItem('experience');
    localStorage.removeItem('level');
    
    setTasks([]);
    setCompletedTasks([]);
    const { level: resetLevel, experience: resetExp } = resetXP();
  
    // Only update database if authenticated
    if (userId) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            xp: resetExp,
            level: resetLevel, 
            tasksCompleted: 0,
          }),
        });
  
        if (!response.ok) {
          throw new Error(`Failed to reset user data: ${response.status}`);
        }
      } catch (error) {
        console.error('Error clearing data:', error);
        setError(error.message);
      }
    }
  };

  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
    // Reset showCompleted state when toggling leaderboard
    if (!showLeaderboard) {
      setShowCompleted(false);
    }
    setCurrentView(showLeaderboard ? 'todo' : 'leaderboard');
  };

  const handleClearDataClick = () => {
    setShowClearDataModal(true);
  };

  const handleConfirmClear = async () => {
    await clearAllData();
    setShowClearDataModal(false);
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Header 
          authComponent={
            <Auth 
              onAuthChange={handleAuthChange} 
              onLogout={handleLogout}
              handleUserDataLoad={handleUserDataLoad}
            />
          }
          AppControls={
            <AppControls 
              isDark={isDark} 
              onToggle={toggleTheme} 
              feedbackComponent={<Feedback />}
            />
          }
        />
        {error && (
        <div className="mx-4 my-2 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
          Error: {error}
        </div>
      )}
      <div className="relative max-w-4xl mx-auto px-4 py-6 space-y-6">
        <ProgressBar level={level} experience={experience} userName={userName} />
        <div>
          <StreakTracker completedTasks={completedTasks} />
        </div>
        <CSSTransition
          in={!showLeaderboard}
          timeout={300}
          classNames="fade"
          unmountOnExit
        >
          <div>
            <TaskButtons 
              showCompleted={showCompleted} 
              toggleView={toggleView}
            />
            <TaskForm addTask={addTask} />
          </div>
        </CSSTransition>

        <div className="flex justify-between gap-4">
          <button 
            onClick={toggleLeaderboard}
            className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 font-bold text-lg border-3 border-gray-800 dark:border-gray-200 
                     text-gray-800 dark:text-gray-200 shadow-[4px_4px_#77dd77] hover:shadow-none hover:translate-x-1 
                     hover:translate-y-1 transition-all duration-200 rounded-none"
          >
            {showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'}
          </button>
          <button 
            onClick={handleClearDataClick}
            className="px-3 py-2 bg-white dark:bg-gray-800 font-bold text-lg border-3 border-gray-800 dark:border-gray-200 
                     text-gray-800 dark:text-gray-200 shadow-[4px_4px_#ff6b6b] hover:shadow-none hover:translate-x-1 
                     hover:translate-y-1 transition-all duration-200 rounded-none"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-gray-800 dark:text-gray-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
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
                {currentView === 'leaderboard' && <Leaderboard />}
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

      {}
      <LevelUpModal 
        show={showLevelUp}
        onClose={() => setShowLevelUp(false)} 
        level={newLevel}
      />
      <ClearDataModal
        show={showClearDataModal}
        onConfirm={handleConfirmClear}
        onCancel={() => setShowClearDataModal(false)}
      />
      <Analytics />
    </div>
    </GoogleOAuthProvider>
  );
};

export default App;