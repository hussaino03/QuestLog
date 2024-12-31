import './styles/globals.css';
import React, { useState, useEffect, useMemo } from 'react';
import { Users } from 'lucide-react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import {
  NotificationProvider,
  useNotification
} from './contexts/NotificationContext';
import Header from './components/Layout/Header';
import ProgressBar from './components/XP Management/ProgressBar';
import TaskButtons from './components/Modal Management/Buttons';
import Form from './components/Modal Management/Layout/Form';
import TaskList from './components/Modal Management/Layout/List';
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
import CollaborationManager from './services/collaboration/CollaborationManager';
import SupportReminder from './components/Modal Management/SupportReminder';

const AppContent = () => {
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
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  const {
    level,
    experience,
    newLevel,
    calculateXP,
    resetXP,
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

  const { addNotification } = useNotification();
  const badgeManager = useMemo(
    () => new BadgeManager(setUnlockedBadges, addNotification),
    [addNotification]
  );

  const taskManager = new TaskManager(
    calculateXP,
    setTasks,
    setCompletedTasks,
    setError,
    badgeManager 
  );

  const themeManager = useMemo(() => new ThemeManager(setIsDark), []);
  const streakManager = useMemo(() => new StreakManager(setCurrentStreak), []);
  const viewManager = useMemo(
    () => new ViewManager(setShowCompleted, setCurrentView),
    []
  );
  const collaborationManager = useMemo(
    () => new CollaborationManager(setTasks, setError),
    []
  );

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
    const updatedBadges = badgeManager.checkForNewBadges(
      level,
      currentStreak,
      completedTasks,
      unlockedBadges
    );

    if (updatedBadges.length !== unlockedBadges.length) {
      setUnlockedBadges(updatedBadges);
    }
    // eslint-disable-next-line
  }, [level, currentStreak]); 

  useEffect(() => {
    const newStreakData = streakManager.calculateStreak(completedTasks);
    setStreakData(newStreakData);
  }, [completedTasks, streakManager]);

  useEffect(() => {
    if (userId && userName) {
      const stored = localStorage.getItem('notifications');
      const allNotifications = stored ? JSON.parse(stored) : [];
      const welcomeWasCleared = allNotifications.some(
        (n) => n.type === 'welcome' && n.cleared === true
      );

      if (!welcomeWasCleared) {
        addNotification(
          `👋 Hey${userName ? ` ${userName.charAt(0).toUpperCase() + userName.slice(1)}` : ''}! Ready to be productive?`,
          'welcome',
          'welcome_notif'
        );
      }
    }
  }, [userId, userName, addNotification]);

  // Temporary announcement banner starts
  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem('announcements');
      const allAnnouncements = stored ? JSON.parse(stored) : [];
      const collaborationAnnouncementSeen = allAnnouncements.some(
        (a) => a.type === 'collaboration' && a.seen === true
      );

      if (!collaborationAnnouncementSeen) {
        setShowAnnouncement(true);
      }
    }
  }, [userId]);

  const dismissAnnouncement = () => {
    const stored = localStorage.getItem('announcements');
    const allAnnouncements = stored ? JSON.parse(stored) : [];
    
    allAnnouncements.push({
      type: 'collaboration',
      seen: true,
      timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('announcements', JSON.stringify(allAnnouncements));
    setShowAnnouncement(false);
  };
  // Temporary announcement banner ends

  const handleClearDataClick = () => {
    setShowClearDataModal(true);
  };

  const handleConfirmClear = async () => {
    badgeManager.clearNotificationHistory(); 
    await dataManager.clearAllData(userId);
    setShowClearDataModal(false);
  };

  if (loading) {
    // render everything once data is processed only (auth check, user data..etc)
    return null;
  }

  return (
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

                {/* Temporary announcement banner */}
                {showAnnouncement && (
                  <div className="relative bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-blue-400/10 border-b border-blue-200 dark:border-blue-800">
                    <div className="max-w-7xl mx-auto py-3 px-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 dark:bg-blue-400/10">
                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              New Feature: Collaborative Projects
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Share and collaborate on projects with your team in real-time
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={dismissAnnouncement}
                          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
                          aria-label="Dismiss announcement"
                        >
                          <span className="text-red-600 dark:text-red-400 text-lg">×</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Layout Container */}
                <div className="flex flex-col min-h-screen">
                  <div className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
                    <div className="grid lg:grid-cols-[1fr,320px] gap-6 h-full">
                      {/* Main Content Column */}
                      <div className="flex flex-col min-h-[calc(100vh-200px)] lg:min-h-0 lg:h-full">
                        <ProgressBar
                          level={level}
                          experience={experience}
                          userName={userName}
                        />

                        <div className="mt-6 flex-shrink-0">
                          <div className="space-y-4">
                            <TaskButtons
                              showCompleted={showCompleted}
                              toggleView={() =>
                                viewManager.toggleView(showCompleted)
                              }
                              onClearDataClick={handleClearDataClick}
                            />
                            <Form 
                              addTask={taskManager.addTask} 
                              taskManager={taskManager} 
                            />
                          </div>
                        </div>

                        {/* Task List Container */}
                        <div className="mt-6 relative flex-1 min-h-0">
                          <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            <SwitchTransition mode="out-in">
                              <CSSTransition
                                key={currentView}
                                classNames="slide"
                                timeout={300}
                                unmountOnExit
                              >
                                <div className="h-full">
                                  {currentView === 'todo' && (
                                    <TaskList
                                      tasks={tasks}
                                      removeTask={taskManager.removeTask}
                                      completeTask={taskManager.completeTask}
                                      isCompleted={false}
                                      addTask={taskManager.addTask}
                                      updateTask={taskManager.updateTask}
                                      collaborationManager={collaborationManager}
                                      userId={userId} 
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
                        </div>
                      </div>

                      {/* Side Panel - Desktop */}
                      <div className="hidden lg:flex lg:flex-col space-y-6 h-full pt-[102px]">
                        <div className="flex-shrink-0">
                          <BadgeGrid unlockedBadges={unlockedBadges} />
                        </div>
                        <div className="flex-shrink-0">
                          <StreakTracker
                            completedTasks={completedTasks}
                            streakData={streakData}
                          />
                        </div>
                        <div className="flex-1 min-h-0 overflow-auto">
                          <Leaderboard
                            limit={3}
                            className="h-full"
                            onShowFull={() => setShowFullLeaderboard(true)}
                          />
                        </div>
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
                  <Footer userId={userId} />
                </div>

                {/* Full Leaderboard Modal */}
                {showFullLeaderboard && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full flex flex-col max-h-[80vh] animate-modalSlide">
                      <div className="flex-1 flex flex-col min-h-0">
                        <Leaderboard
                          scrollUsers={true}
                          onClose={() => setShowFullLeaderboard(false)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <LevelUpNoti level={newLevel} />
                <ClearDataModal
                  show={showClearDataModal}
                  onConfirm={handleConfirmClear}
                  onCancel={() => setShowClearDataModal(false)}
                />
                <SupportReminder />
                <Analytics />
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
  );
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
