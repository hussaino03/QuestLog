import React, { useState, useRef, useEffect } from 'react';

const Chat = ({ isOpen, onClose }) => { 
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState(null);
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);

  const commonPrompts = [
    "How am I doing with my tasks today?",
    "What's my productivity trend?",
    "Tips to improve my task completion rate",
    "Show me my recent achievements"
  ];

  const handlePromptClick = (prompt) => {
    setMessage(prompt);
    sendMessage(null, prompt);
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const sendMessage = async (e, promptOverride = null) => {
    e?.preventDefault();
    
    const messageToSend = promptOverride || message;
    if (!messageToSend.trim() || isLoading) return;
    
    setIsLoading(true);
    const userMessage = messageToSend.trim();
    setMessage('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    
    const previousResponses = messages
      .filter(m => m.type === 'ai')
      .map(m => m.content)
      .slice(-2);

    try {
      const API_BASE_URL = process.env.REACT_APP_PROD || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          message: userMessage,
          previousResponses,
          conversationContext
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(response.statusText);
      }
      
      const data = await response.json();
      
      if (!data.response) {
        throw new Error('Invalid response format');
      }
      
      setMessages(prev => [...prev, { type: 'ai', content: data.response }]);
      if (data.conversationContext) {
        setConversationContext(data.conversationContext);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: 'Sorry, I had trouble processing that request. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full h-[600px] flex flex-col shadow-2xl transform scale-100 animate-modalSlide"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Productivity Assistant
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <span className="text-red-600 dark:text-red-400 text-lg">×</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-4">
              <p className="text-center text-gray-600 dark:text-gray-400">
                Choose a prompt or type your own message
              </p>
              <div className="grid grid-cols-1 gap-2">
                {commonPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt)}
                    className="text-left px-4 py-2 rounded-lg border border-gray-200 
                             dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 
                             transition-colors text-gray-800 dark:text-gray-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.type === 'user'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    : msg.type === 'error'
                    ? 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 
                            text-gray-900 dark:text-gray-100 animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={sendMessage} className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about your productivity..."
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 
                       border-2 border-gray-800 shadow-[2px_2px_#2563EB]
                       hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 
                       transition-all duration-200 disabled:opacity-50 
                       disabled:cursor-not-allowed disabled:hover:shadow-[2px_2px_#2563EB]
                       disabled:hover:translate-x-0 disabled:hover:translate-y-0
                       text-gray-800 dark:text-white font-medium"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
