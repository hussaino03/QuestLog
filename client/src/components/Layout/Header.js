import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Header = ({ authComponent, AppControls }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            
            {/* Desktop Controls */}
            <div className="hidden md:flex items-center">
              {AppControls}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 md:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-800 dark:text-white" />
              ) : (
                <Menu className="w-6 h-6 text-gray-800 dark:text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-end pr-4 space-y-4">
              {AppControls}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;