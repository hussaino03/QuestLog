const authenticateToken = (req, res, next) => {
  if (!req.isAuthenticated()) {
    console.log('Auth failed: Session invalid or expired');
    return res.status(401).json({ error: 'Session expired or invalid' });
  }
  console.log('Auth successful - User:', req.user._id);
  next();
};

const verifyOwnership = (req, res, next) => {
  if (req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }
  next();
};

module.exports = {
  authenticateToken,
  verifyOwnership
};
