const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();
const {
  getProductivityInsights,
  chatWithAI,
  getAIStatus
} = require('../../controllers/ai/ai.controller');
const { authenticateToken } = require('../../middleware/auth');
const {
  aiChatLimiter,
  aiInsightsLimiter
} = require('../../middleware/ai-rate-limit');

// Add health check endpoint
router.get('/health', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Test the model with a simple prompt
    const result = await model.generateContent('Say "OK" if you can hear me.');
    const response = await result.response.text();

    res.json({
      status: 'healthy',
      modelResponse: response,
      timestamp: new Date().toISOString(),
      apiKeyConfigured: true
    });
  } catch (error) {
    console.error('AI Health Check Failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      apiKeyConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString()
    });
  }
});

// AI endpoints with rate limiting
router.get(
  '/insights',
  authenticateToken,
  aiInsightsLimiter,
  getProductivityInsights
);
router.post('/chat', authenticateToken, aiChatLimiter, chatWithAI);

// Status endpoint to check AI availability
router.get('/status', authenticateToken, getAIStatus);

module.exports = router;
