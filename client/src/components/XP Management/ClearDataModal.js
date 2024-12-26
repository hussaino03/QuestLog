import React from 'react';

const ClearDataModal = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4 border-3 border-gray-800 dark:border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Clear All Data?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          This will permanently delete all your tasks and reset your progress.
          This action cannot be undone.
        </p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={onCancel}
            className="p-1.5 sm:p-2 rounded-lg bg-white dark:bg-gray-800 font-bold text-base sm:text-lg 
                     border-2 border-gray-800 text-gray-800 dark:text-gray-200 
                     shadow-[2px_2px_#2563EB] hover:shadow-none hover:translate-x-0.5 
                     hover:translate-y-0.5 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="p-1.5 sm:p-2 rounded-lg bg-white dark:bg-gray-800 font-bold text-base sm:text-lg 
                     border-2 border-gray-800 text-gray-800 dark:text-gray-200 
                     shadow-[2px_2px_#ff6b6b] hover:shadow-none hover:translate-x-0.5 
                     hover:translate-y-0.5 transition-all duration-200"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearDataModal;
