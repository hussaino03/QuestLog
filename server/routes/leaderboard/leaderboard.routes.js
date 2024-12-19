const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../../controllers/leaderboard/leaderboard.controller');
const { authenticateToken } = require('../../middleware/auth');

router.get('/', authenticateToken, getLeaderboard);

module.exports = router;