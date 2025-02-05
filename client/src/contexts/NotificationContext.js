import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect
} from 'react';

const NotificationContext = createContext(null);
const STORAGE_KEY = 'notifications';
const MAX_NOTIFICATIONS = 50;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const addNotification = useCallback((message, type = 'info', id = null) => {
    // If no ID is provided, fallback to timestamp-based
    const notificationId = id || Date.now();

    const newNotification = {
      id: notificationId,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications((prev) => {
      // Check if this ID is already in notifications
      const existing = prev.find((n) => n.id === notificationId);
      if (existing) {
        // If it's cleared or present, skip adding again
        return prev;
      }
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications((prev) => {
      const clearedNotifications = prev.map((n) => ({ ...n, cleared: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clearedNotifications));
      return [];
    });
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allNotifications = JSON.parse(stored);
      const activeNotifications = allNotifications.filter((n) => !n.cleared);
      setNotifications(activeNotifications);
    }
  }, []);

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        hasUnread,
        addNotification,
        markAllAsRead,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }
  return context;
};
