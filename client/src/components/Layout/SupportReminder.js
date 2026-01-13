import React, { useState, useEffect } from 'react';
import {
  Heart,
  Star,
  Send,
  Code,
  Paintbrush,
  GraduationCap,
  User,
  BookOpen,
  Plus
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_PROD || 'http://localhost:3001/api';
const REMINDER_INTERVAL = 5 * 24 * 60 * 60 * 1000;

const SupportReminder = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRole, setRole] = useState('');
  const [showRoles, setShowRoles] = useState(false);

  const roles = [
    { id: 'Student', icon: GraduationCap, label: 'Student' },
    { id: 'Developer', icon: Code, label: 'Developer' },
    { id: 'Designer', icon: Paintbrush, label: 'Designer' },
    { id: 'Educator', icon: BookOpen, label: 'Educator' },
    { id: 'Other', icon: Plus, label: 'Other' }
  ];

  useEffect(() => {
    const checkAndShowReminder = () => {
      const lastReminder = localStorage.getItem('lastSupportReminder');
      const now = Date.now();

      if (!lastReminder || now - parseInt(lastReminder) > REMINDER_INTERVAL) {
        setIsVisible(true);
        localStorage.setItem('lastSupportReminder', now.toString());
      }
    };

    const timer = setTimeout(checkAndShowReminder, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSubmitFeedback = async () => {
    if (!rating || !feedback) return;
    setIsSubmitting(true);

    try {
      const feedbackData = {
        ratings: {
          overall: rating
        },
        feedback
      };

      if (selectedRole) {
        feedbackData.role = selectedRole;
      }

      await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(feedbackData)
      });
      handleClose();
      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 max-w-sm w-[calc(100%-2rem)] animate-slideUp">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Be Featured on QuestLog! 🌟
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Share your experience and get featured on our landing page
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                <span className="text-red-600 dark:text-red-400 text-lg">
                  ×
                </span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Star Rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoveredStar(value)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="group"
                  >
                    <Star
                      className={`w-5 h-5 transition-all duration-200 ease-out
                        ${
                          value <= (hoveredStar || rating)
                            ? 'fill-current text-blue-500 transform scale-105'
                            : 'text-gray-300 dark:text-gray-600'
                        } group-hover:scale-110`}
                    />
                  </button>
                ))}
              </div>

              <div className="relative flex gap-2">
                {/* Role selector dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowRoles(!showRoles)}
                    className="h-10 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 
                             hover:bg-gray-200 dark:hover:bg-gray-600 
                             transition-colors flex items-center gap-2"
                  >
                    {selectedRole ? (
                      React.createElement(
                        roles.find((r) => r.id === selectedRole)?.icon,
                        {
                          className: 'w-4 h-4 text-gray-600 dark:text-gray-300'
                        }
                      )
                    ) : (
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>

                  {showRoles && (
                    <div
                      className="absolute bottom-full mb-2 left-0 w-48 py-2 
                                  bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                                  border border-gray-200 dark:border-gray-700"
                    >
                      {roles.map((roleOption) => (
                        <button
                          key={roleOption.id}
                          onClick={() => {
                            setRole(roleOption.id);
                            setShowRoles(false);
                          }}
                          className={`w-full px-4 py-2 flex items-center gap-3 
                                    hover:bg-gray-100 dark:hover:bg-gray-700 
                                    ${selectedRole === roleOption.id ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
                        >
                          {React.createElement(roleOption.icon, {
                            className:
                              'w-4 h-4 text-gray-600 dark:text-gray-300'
                          })}
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {roleOption.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Feedback input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Share your thoughts..."
                    value={feedback}
                    onChange={(e) => {
                      if (e.target.value.length <= 84) {
                        setFeedback(e.target.value);
                      }
                    }}
                    className="w-full h-10 px-3 rounded-lg bg-gray-100 dark:bg-gray-700
                             text-gray-900 dark:text-gray-100 border-0
                             focus:ring-1 focus:ring-blue-500 pr-16"
                  />
                  <span
                    className={`absolute right-12 top-1/2 -translate-y-1/2 text-sm font-medium
                                  ${
                                    feedback.length >= 80
                                      ? 'text-orange-500 dark:text-orange-400'
                                      : feedback.length >= 70
                                        ? 'text-blue-500 dark:text-blue-400'
                                        : 'text-gray-700 dark:text-gray-300'
                                  }`}
                  >
                    {84 - feedback.length}
                  </span>
                  {rating > 0 && feedback && (
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={isSubmitting}
                      className="absolute right-2 top-1/2 -translate-y-1/2
                               w-6 h-6 flex items-center justify-center
                               text-blue-500 dark:text-blue-400
                               hover:text-blue-600 dark:hover:text-blue-300
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/hussaino03/QuestLog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg
                         bg-gray-100 dark:bg-gray-700 text-sm font-medium
                         text-gray-900 dark:text-gray-100 hover:bg-gray-200 
                         dark:hover:bg-gray-600 transition-colors"
                >
                  <Star className="w-4 h-4" />
                  <span>Star</span>
                </a>
                <a
                  href="https://paypal.me/hussaino03"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg
                         bg-blue-50 dark:bg-blue-900/30 text-sm font-medium
                         text-blue-600 dark:text-blue-400 hover:bg-blue-100 
                         dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  <span>Support</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportReminder;
