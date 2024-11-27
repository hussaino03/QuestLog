const express = require('express');
const router = express.Router();
const { 
  updateUser, 
  getUser, 
  updateOptInStatus 
} = require('./users.controller');
const { authenticateToken, verifyOwnership } = require('../../middleware/auth');

router.put('/:id', authenticateToken, verifyOwnership, updateUser);
router.get('/:id', authenticateToken, getUser);
router.put('/:id/opt-in', authenticateToken, updateOptInStatus);

module.exports = router;