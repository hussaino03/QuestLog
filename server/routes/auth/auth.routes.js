const express = require('express');
const router = express.Router();
const passport = require('../../config/passport-setup');
const { authenticateToken } = require('../../middleware/auth');

router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login' 
  }),
  (req, res) => {
    const clientURL = process.env.CLIENT || 'http://localhost:3000';
    res.redirect(clientURL);
  }
);

router.get('/logout', (req, res) => {
  const userId = req.user?._id;
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    
    req.logout(() => {
      if (userId) {
        console.log('User logged out successfully:', userId.toString());
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
});

router.get('/current_user', authenticateToken, (req, res) => {
  console.log('[Session] User verified:', {
    id: req.user._id,
    xp: req.user.xp || 0,
    isOptIn: req.user.isOptIn || false,
    timestamp: new Date().toISOString()
  });
  
  res.json({
    userId: req.user._id,
    name: req.user.name,
    email: req.user.email,
    picture: req.user.picture,
    xp: req.user.xp || 0,
    level: req.user.level || 1,
    tasks: req.user.tasks || [],
    completedTasks: req.user.completedTasks || [],
    isOptIn: req.user.isOptIn || false 
  });
});

module.exports = router;