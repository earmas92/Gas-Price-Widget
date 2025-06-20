import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

export function createRateLimiter() {
  return rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW || '900000') / 1000),
      docs: 'https://github.com/yourusername/gas-price-api#rate-limiting'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for health checks
    skip: (req) => {
      return req.path.startsWith('/health');
    },
    // Custom key generator for Render proxy
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress || 'unknown';
    },
    handler: (req, res) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🚫 Rate limit exceeded for IP: ${req.ip} - Path: ${req.path}`);
      
      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW || '900000') / 1000),
        timestamp,
        requestId: req.id,
        docs: 'https://github.com/yourusername/gas-price-api#rate-limiting'
      });
    }
  });
}

export function createSlowDown() {
  return slowDown({
    windowMs: parseInt(process.env.SLOW_DOWN_WINDOW || '900000'), // 15 minutes
    delayAfter: parseInt(process.env.SLOW_DOWN_DELAY_AFTER || '10'),
    delayMs: parseInt(process.env.SLOW_DOWN_DELAY_MS || '500'),
    maxDelayMs: parseInt(process.env.SLOW_DOWN_MAX_DELAY || '5000'),
    // Skip slow down for health checks
    skip: (req) => {
      return req.path.startsWith('/health');
    },
    // Custom key generator for Render proxy
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress || 'unknown';
    }
  });
}