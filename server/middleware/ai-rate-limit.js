const rateLimit = require('express-rate-limit');

// Rate limiter for AI chat - 10 requests per 10 minutes per user
const aiChatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 requests per window
  message: {
    error:
      'Too many AI requests. Please wait a few minutes before trying again.',
    retryAfter: '10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID as key if authenticated
  keyGenerator: (req) => {
    return req.user?._id?.toString() || req.ip;
  },
  // Skip counting successful requests with cached responses
  skip: (req, res) => {
    return res.locals?.fromCache === true;
  },
  handler: (req, res) => {
    console.log(`Rate limit exceeded for user: ${req.user?._id || req.ip}`);
    res.status(429).json({
      error:
        "You've reached the limit for AI requests. Please try again in a few minutes.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      tip: 'Rate limits help us provide reliable service to all users!'
    });
  }
});

// Rate limiter for productivity insights - 5 requests per hour
const aiInsightsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    error:
      'Too many insight requests. Please wait before requesting more insights.',
    retryAfter: '1 hour'
  },
  keyGenerator: (req) => {
    return req.user?._id?.toString() || req.ip;
  },
  handler: (req, res) => {
    console.log(
      `Insights rate limit exceeded for user: ${req.user?._id || req.ip}`
    );
    res.status(429).json({
      error:
        "You've reached the limit for productivity insights. Please try again later.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

module.exports = {
  aiChatLimiter,
  aiInsightsLimiter
};
