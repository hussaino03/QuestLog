import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Enhanced message renderer with visual elements
const MessageContent = ({ content, type }) => {
  if (type === 'user' || type === 'error') {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  // Parse and enhance AI responses
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom styling for different markdown elements
          p: ({ children }) => (
            <p className="mb-2 text-gray-700 dark:text-gray-300 leading-relaxed">
              {children}
            </p>
          ),

          // Style headings
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-3 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-2 mb-1">
              {children}
            </h3>
          ),

          // Style lists with icons
          ul: ({ children }) => (
            <ul className="space-y-1 my-2 ml-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1 my-2 ml-4 list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700 dark:text-gray-300 flex items-start">
              <span className="mr-2 text-blue-500 dark:text-blue-400">→</span>
              <span className="flex-1">{children}</span>
            </li>
          ),

          // Style bold text
          strong: ({ children }) => (
            <strong className="font-semibold text-blue-600 dark:text-blue-400">
              {children}
            </strong>
          ),

          // Style italic text
          em: ({ children }) => (
            <em className="italic text-gray-600 dark:text-gray-400">
              {children}
            </em>
          ),

          code: ({ inline, children }) => {
            if (inline) {
              return (
                <span className="text-gray-800 dark:text-gray-200">
                  {children}
                </span>
              );
            }
            return (
              <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 rounded-lg overflow-x-auto my-2">
                <code className="text-sm font-mono">{children}</code>
              </pre>
            );
          },

          // Style tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
              {children}
            </td>
          ),

          // Style blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-2 bg-blue-50 dark:bg-blue-900/20 italic">
              {children}
            </blockquote>
          ),

          // Style links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {children}
            </a>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const Chat = ({ isOpen = true, onClose = () => {} }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState(null);
  const [isMinimized, setIsMinimized] = useState(true); // Start minimized by default
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);

  const commonPrompts = [
    "What's my productivity trend?",
    'How do I compare to other users?',
    'How far am I from the top of the leaderboard?',
    'Tips to improve my task completion rate',
    'Show me my recent achievements'
  ];

  const handlePromptClick = (prompt) => {
    setMessage(prompt);
    sendMessage(null, prompt);
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle click outside modal to minimize
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsMinimized(true);
      }
    };

    if (!isMinimized) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMinimized]);

  // Handle escape key to minimize
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isMinimized) {
        setIsMinimized(true);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMinimized]);

  const sendMessage = async (e, promptOverride = null) => {
    e?.preventDefault();

    const messageToSend = promptOverride || message;
    if (!messageToSend.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = messageToSend.trim();
    setMessage('');
    setMessages((prev) => [...prev, { type: 'user', content: userMessage }]);

    const previousResponses = messages
      .filter((m) => m.type === 'ai')
      .map((m) => m.content)
      .slice(-2);

    try {
      const API_BASE_URL =
        process.env.REACT_APP_PROD || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage,
          previousResponses,
          conversationContext
        })
      });

      if (!response.ok) {
        let errorMessage =
          'Sorry, I had trouble processing that request. Please try again.';

        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If JSON parsing fails, use default message
          console.error('Could not parse error response:', e);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.response) {
        throw new Error('Invalid response format');
      }

      setMessages((prev) => [...prev, { type: 'ai', content: data.response }]);
      if (data.conversationContext) {
        setConversationContext(data.conversationContext);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          type: 'error',
          content:
            error.message ||
            'Sorry, I had trouble processing that request. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Minimized view
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 
                 w-14 h-14 rounded-full
                 bg-gradient-to-r from-blue-500 to-blue-600 
                 hover:from-blue-600 hover:to-blue-700
                 text-white shadow-xl hover:shadow-2xl
                 transition-all duration-200 hover:scale-110
                 flex items-center justify-center group animate-fadeIn"
        title="Open Productivity Assistant"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      aria-modal="true"
      role="dialog"
      onClick={(e) => e.target === e.currentTarget && setIsMinimized(true)}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full 
                   h-[600px] max-h-[85vh] flex flex-col 
                   shadow-2xl transform scale-100 animate-modalSlide overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Productivity Assistant
          </h2>
          <button
            onClick={() => setIsMinimized(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center 
                     bg-red-500/10 hover:bg-red-500/20 transition-colors"
            title="Close"
          >
            <span className="text-red-600 dark:text-red-400 text-lg">×</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
          {messages.length === 0 && (
            <div className="space-y-5">
              <div className="text-center pt-4">
                <p className="text-gray-600 dark:text-gray-400 mb-1 text-base">
                  👋 Hi! I'm your productivity assistant
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Choose a prompt below or ask me anything about your tasks
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {commonPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt)}
                    className="group text-left px-4 py-3 rounded-lg 
                             bg-gradient-to-r from-gray-50 to-gray-100/50
                             dark:from-gray-800 dark:to-gray-700/50
                             border border-gray-200 dark:border-gray-700
                             hover:border-blue-300 dark:hover:border-blue-500
                             hover:shadow-md hover:shadow-blue-500/10
                             transition-all duration-200
                             text-gray-700 dark:text-gray-200 text-sm
                             relative overflow-hidden"
                  >
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    ></div>
                    <span className="relative flex items-center gap-2">
                      <span className="text-blue-500 dark:text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                      <span className="flex-1">{prompt}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 shadow-sm ${
                  msg.type === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                    : msg.type === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <MessageContent content={msg.content} type={msg.type} />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-fadeIn">
              <div
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                            rounded-lg px-4 py-3 flex items-center gap-2 shadow-sm"
              >
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  ></div>
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  Thinking...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={sendMessage}
          className="p-4 border-t dark:border-gray-700"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about your productivity..."
              className="flex-1 rounded-lg border-2 border-gray-200 dark:border-gray-600 
                       bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-gray-100 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                       placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 
                       hover:from-blue-600 hover:to-blue-700
                       text-white font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200 shadow-md hover:shadow-lg
                       disabled:hover:shadow-md"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
