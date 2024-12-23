const express = require('express');
const router = express.Router();
const {
  sendFeedback
} = require('../../controllers/feedback/feedback.controller');
const { authenticateToken } = require('../../middleware/auth');

router.post('/', authenticateToken, sendFeedback);

module.exports = router;
