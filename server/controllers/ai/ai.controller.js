const { GoogleGenerativeAI } = require('@google/generative-ai');
const { connectToDatabase } = require('../../db');
const { ObjectId } = require('mongodb');
const NodeCache = require('node-cache');

// Initialize cache with 10 minute TTL
const responseCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Track API usage
let apiUsageStats = {
  requestsToday: 0,
  quotaExceeded: false,
  lastResetDate: new Date().toDateString()
};

// Log initial setup
console.log('Initializing Gemini AI model...');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-3-flash-preview',
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    }
  ]
});
console.log('Gemini AI model initialized');

const SYSTEM_PROMPT = `You are a friendly and dynamic productivity assistant with access to both personal and community data. Your responses should be:
- Natural and contextual (adapt based on conversation flow)
- Direct and personal without unnecessary greetings after the first message
- Focused on user's actual task data and performance
- Mix of analysis, competitive insights, and actionable advice
- Professional but warm and motivating

Conversation Guidelines:
- First message: Include a brief greeting
- Follow-up messages: Skip greetings, respond directly to the question/topic
- Always reference specific tasks and stats from the user's data
- Maintain context from the previous messages when provided
- When discussing competitive insights, be encouraging and motivating

Comparative Analysis Capabilities:
- Compare user's performance to community averages
- Provide leaderboard position and ranking insights
- Highlight how they compare to top performers
- Celebrate achievements relative to peers
- Suggest areas for improvement based on community benchmarks

Formatting Guidelines (use markdown):
- Use **bold** for important metrics, key points, task names, and percentages
- Use bullet lists (- or *) for tips and suggestions
- Keep percentages inline with text (e.g. "Your completion rate is **75%**")
- Use numbered lists (1. 2. 3.) for sequential steps
- Use ### for section headings when organizing longer responses
- Keep responses structured and scannable
- Do NOT use backticks/code formatting - use **bold** instead

Remember: Be concise, visual, motivating, and avoid repetitive patterns.`;

// Reset daily stats if it's a new day
function checkAndResetDailyStats() {
  const today = new Date().toDateString();
  if (apiUsageStats.lastResetDate !== today) {
    apiUsageStats = {
      requestsToday: 0,
      quotaExceeded: false,
      lastResetDate: today
    };
    console.log('Daily API stats reset');
  }
}

function generateCacheKey(prompt) {
  const normalized = prompt.toLowerCase().trim().substring(0, 200);
  return `ai_response_${Buffer.from(normalized).toString('base64').substring(0, 50)}`;
}

async function getUserStats(userId) {
  console.log('-------- Getting User Stats --------');
  console.log('Fetching user stats for userId:', userId);
  try {
    const db = await connectToDatabase();

    if (!ObjectId.isValid(userId)) {
      console.error('Invalid userId format:', userId);
      return null;
    }

    const user = await db
      .collection('users')
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      console.error('User not found:', userId);
      return null;
    }

    console.log('Raw user data received:', {
      tasks: user.tasks?.length || 0,
      completedTasks: user.completedTasks?.length || 0,
      level: user.level,
      xp: user.xp
    });

    const completedTasks = user.completedTasks || [];
    const pendingTasks = user.tasks || [];

    // Get leaderboard data for competitive insights
    const leaderboard = await db
      .collection('users')
      .find(
        { isOptIn: true },
        { projection: { name: 1, xp: 1, level: 1, tasksCompleted: 1 } }
      )
      .sort({ xp: -1 })
      .limit(100)
      .toArray();

    // Find user's rank
    const userRank =
      leaderboard.findIndex((u) => u._id.toString() === userId.toString()) + 1;

    // Get community stats
    const communityStats = await db
      .collection('users')
      .aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            totalXP: { $sum: '$xp' },
            avgXP: { $avg: '$xp' },
            avgLevel: { $avg: '$level' },
            totalTasks: {
              $sum: { $size: { $ifNull: ['$completedTasks', []] } }
            }
          }
        }
      ])
      .toArray();

    const community = communityStats[0] || {
      totalUsers: 0,
      totalXP: 0,
      avgXP: 0,
      avgLevel: 1,
      totalTasks: 0
    };

    console.log(
      'Processing completed tasks. Sample:',
      completedTasks.slice(-2).map((t) => ({
        title: t.title || t.name,
        experience: t.experience,
        completedAt: t.completedAt
      }))
    );

    const recentCompletions = completedTasks.slice(-5).map((task) => {
      console.log('Processing task:', task);
      return {
        title: task.title || task.name || 'Untitled Task',
        experience: task.experience || 0,
        completedAt: new Date(task.completedAt).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        }),
        deadline: task.deadline
          ? new Date(task.deadline).toLocaleDateString()
          : 'No deadline',
        earlyBonus: task.earlyBonus || 0,
        overduePenalty: task.overduePenalty || 0
      };
    });

    console.log('Processed recent completions:', recentCompletions);

    const userXP = user.xp || 0;
    const userLevel = user.level || 1;

    const stats = {
      taskCompletionRate:
        completedTasks.length + pendingTasks.length > 0
          ? (
              (completedTasks.length /
                (completedTasks.length + pendingTasks.length)) *
              100
            ).toFixed(1)
          : 0,
      totalTasksCompleted: completedTasks.length,
      currentLevel: userLevel,
      experiencePoints: userXP,
      recentCompletions,
      totalActiveTasks: pendingTasks.length,
      badges: user.unlockedBadges || [],

      // Competitive insights
      leaderboard: {
        userRank: userRank || 'Not ranked',
        totalPlayers: leaderboard.length,
        isOptedIn: user.isOptIn || false,
        topPlayer: leaderboard[0]
          ? {
              name: leaderboard[0].name,
              xp: leaderboard[0].xp,
              level: leaderboard[0].level
            }
          : null,
        xpDifferenceFromTop: leaderboard[0] ? leaderboard[0].xp - userXP : 0,
        xpDifferenceFromAvg: userXP - community.avgXP
      },

      // Community comparison
      community: {
        totalUsers: community.totalUsers,
        totalCommunityXP: community.totalXP,
        avgXP: Math.round(community.avgXP),
        avgLevel: Math.round(community.avgLevel),
        totalCommunityTasks: community.totalTasks,
        userVsAvgXP: userXP > community.avgXP ? 'above' : 'below',
        userVsAvgLevel: userLevel > community.avgLevel ? 'above' : 'below'
      }
    };

    console.log('Final stats prepared:', stats);
    console.log('-------- End User Stats --------');

    return stats;
  } catch (error) {
    console.error('Error in getUserStats:', error);
    throw error;
  }
}

// Helper function to handle AI model interaction with error handling
async function generateAIResponse(
  prompt,
  systemPrompt = SYSTEM_PROMPT,
  cacheKey = null
) {
  // Check if we've exceeded quota today
  checkAndResetDailyStats();

  if (apiUsageStats.quotaExceeded) {
    console.log('Quota exceeded - returning cached/fallback response');
    throw new Error('QUOTA_EXCEEDED');
  }

  // Check cache first
  if (cacheKey) {
    const cached = responseCache.get(cacheKey);
    if (cached) {
      console.log('Returning cached response');
      return cached;
    }
  }

  try {
    const result = await model.generateContent([systemPrompt, prompt]);

    if (!result || !result.response) {
      throw new Error('Invalid response from AI model');
    }

    const response = await result.response.text();

    if (!response) {
      throw new Error('Empty response from AI model');
    }

    // Track successful request
    apiUsageStats.requestsToday++;
    console.log(
      `API request successful. Total today: ${apiUsageStats.requestsToday}`
    );

    // Cache the response
    if (cacheKey) {
      responseCache.set(cacheKey, response);
      console.log('Response cached');
    }

    return response;
  } catch (error) {
    // Handle quota exceeded errors
    if (
      error.status === 429 ||
      error.message?.includes('quota') ||
      error.message?.includes('rate limit')
    ) {
      console.error('Gemini API quota exceeded:', error.message);
      apiUsageStats.quotaExceeded = true;
      throw new Error('QUOTA_EXCEEDED');
    }

    // Handle other errors
    throw error;
  }
}

async function getProductivityInsights(req, res) {
  try {
    const stats = await getUserStats(req.user._id);

    const prompt = `Based on these user statistics:
    - Task completion rate: ${stats.taskCompletionRate}%
    - Total completed tasks: ${stats.totalTasksCompleted}
    - Current level: ${stats.currentLevel}
    - XP earned: ${stats.experiencePoints}

    Provide a brief, encouraging analysis of their productivity patterns and 1-2 specific suggestions 
    for improvement. Keep it under 150 words.`;

    const cacheKey = generateCacheKey(prompt);

    try {
      const response = await generateAIResponse(
        prompt,
        SYSTEM_PROMPT,
        cacheKey
      );
      res.json({ insights: response, cached: false });
    } catch (error) {
      if (error.message === 'QUOTA_EXCEEDED') {
        return res.status(429).json({
          error:
            'The AI assistant is currently experiencing high demand. Please try again in a few minutes.',
          retryAfter: 300 // 5 minutes
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('AI Insights Error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
}

async function chatWithAI(req, res) {
  console.log('-------- Chat Request --------');
  try {
    const { message, previousResponses = [] } = req.body;
    const isFirstMessage = previousResponses.length === 0;

    const stats = await getUserStats(req.user._id);
    if (!stats) {
      return res.status(500).json({ error: 'Failed to fetch user statistics' });
    }

    console.log('Preparing AI context with stats:', stats);
    const contextPrompt = `Current user context:
    Core Stats:
    - Task completion rate: ${stats.taskCompletionRate}%
    - Total completed tasks: ${stats.totalTasksCompleted}
    - Current level: ${stats.currentLevel}
    - Total XP: ${stats.experiencePoints}
    - Active tasks: ${stats.totalActiveTasks}
    - Badges earned: ${stats.badges.length}

    Recent Task Completions:
    ${stats.recentCompletions
      .map(
        (task) =>
          `- "${task.title}" completed on ${task.completedAt} (deadline: ${task.deadline}) (${task.experience}XP${
            task.earlyBonus ? ` +${task.earlyBonus} bonus` : ''
          }${task.overduePenalty ? ` ${task.overduePenalty} penalty` : ''})`
      )
      .join('\n')}

    Competitive & Community Insights:
    ${
      stats.leaderboard.isOptedIn
        ? `- Leaderboard rank: ${stats.leaderboard.userRank} of ${stats.leaderboard.totalPlayers}
    - XP difference from #1: ${stats.leaderboard.xpDifferenceFromTop > 0 ? '+' : ''}${stats.leaderboard.xpDifferenceFromTop} XP ${stats.leaderboard.topPlayer ? `(${stats.leaderboard.topPlayer.name}: ${stats.leaderboard.topPlayer.xp} XP)` : ''}
    - XP difference from average: ${stats.leaderboard.xpDifferenceFromAvg > 0 ? '+' : ''}${Math.round(stats.leaderboard.xpDifferenceFromAvg)} XP`
        : '- Not opted into leaderboard (user can opt in to see rankings)'
    }
    - Community average XP: ${stats.community.avgXP}
    - Community average level: ${stats.community.avgLevel}
    - User is ${stats.community.userVsAvgXP} average in XP
    - User is ${stats.community.userVsAvgLevel} average in level
    - Total community users: ${stats.community.totalUsers}
    - Total community XP: ${stats.community.totalCommunityXP}

    Conversation State:
    - Is first message: ${isFirstMessage}
    - Previous responses: ${JSON.stringify(previousResponses.slice(-2))}
    
    User message: ${message}

    ${isFirstMessage ? 'Start with a brief greeting.' : 'Skip greeting, respond directly to the question/topic.'}
    Focus on:
    1. Their recent task completions and personal progress
    2. Current performance level (personal and relative to community)
    3. Competitive insights (when relevant to the question)
    4. Specific encouragement based on actual data
    5. Actionable next steps to improve`;

    // Generate cache key from message + basic stats
    const cacheKey = generateCacheKey(
      message + stats.currentLevel + stats.totalTasksCompleted
    );

    console.log('Sending prompt to AI:', contextPrompt);

    try {
      const response = await generateAIResponse(
        contextPrompt,
        SYSTEM_PROMPT,
        cacheKey
      );
      console.log('AI Response received:', response);

      console.log('-------- End Chat Request --------');
      res.json({
        response,
        conversationContext: {
          performance:
            stats.taskCompletionRate > 70
              ? 'high'
              : stats.taskCompletionRate > 40
                ? 'medium'
                : 'getting_started'
        },
        cached: false
      });
    } catch (error) {
      if (error.message === 'QUOTA_EXCEEDED') {
        console.log('Quota exceeded - returning error message');
        return res.status(429).json({
          error:
            'The AI assistant is currently experiencing high demand. Please try again in a few minutes.',
          retryAfter: 300 // 5 minutes
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('-------- Chat Error --------');
    console.error('Error details:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: 'Failed to process message',
      details:
        process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Endpoint to check AI service status
async function getAIStatus(req, res) {
  checkAndResetDailyStats();

  res.json({
    available: !apiUsageStats.quotaExceeded,
    requestsToday: apiUsageStats.requestsToday,
    cacheSize: responseCache.keys().length,
    lastReset: apiUsageStats.lastResetDate
  });
}

module.exports = {
  getProductivityInsights,
  chatWithAI,
  getAIStatus
};
