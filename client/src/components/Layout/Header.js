import React from 'react';

const Header = ({ authComponent, AppControls }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              QuestLog
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {authComponent}
            {AppControls}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;