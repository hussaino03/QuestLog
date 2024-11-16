import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://smart-list-hjea.vercel.app/api';

const Auth = ({ onAuthChange }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isRegistering ? '/register' : '/login';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const data = await response.json();
      
      // Get current data from localStorage for new users
      const currentXP = parseInt(localStorage.getItem('experience')) || 0;
      const currentLevel = parseInt(localStorage.getItem('level')) || 1;
      const completedTasksCount = JSON.parse(localStorage.getItem('completedtasks'))?.length || 0;

      // If registering or first login, initialize user data
      if (isRegistering || !data.exists) {
        await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`
          },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name || formData.email.split('@')[0],
            xp: currentXP,
            level: currentLevel,
            tasksCompleted: completedTasksCount
          })
        });
      }

      // Store auth data
      const userData = {
        email: formData.email,
        name: formData.name || formData.email.split('@')[0]
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.userId);

      setUser(userData);
      onAuthChange(data.token, data.userId);

      // Clear localStorage of task data since it's now in DB
      if (data.token) {
        localStorage.removeItem('tasks');
        localStorage.removeItem('completedtasks');
        localStorage.removeItem('experience');
        localStorage.removeItem('level');
      }
      
    } catch (error) {
      setError(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    setUser(null);
    onAuthChange(null, null);
  };

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {user.name || user.email}
        </span>
        <button
          onClick={logout}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 
                   text-gray-700 dark:text-gray-300 rounded-md transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2 text-sm text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded">
            {error}
          </div>
        )}
        
        {isRegistering && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleInputChange}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>

      <button
        onClick={() => setIsRegistering(!isRegistering)}
        className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
      </button>
    </div>
  );
};

export default Auth;