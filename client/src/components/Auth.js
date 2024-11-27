import React, { useEffect, useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_PROD || 'http://localhost:3001/api';

const Auth = ({ onAuthChange, onLogout, handleUserDataLoad}) => {
  const [user, setUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Add redirect detection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('oauth')) {
      setSessionChecked(false); // Force session check after OAuth
    }
  }, []);

  useEffect(() => {
    if (isLoggingOut) {
      setUser(null);
      setSessionChecked(true);
      return;
    }

    const abortController = new AbortController();
    let mounted = true;

    const checkSession = async () => {
      if (sessionChecked) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/auth/current_user`, {
          credentials: 'include',
          signal: abortController.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        });
    
        if (!response.ok) {
          if (response.status === 401 && mounted) {
            setUser(null);
            onAuthChange(null);
            setSessionChecked(true);
            return;
          }
          throw new Error('Network response was not ok');
        }
    
        const data = await response.json();
        if (mounted) {
          setUser(data);
          onAuthChange(data.userId);
          setSessionChecked(true);
          handleUserDataLoad(data);
        }
      } catch (error) {
        if (error.name !== 'AbortError' && mounted) {
          setUser(null);
          onAuthChange(null);
          setSessionChecked(true);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [isLoggingOut, sessionChecked, onAuthChange, handleUserDataLoad]);

  const login = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        credentials: 'include'
      });
      localStorage.clear();
      setUser(null);
      onAuthChange(null, true);  // Pass true to indicate active logout
      if (onLogout) onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  

  return (
    <div className="flex items-center">
      {user ? (
        <div className="flex items-center">
          <img 
            src={user.picture} 
            alt="Profile" 
            className="w-8 h-8 rounded-full mr-2"
          />
          <button
            onClick={logout}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-800 
                     shadow-[2px_2px_#77dd77] hover:shadow-none hover:translate-x-0.5 
                     hover:translate-y-0.5 transition-all duration-200 text-gray-800 dark:text-white"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={login}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-800 
                   shadow-[2px_2px_#77dd77] hover:shadow-none hover:translate-x-0.5 
                   hover:translate-y-0.5 transition-all duration-200 flex items-center gap-2 
                   text-gray-800 dark:text-white"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          <span>Sign in</span>
        </button>
      )}
    </div>
  );
};

export default Auth;