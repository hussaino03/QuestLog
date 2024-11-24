const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid token format' });
    }
  
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  
    req.token = token;
    next();
  };
  
  module.exports = authenticateToken;