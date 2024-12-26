import React from 'react';
import { createPortal } from 'react-dom';
import Badge from './Badge.js';
import { Trophy } from 'lucide-react';

const BadgesModal = ({ isOpen, onClose, badges, unlockedBadges }) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 
                 flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full 
                   shadow-2xl transform scale-100 animate-modalSlide
                   max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700
                      sticky top-0 bg-white dark:bg-gray-800 z-[60]"
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-gray-900 dark:text-white" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Badges
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center 
                     bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <span className="text-red-600 dark:text-red-400 text-lg">×</span>
          </button>
        </div>

        {/* Badge Grid */}
        <div
          className="overflow-y-auto overflow-x-hidden flex-1
                      scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
                      scrollbar-track-transparent"
        >
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {Object.values(badges).map((badge) => (
                <Badge
                  key={badge.id}
                  badge={badge}
                  isUnlocked={unlockedBadges.includes(badge.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BadgesModal;
