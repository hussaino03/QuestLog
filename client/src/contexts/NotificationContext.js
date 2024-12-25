import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

const NotificationContext = createContext(null);
const STORAGE_KEY = 'notifications';
const MAX_NOTIFICATIONS = 50;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const addNotification = useCallback((message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => {
      // Check for duplicates and cleared status
      const isDuplicate = prev.some(n => 
        n.message === message && 
        n.type === type &&
        (n.cleared || !n.cleared === undefined)  // Consider both cleared and undefined cleared status
      );

      if (isDuplicate) return prev;

      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications(prev => {
      const clearedNotifications = prev.map(n => ({ ...n, cleared: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clearedNotifications));
      return []; // Still clear the visual list
    });
  }, []);

  // This effect now filters out cleared notifications on page load
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allNotifications = JSON.parse(stored);
      const activeNotifications = allNotifications.filter(n => !n.cleared);
      setNotifications(activeNotifications);
    }
  }, []);

  const hasUnread = notifications.some(n => !n.read);

  return (
    <NotificationContext.Provider value={{
      notifications,
      hasUnread,
      addNotification,
      markAllAsRead,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};