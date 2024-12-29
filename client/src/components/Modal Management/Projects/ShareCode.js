import React, { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';  

const ShareCode = ({ taskId, collaborationManager, task, userId }) => {  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copying, setCopying] = useState(false);

  const handleShare = async () => {
    const shareCode = taskId;
    
    try {
      const updatedTask = {
        ...task,
        isShared: true,
        sharedWith: task.sharedWith || [userId] 
      };

      console.log('[SHARE] Initializing project sharing:', {
        id: task.id,
        owner: userId,
        sharedWith: updatedTask.sharedWith
      });

      // Update the project details first
      await collaborationManager.updateSharedProjectDetails(taskId, updatedTask);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareCode);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);

    } catch (error) {
      console.error('[SHARE] Failed to share project:', error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 
                  dark:hover:text-blue-300 text-sm font-medium"
      >
        👥 <span className="hidden sm:inline">Invite Collaborators</span>
        <span className="sm:hidden">Invite</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl transform scale-100 animate-modalSlide">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Share Project
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                <span className="text-red-600 dark:text-red-400 text-lg">×</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <input
                    type="text"
                    value={taskId}
                    readOnly
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 text-sm"
                  />
                  <button
                    onClick={handleShare}
                    className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 
                             transition-colors text-gray-500 dark:text-gray-400
                             hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {copying ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clipboard className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Share this code with others to collaborate on this project
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareCode;
