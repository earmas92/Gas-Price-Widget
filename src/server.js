import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import { createRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandlers.js';
import { requestLogger } from './middleware/logger.js';
import gasBuddyRoutes from './routes/gasbuddy.js';
import healthRoutes from './routes/health.js';
import { validateEnvironment } from './utils/environment.js';

// Load environment variables
dotenv.config();

// Validate environment
validateEnvironment();

const app = express();
const port = process.env.PORT || 3000;

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Security middleware optimized for Render
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://www.gasbuddy.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  crossOriginEmbedderPolicy: false // Disable for API compatibility
}));

// Performance middleware
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// CORS configuration optimized for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
    
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));

// Body parsing middleware with limits
app.use(express.json({ 
  limit: '1mb',
  strict: true,
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb',
  parameterLimit: 100
}));

// Request logging
app.use(requestLogger);

// Health check routes (before rate limiting for monitoring)
app.use('/health', healthRoutes);

// Rate limiting (after health checks)
app.use(createRateLimiter());

// API routes
app.use('/api/v1', gasBuddyRoutes);

// Root endpoint with deployment info
app.get('/', (req, res) => {
  res.json({
    name: 'Gas Price API',
    version: '2.0.0',
    description: 'Production-ready API for gas station data - Deployed on Render',
    status: 'operational',
    deployment: {
      platform: 'Render',
      environment: process.env.NODE_ENV || 'production',
      nodeVersion: process.version,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    },
    endpoints: {
      'GET /health': 'Health check endpoint',
      'GET /health/ready': 'Readiness check with dependencies',
      'GET /health/live': 'Liveness check for monitoring',
      'POST /api/v1/gasbuddy/stations': 'Get gas station data',
      'GET /api/v1/gasbuddy/fuel-types': 'Get available fuel types'
    },
    documentation: process.env.API_DOCS_URL || 'https://github.com/yourusername/gas-price-api#readme',
    support: 'https://github.com/yourusername/gas-price-api/issues'
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown handling for Render
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] 🚀 Gas Price API server started on Render`);
  console.log(`[${new Date().toISOString()}] 📍 Port: ${port}`);
  console.log(`[${new Date().toISOString()}] 🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`[${new Date().toISOString()}] 🔗 Health check: http://localhost:${port}/health`);
  console.log(`[${new Date().toISOString()}] ☁️  Platform: Render`);
});

// Enhanced graceful shutdown for cloud deployment
const gracefulShutdown = (signal) => {
  console.log(`[${new Date().toISOString()}] 🛑 ${signal} received, shutting down gracefully`);
  
  server.close((err) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] ❌ Error during shutdown:`, err);
      process.exit(1);
    }
    
    console.log(`[${new Date().toISOString()}] ✅ Server closed successfully`);
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    console.error(`[${new Date().toISOString()}] ⚠️  Forced shutdown after timeout`);
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
  console.error(`[${new Date().toISOString()}] ❌ Uncaught Exception:`, err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[${new Date().toISOString()}] ❌ Unhandled Rejection at:`, promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

export default app;