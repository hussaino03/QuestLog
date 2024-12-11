import React from 'react';
import { SunMoon, Link2, Moon, Sun } from 'lucide-react';
import Integrations from '../../integrations';

const SettingsModal = ({ isOpen, onClose, isDark, onToggleTheme, addTask, isAuthenticated }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 
                 flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full 
                   shadow-2xl transform scale-100 animate-modalSlide"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <span className="text-red-600 dark:text-red-400 text-lg">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Theme Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SunMoon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  Appearance
                </h3>
              </div>
              <button
                onClick={onToggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                         bg-white dark:bg-gray-800 font-medium
                         border-2 border-gray-800 text-gray-800 dark:text-gray-200 
                         shadow-[2px_2px_#2563EB] hover:shadow-none hover:translate-x-0.5 
                         hover:translate-y-0.5 transition-all duration-200"
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span className="text-sm">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Dark</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Choose your preferred theme mode
            </div>
          </section>

          {/* Integrations Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Connected Services
              </h3>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <Integrations addTask={addTask} isAuthenticated={isAuthenticated} />
            </div>
          </section>

          {/* Info Section */}
          <section className="mt-6 pt-6 border-t dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Version 1.3.0</span>
              <a href="/legal/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">
                Privacy Policy
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
