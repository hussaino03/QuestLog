import React, { useEffect, useState } from 'react';
const API_BASE_URL = process.env.REACT_APP_PROD || 'http://localhost:3001/api';

const Auth = ({ isAuthenticated, onAuthChange, onLogout }) => {
  const [user, setUser] = useState(null);
  const [showLegacyWarning, setShowLegacyWarning] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (!user && isAuthenticated) {
      fetch(`${API_BASE_URL}/auth/current_user`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data) {
          setUser(data);
        }
      })
      .catch(error => console.error('Session check failed:', error));
    }
  }, [isAuthenticated, user]);

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        credentials: 'include'
      });
      localStorage.clear();
      setUser(null);
      onAuthChange(null, true);
      if (onLogout) onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  return (
    <>
      {showLegacyWarning && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-100 dark:bg-yellow-900 p-4 text-center z-50 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <p className="text-yellow-800 dark:text-yellow-200">
              ⚠️ Please clear your browser data and sign in again to ensure the best experience. Your tasks and progress will not be affected.
            </p>
            <button 
              onClick={() => setShowLegacyWarning(false)}
              className="ml-4 text-yellow-900 dark:text-yellow-100 hover:opacity-75"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center">
        {(user || isAuthenticated) && (
          <div className="flex items-center">
            <div className="relative w-8 h-8 mr-2">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                  <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              <img 
                src={user?.picture} 
                alt="Profile" 
                className={`w-8 h-8 rounded-full ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-800 
                       shadow-[2px_2px_#77dd77] hover:shadow-none hover:translate-x-0.5 
                       hover:translate-y-0.5 transition-all duration-200 text-gray-800 dark:text-white"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Auth;