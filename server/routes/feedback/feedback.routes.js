const express = require('express');
const router = express.Router();
const { sendFeedback } = require('./feedback.controller');

router.post('/', sendFeedback);

module.exports = router;