const express = require('express');
const router = express.Router();
const passport = require('../config/passport-setup');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

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
    // Successful authentication, redirect to home page
    const clientURL = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(clientURL);
  }
);

// Update logout route
router.get('/logout', (req, res) => {
  const userId = req.user?._id;  // Get user ID before destroying session
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    // Clear the session cookie
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    
    // Call passport logout
    req.logout(() => {
      if (userId) {
        console.log('User logged out successfully:', userId.toString());
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
});

// New route to get current user
router.get('/current_user', isAuthenticated, (req, res) => {
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