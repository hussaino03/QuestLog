import React, { useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import useXPManager from './XPManager';

const Auth = ({ onAuthChange }) => {
  const [user, setUser] = useState(null);
  const { syncWithServer } = useXPManager();

  const handleLogin = async (token) => {
    try {
      // Sync local data with server upon successful login
      const syncedData = await syncWithServer(token);
      
      if (syncedData) {
        // Update local storage with synced data
        localStorage.setItem('tasks', JSON.stringify(syncedData.tasks));
        localStorage.setItem('completedtasks', JSON.stringify(syncedData.completedTasks));
        localStorage.setItem('level', syncedData.level.toString());
        localStorage.setItem('experience', syncedData.xp.toString());
      }
      
      onAuthChange(token);
    } catch (error) {
      console.error('Login sync failed:', error);
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        localStorage.setItem('googleToken', response.access_token);
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` },
        }).then(res => res.json());
        
        setUser(userInfo);
        await handleLogin(response.access_token);
      } catch (error) {
        console.error('Error during login:', error);
      }
    },
    onError: error => console.error('Login Failed:', error)
  });

  const logout = () => {
    localStorage.removeItem('googleToken');
    setUser(null);
    onAuthChange(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('googleToken');
    if (token) {
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(userInfo => {
          setUser(userInfo);
          onAuthChange(token);
        })
        .catch(error => {
          console.error('Error verifying token:', error);
          localStorage.removeItem('googleToken');
        });
    }
  }, [onAuthChange]);

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <div className="flex items-center space-x-2">
          <img 
            src={user.picture} 
            alt="Profile" 
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {user.name}
          </span>
          <button
            onClick={logout}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 
                     text-gray-700 dark:text-gray-300 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => login()}
          className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600
                   text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 
                   rounded-md transition-colors shadow-sm"
        >
          <svg 
            className="w-5 h-5" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          <span>Sign in with Google</span>
        </button>
      )}
    </div>
  );
};

export default Auth;