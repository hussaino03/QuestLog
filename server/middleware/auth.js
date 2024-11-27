const authenticateToken = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
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