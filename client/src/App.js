import './styles/globals.css';
import React, { useState, useEffect } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { v4 as uuidv4 } from 'uuid';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Layout/Header';
import ProgressBar from './components/XP Management/ProgressBar';
import TaskButtons from './components/Modal Management/Buttons';
import TaskForm from './components/Modal Management/Form';
import TaskList from './components/Modal Management/List';
import LevelUpNoti from './components/XP Management/LevelUp';
import StreakTracker from './components/Streak Management/StreakTracker';
import Leaderboard from './components/Leaderboard/Leaderboard';
import useXPManager from './services/xp/XPManager';
import AppControls from './components/Controls/AppControls';
import Auth from './components/Auth/Auth';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ClearDataModal from './components/XP Management/ClearDataModal';
import { validateUserId } from './services/validationservice';
import { mergeTasks } from './services/syncservice';
import BadgeGrid from './components/Badge/BadgeGrid';
import { checkBadgeUnlocks } from './utils/badgeManager';
import Footer from './components/Layout/Footer';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivacyPolicy from './legal/PrivacyPolicy';
import TermsOfService from './legal/TermsOfService';

const API_BASE_URL = process.env.REACT_APP_PROD || 'http://localhost:3001/api';

const App = () => {
  const [isDark, setIsDark] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('todo');
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [userName, setUserName] = useState(null);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);  

const handleAuthChange = (id, isLogout = false) => {
  setUserId(id);
  if (id) {
    setIsAuthenticated(true);
  } else if (isLogout) {
    setIsAuthenticated(false);
    setTasks([]);
    setCompletedTasks([]);
    resetXP();
    setError(null);
    setCurrentView('todo');
  }
};

  const handleLogout = () => {
    setCurrentView('todo');
  };

const handleUserDataLoad = (userData) => {
  if (!userData) return;
  
  const localTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const localCompletedTasks = JSON.parse(localStorage.getItem('completedtasks') || '[]');
  const localXP = parseInt(localStorage.getItem('totalExperience')) || 0;
  
  // Always merge tasks
  const mergedTasks = mergeTasks(localTasks, userData.tasks || []);
  const mergedCompletedTasks = mergeTasks(localCompletedTasks, userData.completedTasks || []);
  
  // Always handle XP, with proper fallback
  const serverXP = typeof userData.xp === 'number' ? userData.xp : 0;
  const mergedXP = localXP + serverXP;
  
  // Clear localStorage after successful merge
  localStorage.removeItem('totalExperience');
  localStorage.removeItem('tasks');
  localStorage.removeItem('completedtasks');
  
  setTotalExperience(mergedXP);
  setTasks(mergedTasks);
  setCompletedTasks(mergedCompletedTasks);
  
  setUserName(userData.name || null);
  setUnlockedBadges(userData.unlockedBadges || []);
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
  } = useXPManager(isAuthenticated);

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
    setCurrentView(!showCompleted ? 'completed' : 'todo');
  };

  const initializeUser = () => {
    if (!userId) {
      // Load from localStorage for unauthenticated users only
      const savedTasks = localStorage.getItem('tasks');
      const savedCompletedTasks = localStorage.getItem('completedtasks');
      const savedXP = localStorage.getItem('totalExperience');

      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedCompletedTasks) setCompletedTasks(JSON.parse(savedCompletedTasks));
      if (savedXP) setTotalExperience(parseInt(savedXP));
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
          completedTasks: completedTasks,
          unlockedBadges
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
}, [userId, tasks, completedTasks, experience, level, unlockedBadges]); // eslint-disable-line react-hooks/exhaustive-deps

useEffect(() => {
  const newUnlockedBadges = checkBadgeUnlocks(level);
  
  if (JSON.stringify(newUnlockedBadges) !== JSON.stringify(unlockedBadges)) {
    setUnlockedBadges(newUnlockedBadges);
  }
}, [level, unlockedBadges]);

const addTask = async (taskData) => {
  try {
    const tasksToAdd = Array.isArray(taskData) ? taskData : [taskData];
    
    const newTasks = tasksToAdd.map(task => ({
      ...task,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    }));
    
    const updatedTasks = [...tasks, ...newTasks];
    setTasks(updatedTasks);

    if (userId) {
      // For authenticated users, only update server
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
    } else {
      // For unauthenticated users, use localStorage
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
    
    // Calculate XP with penalty handled internally by calculateXP
    const xpResult = calculateXP(task.experience, task.deadline);
    
    // Store the early bonus and overdue penalty for record keeping
    completedTask.earlyBonus = xpResult.earlyBonus;
    completedTask.overduePenalty = xpResult.overduePenalty;

    setTasks(updatedTasks);
    setCompletedTasks(updatedCompletedTasks);

    if (userId) {
      // For authenticated users, only update server
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
    } else {
      // For unauthenticated users, use localStorage
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      localStorage.setItem('completedtasks', JSON.stringify(updatedCompletedTasks));
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
      const taskToRemove = completedTasks.find(t => t.id === taskId);
      if (taskToRemove) {
        let totalXPToRemove = taskToRemove.experience;
        if (taskToRemove.earlyBonus) totalXPToRemove += taskToRemove.earlyBonus;
        if (taskToRemove.overduePenalty) totalXPToRemove += taskToRemove.overduePenalty;
        calculateXP(-totalXPToRemove);
      }
      
      updatedCompletedTasks = completedTasks.filter(t => t.id !== taskId);
      setCompletedTasks(updatedCompletedTasks);
      if (!userId) {
        localStorage.setItem('completedtasks', JSON.stringify(updatedCompletedTasks));
      }
    } else {
      updatedTasks = tasks.filter(t => t.id !== taskId);
      setTasks(updatedTasks);
      if (!userId) {
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      }
    }

    if (userId) {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          xp: getTotalXP(),
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

const updateTask = async (taskId, updatedTask) => {
  try {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? updatedTask : task
    );
    
    setTasks(updatedTasks);
    
    if (!userId) {
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } else {
      await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tasks: updatedTasks,
          completedTasks
        }),
      });
    }
  } catch (error) {
    console.error('Error updating task:', error);
    setError(error.message);
  }
};

const clearAllData = async () => {
  if (!userId) {
    localStorage.removeItem('tasks');
    localStorage.removeItem('completedtasks');
    localStorage.removeItem('totalExperience');
  }
  
  setTasks([]);
  setCompletedTasks([]);
  resetXP();  

  if (userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          xp: 0,
          level: 1,
          tasksCompleted: 0,
          tasks: [],
          completedTasks: []
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

  const handleClearDataClick = () => {
    setShowClearDataModal(true);
  };

  const handleConfirmClear = async () => {
    await clearAllData();
    setShowClearDataModal(false);
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/legal/privacy" element={<PrivacyPolicy />} />
          <Route path="/legal/terms" element={<TermsOfService />} />
          <Route path="/" element={
            <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <Header 
                authComponent={
                  <Auth 
                    isAuthenticated={isAuthenticated}
                    onAuthChange={handleAuthChange} 
                    onLogout={handleLogout}
                    handleUserDataLoad={handleUserDataLoad}
                  />
                }
                AppControls={
                  <AppControls 
                    isDark={isDark} 
                    onToggle={toggleTheme}
                    addTask={addTask}
                    isAuthenticated={!!userId}  
                  />
                }
              />
              {error && (
              <div className="mx-4 my-2 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
                Error: {error}
              </div>
            )}
            
            {/* Main Layout Container */}
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid lg:grid-cols-[1fr,320px] gap-6"> 
                {/* Main Content Column */}
                <div className="flex flex-col min-w-0"> 
                  <ProgressBar level={level} experience={experience} userName={userName} />
                  
                  <div className="mt-6 flex-shrink-0">
                    <div className="space-y-4">
                      <TaskButtons 
                        showCompleted={showCompleted} 
                        toggleView={toggleView}
                        onClearDataClick={handleClearDataClick}
                      />
                      <TaskForm addTask={addTask} />
                    </div>
                  </div>

                  {/* Task List Container with Gradient */}
                  <div className="mt-6 relative">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200 overflow-hidden">
                      <SwitchTransition mode="out-in">
                        <CSSTransition
                          key={currentView}
                          classNames="slide"
                          timeout={300}
                          unmountOnExit
                        >
                          <div className="min-h-[300px]"> 
                            {currentView === 'todo' && (
                              <TaskList 
                                tasks={tasks} 
                                removeTask={removeTask}
                                completeTask={completeTask}
                                isCompleted={false}
                                addTask={addTask}  
                                updateTask={updateTask}  
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
                    {/* Gradient Overlay */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b 
                      from-transparent via-transparent to-gray-50/80 dark:to-gray-900/80 pointer-events-none"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Side Panel - Desktop */}
                <div className="hidden lg:flex lg:flex-col space-y-6 flex-shrink-0 pt-[102px]">
                  <BadgeGrid unlockedBadges={unlockedBadges} />
                  <StreakTracker completedTasks={completedTasks} />
                  <Leaderboard 
                    limit={3} 
                    className="overflow-hidden" 
                    onShowFull={() => setShowFullLeaderboard(true)}
                    authState={isAuthenticated}
                  />
                </div>

                {/* Side Panel - Mobile */}
                <div className="lg:hidden mt-4"> 
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> 
                    <BadgeGrid unlockedBadges={unlockedBadges} />
                    <StreakTracker completedTasks={completedTasks} />
                    <Leaderboard 
                      limit={3} 
                      className="overflow-hidden" 
                      onShowFull={() => setShowFullLeaderboard(true)}
                      authState={isAuthenticated}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Full Leaderboard Modal */}
            {showFullLeaderboard && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full flex flex-col max-h-[80vh] animate-modalSlide">
                  <div className="shrink-0 flex justify-end items-center py-2 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
                    <button
                      onClick={() => setShowFullLeaderboard(false)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
                    >
                      <span className="text-red-600 dark:text-red-400 text-lg">×</span>
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col min-h-0">
                    <Leaderboard scrollUsers={true} authState={isAuthenticated} />
                  </div>
                </div>
              </div>
            )}

            <LevelUpNoti 
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
            <Footer />
          </div>
          } />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};
export default App;