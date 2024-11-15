import './styles/globals.css';
import React, { useState, useEffect } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { GoogleOAuthProvider } from '@react-oauth/google';
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
  const [authToken, setAuthToken] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('todo');

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

  useEffect(() => {
    const initializeUser = async () => {
      try {
        let sessionId = localStorage.getItem('sessionId');
        
        if (!sessionId) {
          sessionId = uuidv4();
          localStorage.setItem('sessionId', sessionId);
        }
    
        const headers = {
          'Content-Type': 'application/json'
        };
    
        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }
    
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ 
            sessionId,
            xp: getTotalXP(),
            level: level
          })
        });
    
        if (!response.ok) {
          throw new Error(`Failed to initialize user: ${response.status}`);
        }
    
        const data = await response.json();
        setUserId(data.userId);
      } catch (error) {
        console.error('Error during initialization:', error);
        setError(error.message);
      }
    };


  initializeUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const updateUserData = async () => {
      if (!userId) {
        console.log('No userId available, skipping update');
        return;
      }
    
      try {
        const totalXP = getTotalXP();
        const url = `${API_BASE_URL}/users/${userId}`;
        
        const headers = {
          'Content-Type': 'application/json'
        };
    
        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }
        
        const response = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            xp: totalXP,
            level: level,
            tasksCompleted: completedTasks.length,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update user data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('User data updated successfully:', data);
      } catch (error) {
        console.error('Error updating user data:', error);
        setError(`Failed to update user data: ${error.message}`);
      }
    };

    updateUserData();
  }, [userId, experience, level, completedTasks, authToken, getTotalXP]);


  useEffect(() => {
    const loadTasks = () => {
      const storedTasks = localStorage.getItem('tasks');
      const storedCompletedTasks = localStorage.getItem('completedtasks');
      
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
      
      if (storedCompletedTasks) {
        setCompletedTasks(JSON.parse(storedCompletedTasks));
      }
    };

    loadTasks();
  }, []);

  const addTask = (taskData) => {
    try {
      const newTask = {
        ...taskData,
        id: uuidv4(),
        createdAt: new Date().toISOString()
      };
      
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      console.log('Task added successfully:', newTask);
    } catch (error) {
      console.error('Error adding task:', error);
      setError(error.message);
    }
  };

  const completeTask = (task) => {
    try {
      const updatedTasks = tasks.filter(t => t.id !== task.id);
      const completedTask = {
        ...task,
        completedAt: new Date().toISOString()
      };
      const updatedCompletedTasks = [...completedTasks, completedTask];

      calculateXP(task.experience);

      setTasks(updatedTasks);
      setCompletedTasks(updatedCompletedTasks);

      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      localStorage.setItem('completedtasks', JSON.stringify(updatedCompletedTasks));

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
        localStorage.setItem('completedtasks', JSON.stringify(updatedCompletedTasks));
      } else {
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        setTasks(updatedTasks);
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      }
      console.log('Task removed successfully:', { taskId, isCompleted });
    } catch (error) {
      console.error('Error removing task:', error);
      setError(error.message);
    }
  };


  const clearAllData = async () => {
    try {      
      // Clear local storage
      localStorage.removeItem('tasks');
      localStorage.removeItem('completedtasks');
      localStorage.removeItem('experience');
      localStorage.removeItem('level');
      
      // Reset local state
      setTasks([]);
      setCompletedTasks([]);
      const { level: resetLevel, experience: resetExp } = resetXP();
  
      // If user is logged in, clear their server data
      if (userId) {
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }

        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            xp: 0,
            level: 1,
            tasksCompleted: 0,
            tasks: [],
            completedTasks: [],
            cleared: true // Flag to indicate this was a clear operation
          }),
        });
  
        if (!response.ok) {
          throw new Error(`Failed to reset user data: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      setError(error.message);
    }
  };

  const syncData = async (googleId) => {
    try {
      // Ensure we have both googleId and token
      if (!googleId || !authToken) {
        console.log('Missing googleId or authToken, skipping sync');
        return;
      }
  
      const localData = {
        tasks,
        completedTasks,
        xp: getTotalXP(),
        level
      };
    
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
  
      const response = await fetch(`${API_BASE_URL}/sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          googleId,
          localData
        })
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Sync failed: ${response.status}`);
      }
    
      const mergedData = await response.json();
      
      // Only update local data if there's data to merge and it wasn't cleared
      if (mergedData && !mergedData.cleared) {
        // Ensure we're working with arrays even if server returns null/undefined
        const newTasks = mergedData.tasks || [];
        const newCompletedTasks = mergedData.completedTasks || [];
        
        // Update state
        setTasks(newTasks);
        setCompletedTasks(newCompletedTasks);
        
        // Save to localStorage
        localStorage.setItem('tasks', JSON.stringify(newTasks));
        localStorage.setItem('completedtasks', JSON.stringify(newCompletedTasks));
  
        // Update XP and level if they're different
        if (mergedData.xp !== getTotalXP() || mergedData.level !== level) {
          // You'll need to implement a way to set XP and level directly
          // This might require adding methods to your XPManager
          updateXPAndLevel(mergedData.xp, mergedData.level);
        }
      }
      
      console.log('Data synced successfully');
    } catch (error) {
      console.error('Error syncing data:', error);
      setError(`Failed to sync data: ${error.message}`);
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
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Split the top controls into left and right sections */}
        <div className="fixed top-4 w-full flex justify-between px-4">
          <div className="flex items-center">
          <Auth 
            onAuthChange={(token, googleId) => {
              setAuthToken(token);
              if (token && googleId) {
                syncData(googleId);
              }
            }} 
          />
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
            onClick={toggleLeaderboard}
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
    </div>
    </GoogleOAuthProvider>
  );
};

export default App;