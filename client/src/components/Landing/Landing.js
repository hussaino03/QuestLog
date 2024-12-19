import React, { useState, useEffect } from 'react';
import { Sun, Moon, Brain, Rocket, Trophy, Sparkles, ChartLine, Flag } from 'lucide-react';
import Footer from '../Layout/Footer';

const ThemeToggle = ({ isDark, onToggle }) => (
  <button
    onClick={onToggle}
    className="p-2 rounded-lg bg-white dark:bg-gray-800 
               border-2 border-gray-800 shadow-[2px_2px_#2563EB] 
               hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 
               transition-all duration-200"
    aria-label="Toggle theme"
  >
    {isDark ? (
      <Sun className="w-5 h-5 text-gray-800 dark:text-white" />
    ) : (
      <Moon className="w-5 h-5 text-gray-800 dark:text-white" />
    )}
  </button>
);

const Landing = ({ isDark, onToggle }) => {
  const [showCookieWarning, setShowCookieWarning] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_PROD || 'http://localhost:3001/api';

  useEffect(() => {
    const checkCookies = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/current_user`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        if (data === null) {
          setShowCookieWarning(true);
        }
      } catch (error) {
        console.error('Cookie check failed:', error);
      }
    };

    checkCookies();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAuth = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <>
      {showCookieWarning && (
        <div className="fixed top-0 left-0 right-0 bg-gray-100/90 dark:bg-gray-800/90 p-3 text-center z-[100] shadow-sm border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex flex-col items-start">
              <p className="text-gray-900 dark:text-white text-sm pr-2">
                🔐 Having trouble logging in? Cookies might be blocked. Please check your browser settings if login issues persist.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                By using our service, you agree to our{' '}
                <a href="/legal/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">Privacy Policy</a>
                {' '}and{' '}
                <a href="/legal/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300">Terms of Service</a>
              </p>
            </div>
            <button 
              onClick={() => setShowCookieWarning(false)}
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
              aria-label="Dismiss message"
            >
              <span className="text-red-600 dark:text-red-400 text-lg">×</span>
            </button>
          </div>
        </div>
      )}

      <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                QuestLog
              </h1>
            </div>
            <ThemeToggle isDark={isDark} onToggle={onToggle} />
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Primary Content - Hero */}
          <div className="text-center">
            <div className="opacity-0 animate-[scale_0.4s_ease-out_forwards]">
              <span className="inline-block px-3 py-1 text-sm rounded-full bg-blue-500/10 dark:bg-blue-400/10 
                           text-blue-600 dark:text-blue-400 font-medium">
                Your Productivity Adventure Awaits
              </span>
            </div>
            
            <h1 className="mt-6 opacity-0 animate-[scale_0.4s_ease-out_0.2s_forwards] text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white tracking-tight">
              Transform Tasks Into
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-200 mt-2">
                Epic Quests
              </span>
            </h1>
            
            <p className="mt-8 opacity-0 animate-[scale_0.4s_ease-out_0.4s_forwards] text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Level up your productivity with an AI-powered platform that turns everyday tasks & projects into rewarding achievements
            </p>

            <div className="mt-8 opacity-0 animate-[scale_0.4s_ease-out_0.6s_forwards]">
              <button
                onClick={handleAuth}
                className="inline-flex px-8 py-4 rounded-lg bg-white dark:bg-gray-800 font-bold text-lg 
                         border-2 border-gray-800 text-gray-800 dark:text-gray-200 
                         shadow-[2px_2px_#2563EB] hover:shadow-none hover:translate-x-0.5 
                         hover:translate-y-0.5 transition-all duration-200"
              >
                Start Your Quest
              </button>
            </div>

            {/* Secondary Content - Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { label: 'Active Users', value: '200+' },
                { label: 'Tasks Completed', value: '500+' },
                { label: 'Total XP Earned', value: '350K+' },
                { label: 'Badges Created', value: '30+' }
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className="opacity-0 animate-[scale_0.4s_ease-out_forwards] p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm"
                  style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                >
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Demo Video */}
          <div className="mt-24 relative max-w-4xl mx-auto opacity-0 animate-[scale_0.4s_ease-out_1.2s_forwards]">
            <div className="relative">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-transparent via-blue-500/25 to-transparent dark:via-blue-400/20 rounded-2xl blur-lg animate-shimmer" />
              
              <div className="relative rounded-xl overflow-hidden bg-white dark:bg-gray-800
                            transform hover:scale-[1.02] transition-all duration-300
                            shadow-lg hover:shadow-2xl">
                <div className="relative pb-[56.25%]">
                <video
                    src="/demo/demo.mp4"
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls={false}
                    />
                </div>
                {/* Subtle Glow Effect */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-blue-500/[0.05] to-transparent" />
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="mt-32">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-16 opacity-0 animate-[scale_0.4s_ease-out_1.4s_forwards]">
              Power Up Your Productivity
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Brain className="w-8 h-8" />,
                  title: "AI Assistant",
                  description: "Get personalized insights and quest optimization suggestions from our Gemini-powered AI"
                },
                {
                  icon: <Trophy className="w-8 h-8" />,
                  title: "Gamified Progress",
                  description: "Earn XP, unlock achievements, and switch seamlessly between tasks and projects"
                },
                {
                  icon: <ChartLine className="w-8 h-8" />,
                  title: "Smart Analytics",
                  description: "Track your productivity trends with detailed performance metrics"
                },
                {
                  icon: <Sparkles className="w-8 h-8" />,
                  title: "Pomodoro Focus",
                  description: "Built-in Pomodoro timer to maximize your productivity and focus"
                },
                {
                  icon: <Flag className="w-8 h-8" />,
                  title: "Global Rankings",
                  description: "Compete with others globally while maintaining privacy control"
                },
                {
                  icon: <Rocket className="w-8 h-8" />,
                  title: "Cross-Platform",
                  description: "Sync your progress across devices with cloud saves"
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="group opacity-0 animate-[scale_0.4s_ease-out_forwards] bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 
                           transition-colors duration-200"
                  style={{ animationDelay: `${1.6 + index * 0.1}s` }}
                >
                  <div className="text-gray-900 dark:text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-32 text-center opacity-0 animate-[scale_0.4s_ease-out_2.2s_forwards]">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Level Up?
            </h2>
            <button
              onClick={handleAuth}
              className="inline-flex px-8 py-4 rounded-lg bg-white dark:bg-gray-800 font-bold text-lg 
                       border-2 border-gray-800 text-gray-800 dark:text-gray-200 
                       shadow-[2px_2px_#2563EB] hover:shadow-none hover:translate-x-0.5 
                       hover:translate-y-0.5 transition-all duration-200"
            >
              Begin Your Journey
            </button>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default Landing;
