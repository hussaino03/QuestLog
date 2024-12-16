const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { getProductivityInsights, chatWithAI, chatWithAudio } = require('./ai.controller');

// ...existing routes...
router.post('/chat-audio', authenticate, chatWithAudio);

module.exports = router;
