import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

const Notification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, hasUnread, markAllAsRead, clearNotifications } =
    useNotification();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-white dark:bg-gray-800 
                  border-2 border-gray-800 shadow-[2px_2px_#2563EB] 
                  hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 
                  transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-800 dark:text-white" />
        {hasUnread && (
          <span
            className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 
                         ring-2 ring-white dark:ring-gray-800"
          />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                      border-2 border-gray-800 z-50"
        >
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Notifications
            </h3>
            <div className="flex gap-2">
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Mark all as read
              </button>
              <button
                onClick={clearNotifications}
                className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 
                              ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
