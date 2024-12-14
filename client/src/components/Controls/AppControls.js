import React, { useState } from 'react';
import { Settings, Bot } from 'lucide-react';
import SettingsModal from '../Settings/SettingsModal';
import Chat from '../AI/Chat';

const AppControls = ({ isDark, onToggle, addTask, isAuthenticated }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setIsChatOpen(true)}
        className="p-2 rounded-lg bg-white dark:bg-gray-800 
                   border-2 border-gray-800 shadow-[2px_2px_#2563EB] 
                   hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 
                   transition-all duration-200"
        aria-label="Chat with AI Assistant"
      >
        <Bot className="w-5 h-5 text-gray-800 dark:text-white" />
      </button>
      
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="p-2 rounded-lg bg-white dark:bg-gray-800 
                   border-2 border-gray-800 shadow-[2px_2px_#2563EB] 
                   hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 
                   transition-all duration-200"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5 text-gray-800 dark:text-white" />
      </button>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDark={isDark}
        onToggleTheme={onToggle}
        addTask={addTask}
        isAuthenticated={isAuthenticated}
      />

      <Chat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export default AppControls;