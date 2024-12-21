const API_BASE_URL = process.env.REACT_APP_PROD || 'http://localhost:3001/api';

class LeaderboardManager {
    constructor(setLeaderboard, setError, setIsOptedIn, setCommunityXP, setIsLoading) {
        this.setLeaderboard = setLeaderboard;
        this.setError = setError;
        this.setIsOptedIn = setIsOptedIn;
        this.setCommunityXP = setCommunityXP;
        this.setIsLoading = setIsLoading;
    }

    async fetchCommunityXP() {
        try {
            const response = await fetch(`${API_BASE_URL}/analytics`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.setCommunityXP(data.communityXP);
            }
        } catch (error) {
            console.error('Error fetching community XP:', error);
        }
    }

    async checkOptInStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/current_user`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const userData = await response.json();
                this.setIsOptedIn(userData.isOptIn || false);
            } else if (response.status === 401) {
                this.setError('Please sign in to view the leaderboard');
            }
        } catch (error) {
            console.error('Error checking opt-in status:', error);
        }
    }

    async handleOptInToggle() {
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
                this.setIsOptedIn(data.isOptIn);
                this.fetchLeaderboard();
            } else if (response.status === 401) {
                this.setError('Please sign in to change opt-in status');
            }
        } catch (error) {
            console.error('Error toggling opt-in status:', error);
        }
    }

    async fetchLeaderboard() {
        try {
            this.setIsLoading(true);
            const response = await fetch(`${API_BASE_URL}/leaderboard`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.setLeaderboard(data);
                this.setError(null);
            } else if (response.status === 401) {
                this.setError('Please sign in to view the leaderboard');
            }
        } catch (error) {
            console.error('Error:', error);
            this.setError('Failed to load leaderboard data');
        } finally {
            this.setIsLoading(false);
        }
    }

    getLeaderboardMetrics(leaderboard) {
        if (!leaderboard.length) return null;
        
        const topPerformer = leaderboard[0];
        const totalTasks = leaderboard.reduce((sum, user) => sum + (user.tasksCompleted || 0), 0);
        const highestLevel = Math.max(...leaderboard.map(user => user.level || 1));
        
        return {
            topScore: topPerformer?.xp || 0,
            totalTasks,
            highestLevel
        };
    }
}

export default LeaderboardManager;
