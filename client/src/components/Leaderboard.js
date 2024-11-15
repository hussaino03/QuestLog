import React, { useState, useEffect, useMemo } from 'react';

const API_BASE_URL = 'https://smart-list-hjea.vercel.app/api';

// Keeping the username generation logic unchanged
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

const LeaderboardEntry = ({ user, index }) => {
  const [showDetails, setShowDetails] = useState(false);
  const username = useMemo(() => generateUsername(user?._id), [user?._id]);

  return (
    <li className="border-b border-gray-200 last:border-b-0">
      <div className={`flex items-center justify-between p-4 ${showDetails ? 'bg-gray-50' : ''}`}>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showDetails ? '↑' : '↓'}
          </button>
          <span className="font-medium">
            {index + 1}. {username}
          </span>
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          showDetails ? 'max-h-48' : 'max-h-0'
        }`}
      >
        <div className="p-4 bg-gray-50 space-y-2">
          <p className="text-gray-700">XP: {user?.xp || 0}</p>
          <p className="text-gray-700">Tasks Completed: {user?.tasksCompleted || 0}</p>
          <p className="text-gray-700">Level: {user?.level || 1}</p>
        </div>
      </div>
    </li>
  );
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/leaderboard`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        return response.json();
      })
      .then(data => {
        console.log('Leaderboard data:', data);
        setLeaderboard(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <h2 className="text-xl font-bold p-4 bg-gray-50 border-b border-gray-200">
        Leaderboard
      </h2>
      <ul className="divide-y divide-gray-200">
        {leaderboard.map((user, index) => (
          <LeaderboardEntry key={user._id} user={user} index={index} />
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;