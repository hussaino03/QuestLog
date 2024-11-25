const express = require('express');
const router = express.Router();
const { 
  createOrGetUser, 
  updateUser, 
  getUser, 
  updateOptInStatus 
} = require('./users.controller');
const authenticateToken = require('../../middleware/auth');

router.post('/', createOrGetUser);
router.put('/:id', authenticateToken, updateUser);
router.get('/:id', authenticateToken, getUser);
router.put('/:id/opt-in', authenticateToken, updateOptInStatus);

module.exports = router;