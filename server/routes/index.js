const express = require('express');
const router = express.Router();
const userRoutes = require('./users/users.routes');
const leaderboardRoutes = require('./Leaderboard/Leaderboard.routes');
const feedbackRoutes = require('./feedback/feedback.routes');

router.use('/users', userRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/feedback', feedbackRoutes);

module.exports = router;