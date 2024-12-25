import React, { useEffect, useState, useRef } from 'react';
const API_BASE_URL = process.env.REACT_APP_PROD || 'http://localhost:3001/api';

const Auth = ({ onAuthChange }) => {
  const [user, setUser] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) {
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
          onAuthChange(data.userId);
        }
        setIsLoading(false);  
      })
      .catch(error => {
        console.error('Session check failed:', error);
        setIsLoading(false);  // Set loading to false on error too
      });
    }
  }, [user, onAuthChange]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        credentials: 'include'
      });
      setUser(null);
      onAuthChange(null, true);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  return (
    <div className="flex items-center">
      <div className="flex items-center relative" ref={dropdownRef}>
        <div 
          className="relative w-8 h-8 mr-2 cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {(imageLoading || isLoading) && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          {user?.picture && (
            <img 
              src={user.picture} 
              alt="Profile" 
              className={`w-8 h-8 rounded-full ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          )}
        </div>
        
        {isDropdownOpen && user && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 
                        rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 
                        py-2 z-50">
            <div className="px-4 py-2">
              <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Signed in with Google
              </p>
            </div>
          </div>
        )}
        
        <button
          onClick={logout}
          title="Sign out"
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 
                   dark:hover:text-gray-200 transition-colors duration-200"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M17 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zM9.293 6.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L10.586 11H3a1 1 0 110-2h7.586L9.293 7.707a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Auth;