
const express = require('express');
const router = express.Router();
const { getCommunityXP } = require('./analytics.controller');

router.get('/', getCommunityXP);

module.exports = router;