import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

export function createRateLimiter() {
  return rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW || '900000') / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.log(`[${new Date().toISOString()}] 🚫 Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW || '900000') / 1000),
        timestamp: new Date().toISOString()
      });
    }
  });
}

export function createSlowDown() {
  return slowDown({
    windowMs: parseInt(process.env.SLOW_DOWN_WINDOW || '900000'), // 15 minutes
    delayAfter: parseInt(process.env.SLOW_DOWN_DELAY_AFTER || '10'),
    delayMs: parseInt(process.env.SLOW_DOWN_DELAY_MS || '500'),
    maxDelayMs: parseInt(process.env.SLOW_DOWN_MAX_DELAY || '5000')
  });
}