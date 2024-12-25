const { GoogleGenerativeAI } = require('@google/generative-ai');
const { connectToDatabase } = require('../../db');
const { ObjectId } = require('mongodb');

// Log initial setup
console.log('Initializing Gemini AI model...');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    }
  ]
});
console.log('Gemini AI model initialized');

const SYSTEM_PROMPT = `You are a friendly and dynamic productivity assistant. Your responses should be:
- Natural and contextual (adapt based on conversation flow)
- Direct and personal without unnecessary greetings after the first message
- Focused on user's actual task data and performance
- Mix of analysis and actionable advice
- Professional but warm

Conversation Guidelines:
- First message: Include a brief greeting
- Follow-up messages: Skip greetings, respond directly to the question/topic
- Always reference specific tasks and stats from the user's data
- Maintain context from the previous messages when provided

Remember: Be concise and avoid repetitive patterns.`;

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
        completedAt: new Date(task.completedAt).toLocaleDateString(),
        deadline: task.deadline
          ? new Date(task.deadline).toLocaleDateString()
          : 'No deadline',
        earlyBonus: task.earlyBonus || 0,
        overduePenalty: task.overduePenalty || 0
      };
    });

    console.log('Processed recent completions:', recentCompletions);

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
      currentLevel: user.level || 1,
      experiencePoints: user.xp || 0,
      recentCompletions,
      totalActiveTasks: pendingTasks.length
    };

    console.log('Final stats prepared:', stats);
    console.log('-------- End User Stats --------');

    return stats;
  } catch (error) {
    console.error('Error in getUserStats:', error);
    throw error;
  }
}

// Helper function to handle AI model interaction
async function generateAIResponse(prompt, systemPrompt = SYSTEM_PROMPT) {
  const result = await model.generateContent([systemPrompt, prompt]);

  if (!result || !result.response) {
    throw new Error('Invalid response from AI model');
  }

  const response = await result.response.text();

  if (!response) {
    throw new Error('Empty response from AI model');
  }

  return response;
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

    const response = await generateAIResponse(prompt);
    res.json({ insights: response });
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

    Recent Task Completions:
    ${stats.recentCompletions
      .map(
        (task) =>
          `- "${task.title}" completed on ${task.completedAt} (deadline: ${task.deadline}) (${task.experience}XP${
            task.earlyBonus ? ` +${task.earlyBonus} bonus` : ''
          }${task.overduePenalty ? ` ${task.overduePenalty} penalty` : ''})`
      )
      .join('\n')}

    Conversation State:
    - Is first message: ${isFirstMessage}
    - Previous responses: ${JSON.stringify(previousResponses.slice(-2))}
    
    User message: ${message}

    ${isFirstMessage ? 'Start with a brief greeting.' : 'Skip greeting, respond directly to the question/topic.'}
    Focus on:
    1. Their recent task completions
    2. Current performance level
    3. Specific encouragement based on actual completed tasks
    4. Actionable next steps`;

    console.log('Sending prompt to AI:', contextPrompt);
    const response = await generateAIResponse(contextPrompt);
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
      }
    });
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

module.exports = {
  getProductivityInsights,
  chatWithAI
};
