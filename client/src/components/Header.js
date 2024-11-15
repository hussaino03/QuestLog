import React from 'react';

const Header = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">QuestLog</h1>
      </div>
    </header>
  );
};

export default Header;