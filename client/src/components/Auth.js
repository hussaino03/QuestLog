import React, { useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

const API_BASE_URL = 'https://smart-list-hjea.vercel.app/api';

const Auth = ({ onAuthChange }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    const savedUserId = localStorage.getItem('userId');
    
    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
      onAuthChange(savedToken, savedUserId);
    }
  }, [onAuthChange]);

  const clearAuthState = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('experience');
    localStorage.removeItem('level');
    setUser(null);
    onAuthChange(null, null);
  };

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        console.log('Access token received:', response.access_token);
  
        // Get user info before clearing state
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` },
        }).then(res => res.json());
  
        console.log('User info received:', userInfo);
        
        // Initialize new user state
        const initialState = {
          xp: 0,
          level: 1,
          tasksCompleted: 0
        };

        // Make API call with the new token
        const dbResponse = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${response.access_token}`
          },
          body: JSON.stringify({
            googleId: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            ...initialState
          })
        });
  
        if (!dbResponse.ok) {
          throw new Error(`Server responded with ${dbResponse.status}`);
        }
  
        const dbUser = await dbResponse.json();
        console.log('Database response:', dbUser);
  
        if (!dbUser.userId) {
          throw new Error('No userId received from server');
        }
  
        // Only clear previous state after successful API calls
        clearAuthState();
        
        // Set the new user's state
        localStorage.setItem('user', JSON.stringify(userInfo));
        localStorage.setItem('authToken', response.access_token);
        localStorage.setItem('userId', dbUser.userId);
        
        // Update experience and level from server response if user exists
        if (dbUser.exists) {
          localStorage.setItem('experience', dbUser.xp.toString());
          localStorage.setItem('level', dbUser.level.toString());
        } else {
          localStorage.setItem('experience', '0');
          localStorage.setItem('level', '1');
        }
        
        setUser(userInfo);
        onAuthChange(response.access_token, dbUser.userId);
        
      } catch (error) {
        console.error('Error in authentication:', error);
        // Don't clear auth state on error to preserve existing session
      }
    },
    onError: error => {
      console.error('Login Failed:', error);
      // Don't clear auth state on error to preserve existing session
    }
  });

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
            onClick={clearAuthState}
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