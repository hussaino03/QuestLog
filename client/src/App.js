import './styles/globals.css';
import React, { useState, useEffect, useMemo } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
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
import ClearDataModal from './components/XP Management/ClearDataModal';
import BadgeGrid from './components/Badge/BadgeGrid';
import Footer from './components/Layout/Footer';
import PrivacyPolicy from './legal/PrivacyPolicy';
import TermsOfService from './legal/TermsOfService';
import Landing from './components/Landing/Landing';
import TaskManager from './services/task/TaskManager';
import DataManager from './services/user/DataManager';
import ThemeManager from './services/theme/ThemeManager';
import StreakManager from './services/streak/StreakManager';
import ViewManager from './services/view/ViewManager';
import BadgeManager from './services/badge/BadgeManager';

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
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);  
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState({ current: 0, longest: 0 });

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

  const dataManager = new DataManager({
    setUserId,
    setTotalExperience,
    setTasks,
    setCompletedTasks,
    setUserName,
    setUnlockedBadges,
    setError,
    resetXP
  });

  const taskManager = new TaskManager(
    calculateXP,
    setTasks,
    setCompletedTasks,
    setError
  );

  const themeManager = useMemo(() => new ThemeManager(setIsDark), []);
  const streakManager = useMemo(() => new StreakManager(setCurrentStreak), []);
  const viewManager = useMemo(() => new ViewManager(setShowCompleted, setCurrentView), []);
  const badgeManager = useMemo(() => new BadgeManager(setUnlockedBadges), []);

  useEffect(() => {
    themeManager.initializeTheme();
  }, [themeManager]);

  const toggleTheme = () => {
    themeManager.toggleTheme(isDark);
  };

  useEffect(() => {
    if (loading) {
      dataManager.checkAndHandleAuth(setLoading);
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dataManager.syncUserData({
      userId,
      getTotalXP,
      level,
      tasks,
      completedTasks,
      unlockedBadges
    });
  }, [userId, tasks, completedTasks, experience, level, unlockedBadges]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    badgeManager.checkAndUpdateBadges(level, currentStreak, completedTasks, unlockedBadges);
  }, [level, currentStreak, completedTasks, unlockedBadges, badgeManager]);

  useEffect(() => {
    const newStreakData = streakManager.calculateStreak(completedTasks);
    setStreakData(newStreakData);
  }, [completedTasks, streakManager]);

  const handleClearDataClick = () => {
    setShowClearDataModal(true);
  };

  const handleConfirmClear = async () => {
    await dataManager.clearAllData(userId);
    setShowClearDataModal(false);
  };

  if (loading) {
    // render everything once data is processed only (auth check, user data..etc)
    return null; 
  }

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              userId ? (
                <Navigate to="/app" replace />
              ) : (
                <Landing isDark={isDark} onToggle={toggleTheme} />
              )
            } 
          />
          <Route 
            path="/app" 
            element={
              userId ? (
                <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                  <Header 
                    authComponent={
                      <Auth 
                        onAuthChange={dataManager.handleAuthChange} 
                        handleUserDataLoad={dataManager.handleUserDataLoad}
                      />
                    }
                    AppControls={
                      <AppControls 
                        isDark={isDark} 
                        onToggle={toggleTheme}
                        addTask={taskManager.addTask}
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
                      <ProgressBar 
                        level={level} 
                        experience={experience} 
                        userName={userName}
                      />
                      
                      <div className="mt-6 flex-shrink-0">
                        <div className="space-y-4">
                          <TaskButtons 
                            showCompleted={showCompleted} 
                            toggleView={() => viewManager.toggleView(showCompleted)}
                            onClearDataClick={handleClearDataClick}
                          />
                          <TaskForm addTask={taskManager.addTask} />
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
                                    removeTask={taskManager.removeTask}
                                    completeTask={taskManager.completeTask}
                                    isCompleted={false}
                                    addTask={taskManager.addTask}  
                                    updateTask={taskManager.updateTask}  
                                  />
                                )}
                                {currentView === 'completed' && (
                                  <TaskList 
                                    tasks={completedTasks} 
                                    removeTask={taskManager.removeTask}
                                    completeTask={taskManager.completeTask}
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
                      <StreakTracker 
                        completedTasks={completedTasks} 
                        streakData={streakData}
                      />
                      <Leaderboard 
                        limit={3} 
                        className="overflow-hidden" 
                        onShowFull={() => setShowFullLeaderboard(true)}
                      />
                    </div>

                    {/* Side Panel - Mobile */}
                    <div className="lg:hidden mt-4"> 
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> 
                        <BadgeGrid unlockedBadges={unlockedBadges} />
                        <StreakTracker 
                          completedTasks={completedTasks} 
                          streakData={streakData}
                        />
                        <Leaderboard 
                          limit={3} 
                          className="overflow-hidden" 
                          onShowFull={() => setShowFullLeaderboard(true)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Leaderboard Modal */}
                {showFullLeaderboard && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full flex flex-col max-h-[80vh] animate-modalSlide">
                      <div className="flex-1 flex flex-col min-h-0">
                        <Leaderboard scrollUsers={true} onClose={() => setShowFullLeaderboard(false)} />
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
                <Footer userId={userId} />
              </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="/legal/privacy" element={<PrivacyPolicy />} />
          <Route path="/legal/terms" element={<TermsOfService />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};
export default App;