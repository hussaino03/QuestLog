import React, { useState, useEffect } from 'react';
import { Heart, Star} from 'lucide-react';

const REMINDER_INTERVAL = 5 * 24 * 60 * 60 * 1000; // 5 days

const SupportReminder = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkAndShowReminder = () => {
      const lastReminder = localStorage.getItem('lastSupportReminder');
      const now = Date.now();

      if (!lastReminder || (now - parseInt(lastReminder)) > REMINDER_INTERVAL) {
        setIsVisible(true);
        localStorage.setItem('lastSupportReminder', now.toString());
      }
    };

    const timer = setTimeout(checkAndShowReminder, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 max-w-sm w-[calc(100%-2rem)] animate-slideUp">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Enjoying QuestLog?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Help us grow by showing your support! Every little bit helps us continue improving.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://github.com/hussaino03/QuestLog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                           bg-gray-100 dark:bg-gray-700 text-sm font-medium
                           text-gray-900 dark:text-gray-100 hover:bg-gray-200 
                           dark:hover:bg-gray-600 transition-colors"
                >
                  <Star className="w-4 h-4" />
                  Star on GitHub
                </a>
                <a
                  href="https://paypal.me/hussaino03"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                           bg-blue-50 dark:bg-blue-900/30 text-sm font-medium
                           text-blue-600 dark:text-blue-400 hover:bg-blue-100 
                           dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  Support Development
                </a>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
            >
              <span className="text-red-600 dark:text-red-400 text-lg">×</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportReminder;
