
const express = require('express');
const router = express.Router();
const { getCommunityXP } = require('../../controllers/analytics/analytics.controller');

router.get('/', getCommunityXP);

module.exports = router;