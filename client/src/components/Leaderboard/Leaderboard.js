import React, { useState, useEffect, useMemo } from 'react';

const API_BASE_URL = process.env.REACT_APP_PROD || 'http://localhost:3001/api';

const adjectives = [
  'Happy', 'Clever', 'Brave', 'Wise', 'Swift', 'Calm', 'Bright', 'Noble',
  'Lucky', 'Witty', 'Bold', 'Quick', 'Kind', 'Cool', 'Keen', 'Pure'
];

const nouns = [
  'Panda', 'Eagle', 'Tiger', 'Wolf', 'Bear', 'Fox', 'Hawk', 'Lion',
  'Deer', 'Seal', 'Owl', 'Duck', 'Cat', 'Dog', 'Bat', 'Elk'
];

const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const generateUsername = (userId) => {
  const hash = hashCode(userId);
  const adjIndex = hash % adjectives.length;
  const nounIndex = Math.floor(hash / adjectives.length) % nouns.length;
  const number = hash % 1000;
  
  return `${adjectives[adjIndex]}${nouns[nounIndex]}${number}`;
};

const LeaderboardEntry = ({ user }) => {
  const [showDetails, setShowDetails] = useState(false);
  const generatedUsername = useMemo(() => generateUsername(user?._id), [user?._id]);

  return (
    <li className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className={`flex items-center justify-between p-4 ${
        showDetails 
          ? 'bg-gray-50 dark:bg-gray-700 transition-colors duration-200' 
          : ''
      }`}>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            {showDetails ? '↑' : '↓'}
          </button>
          <div className="flex items-center space-x-3">
            {user?.picture && (
              <img 
                src={user.picture} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {user?.name || generatedUsername}
            </span>
          </div>
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          {user?.xp || 0} XP
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          showDetails ? 'max-h-48' : 'max-h-0'
        }`}
      >
        <div className="p-4 bg-gray-50 dark:bg-gray-700 space-y-2 transition-colors duration-200">
          <p className="text-gray-700 dark:text-gray-300">Tasks Completed: {user?.tasksCompleted || 0}</p>
          <p className="text-gray-700 dark:text-gray-300">Level: {user?.level || 1}</p>
        </div>
      </div>
    </li>
  );
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [communityXP, setCommunityXP] = useState(0);  

  const fetchCommunityXP = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCommunityXP(data.communityXP);
      }
    } catch (error) {
      console.error('Error fetching community XP:', error);
    }
  };

  const checkOptInStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/current_user`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setIsOptedIn(userData.isOptIn || false);
      } else if (response.status === 401) {
        setError('Please sign in to view the leaderboard');
      }
    } catch (error) {
      console.error('Error checking opt-in status:', error);
    }
  };

  const handleOptInToggle = async () => {
    try {
      const userResponse = await fetch(`${API_BASE_URL}/auth/current_user`, {
        credentials: 'include'
      });
  
      if (!userResponse.ok) {
        throw new Error('Not authenticated');
      }
  
      const userData = await userResponse.json();
      
      const response = await fetch(`${API_BASE_URL}/users/${userData.userId}/opt-in`, {
        method: 'PUT',
        credentials: 'include'
      });
  
      if (response.ok) {
        const data = await response.json();
        setIsOptedIn(data.isOptIn);
        fetchLeaderboard();
      } else if (response.status === 401) {
        setError('Please sign in to change opt-in status');
      }
    } catch (error) {
      console.error('Error toggling opt-in status:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
        setError(null);
      } else if (response.status === 401) {
        setError('Please sign in to view the leaderboard');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load leaderboard data');
    }
  };

  useEffect(() => {
    checkOptInStatus();
    fetchLeaderboard();
    fetchCommunityXP();  
  }, []);


  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-200">
        <h2 className="text-xl font-bold p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
          Leaderboard
        </h2>
        <div className="p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-visible transition-colors duration-200">
      <div className="relative z-20 flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Leaderboard
          </h2>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Total User XP: {communityXP.toLocaleString()}
          </div>
        </div>
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={handleOptInToggle}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-800 
                     shadow-[2px_2px_#77dd77] hover:shadow-none hover:translate-x-0.5 
                     hover:translate-y-0.5 transition-all duration-200 
                     text-gray-800 dark:text-white"
          >
            {isOptedIn ? 'Opt Out' : 'Opt In'}
          </button>
          {showTooltip && (
            <div className="absolute right-0 mt-2 p-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-[100] w-48">
              {isOptedIn 
                ? 'Click to remove your name and stats from the leaderboard'
                : 'Click to share your name and stats publicly on the leaderboard (can opt-out anytime!)'
              }
            </div>
          )}
        </div>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700 min-h-[100px] relative z-10">
        {leaderboard.map((user) => (
          <LeaderboardEntry key={user._id} user={user} />
        ))}
        {leaderboard.length === 0 && (
          <li className="p-4 text-gray-500 dark:text-gray-400 text-center">
            No users in leaderboard yet
          </li>
        )}
      </ul>
    </div>
  );
};

export default Leaderboard;