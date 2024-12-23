import React, { useState, useEffect, memo } from 'react';
import { PresentationChartLineIcon } from '@heroicons/react/24/outline';
import LeaderboardManager from '../../services/leaderboard/LeaderboardManager';
import { LoadingSpinner } from '../../utils/spinner';

const MetricBox = memo(({ label, value }) => (
  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 flex items-center justify-between sm:block">
    <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    <div className="flex items-center h-[28px]">
      <span className="text-base lg:text-lg font-medium text-gray-900 dark:text-gray-100">
        {value}
      </span>
    </div>
  </div>
));

const UserListItem = memo(({ user, index, showDetails, setShowDetails }) => (
  <li className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
    <div className="px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center space-x-4">
        {/* Position */}
        <div className="flex-shrink-0 w-8 text-center">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            #{index + 1}
          </span>
        </div>
        
        {/* User info */}
        <div className="flex-1 flex items-center justify-between group-hover:translate-x-1 transition-transform duration-200">
          <div className="flex items-center space-x-3">
            {user?.picture ? (
              <img src={user.picture} 
                   alt="Profile" 
                   className="w-10 h-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-700" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {user?.name?.[0] || 'U'}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {user?.name || 'Anonymous User'}
              </span>
              <button 
                onClick={() => setShowDetails(prev => prev === user._id ? null : user._id)}
                className="text-xs text-gray-400 hover:text-blue-600 dark:text-gray-400 
                         dark:hover:text-blue-400 transition-colors mt-0.5 text-left"
              >
                Details
              </button>
            </div>
          </div>
          
          {/* XP display */}
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 
                         text-blue-600 dark:text-blue-400 font-medium text-sm">
              {user?.xp || 0} XP
            </span>
          </div>
        </div>
      </div>

      {/* User Details Dropdown */}
      <div className={`mt-2 overflow-hidden transition-all duration-200 ${
        showDetails === user._id ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="flex flex-col space-y-2 py-2 ml-[4.5rem]">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2563EB' }}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Level {user?.level || 1}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#77dd77' }}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user?.tasksCompleted || 0} Tasks
            </span>
          </div>
        </div>
      </div>
    </div>
  </li>
));

const Leaderboard = ({ limit, className, scrollUsers = false, onShowFull, onClose }) => {
  const [leaderboardState, setLeaderboardState] = useState({
    data: [],
    isLoading: true,
    error: null,
    isOptedIn: false,
    communityXP: 0
  });
  const [showDetails, setShowDetails] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const leaderboardManager = new LeaderboardManager(
    (data) => setLeaderboardState(prev => ({ ...prev, data })),
    (error) => setLeaderboardState(prev => ({ ...prev, error })),
    (isOptedIn) => setLeaderboardState(prev => ({ ...prev, isOptedIn })),
    (communityXP) => setLeaderboardState(prev => ({ ...prev, communityXP })),
    (isLoading) => setLeaderboardState(prev => ({ ...prev, isLoading }))
  );

  useEffect(() => {
    let mounted = true;

    const fetchAllData = async () => {
      if (!mounted) return;
      
      try {
        await Promise.all([
          leaderboardManager.checkOptInStatus(),
          leaderboardManager.fetchLeaderboard(),
          leaderboardManager.fetchCommunityXP()
        ]);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchAllData();

    return () => {
      mounted = false;
      setLeaderboardState(prev => ({ ...prev, isLoading: false, data: [] }));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOptInToggle = () => leaderboardManager.handleOptInToggle();
  const getLeaderboardMetrics = () => leaderboardManager.getLeaderboardMetrics(leaderboardState.data);
  const handleClose = () => {
    setLeaderboardState(prev => ({ ...prev, isLoading: false }));
    onClose?.();
  };

  if (leaderboardState.error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-200">
        <h2 className="text-xl font-bold p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
          Leaderboard
        </h2>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg m-4">
          <p className="p-4 text-sm text-red-600 dark:text-red-400">
            {leaderboardState.error}
          </p>
        </div>
      </div>
    );
  }

  if (scrollUsers) {
    return (
      <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-colors duration-200 w-full h-[80vh]">
        {/* Header */}
        <div className="relative z-20 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Leaderboard
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
            >
              <span className="text-red-600 dark:text-red-400 text-lg">×</span>
            </button>
          </div>

          {leaderboardState.isLoading ? (
            <LoadingSpinner />
          ) : (
            getLeaderboardMetrics() && (
              <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* opt-in */}
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 
                              dark:border-gray-600 flex flex-col justify-center">
                  <div className="relative flex items-center justify-center">
                    <button
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      onClick={handleOptInToggle}
                      className="w-full text-sm font-medium px-4 py-2.5 rounded-lg
                               bg-white dark:bg-gray-800 border-2 border-gray-800 
                               text-gray-800 dark:text-gray-200 
                               shadow-[2px_2px_#2563EB] hover:shadow-none hover:translate-x-0.5 
                               hover:translate-y-0.5 transition-all duration-200"
                    >
                      {leaderboardState.isOptedIn ? 'Opt-Out' : 'Opt-In'}
                    </button>
                    {showTooltip && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4
                                    p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-[100] w-48">
                        {leaderboardState.isOptedIn 
                          ? 'Click to remove your name and stats from the leaderboard'
                          : 'Click to share your name and stats publicly on the leaderboard'
                        }
                      </div>
                    )}
                  </div>
                </div>
                
                {/* metric boxes */}
                <MetricBox label="Top Score" value={`${getLeaderboardMetrics().topScore.toLocaleString()} XP`} />
                <MetricBox label="Total Tasks" value={getLeaderboardMetrics().totalTasks.toLocaleString()} />
                <MetricBox label="Highest Level" value={getLeaderboardMetrics().highestLevel} />
              </div>
            )
          )}
        </div>

        {/* User List */}
        <div className="flex-1 min-h-0">
          {leaderboardState.isLoading ? (
            <LoadingSpinner />
          ) : (
            <ul className="h-full overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700 
                          scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 
                          scrollbar-track-gray-100 dark:scrollbar-track-gray-800 
                          hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
              {leaderboardState.data.map((user, index) => (
                <UserListItem 
                  key={user._id}
                  user={user}
                  index={index}
                  showDetails={showDetails}
                  setShowDetails={setShowDetails}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200 ${className || ''}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Leaderboard</h3>
          <div className="flex items-center space-x-1.5 mt-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total User XP: {leaderboardState.communityXP.toLocaleString()}</p>
          </div>
        </div>
        {onShowFull && (
          <button 
            onClick={onShowFull} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 font-medium text-sm 
                     border-2 border-gray-800 text-gray-800 dark:text-gray-200 
                     shadow-[2px_2px_#2563EB] hover:shadow-none hover:translate-x-0.5 
                     hover:translate-y-0.5 transition-all duration-200"
          >
            <PresentationChartLineIcon className="w-4 h-4 text-gray-900 dark:text-white" />
            View All
          </button>
        )}
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 overflow-hidden">
        <ul className="divide-y divide-gray-200 dark:divide-gray-600">
          {leaderboardState.data.slice(0, limit || leaderboardState.data.length).map((user) => (
            <li key={user._id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {user?.picture && (
                    <img src={user.picture} alt="Profile" className="w-8 h-8 rounded-full" />
                  )}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {user?.name || 'Anonymous User'}
                  </span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {user?.xp || 0} XP
                </span>
              </div>
            </li>
          ))}
          {leaderboardState.data.length === 0 && (
            <li className="p-4 text-gray-500 dark:text-gray-400 text-center">
              No users in leaderboard yet
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Leaderboard;