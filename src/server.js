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

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Performance middleware
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(createRateLimiter());

// Health check routes (before rate limiting for monitoring)
app.use('/health', healthRoutes);

// API routes
app.use('/api/v1', gasBuddyRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Gas Price API',
    version: '2.0.0',
    description: 'Production-ready API for gas station data',
    endpoints: {
      'GET /health': 'Health check endpoint',
      'GET /health/ready': 'Readiness check',
      'POST /api/v1/gasbuddy/stations': 'Get gas station data',
      'GET /api/v1/gasbuddy/fuel-types': 'Get available fuel types'
    },
    documentation: process.env.API_DOCS_URL || 'https://api-docs.example.com'
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown handling
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] 🚀 Gas Price API server started`);
  console.log(`[${new Date().toISOString()}] 📍 Port: ${port}`);
  console.log(`[${new Date().toISOString()}] 🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[${new Date().toISOString()}] 🔗 Health check: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(`[${new Date().toISOString()}] 🛑 SIGTERM received, shutting down gracefully`);
  server.close(() => {
    console.log(`[${new Date().toISOString()}] ✅ Process terminated`);
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log(`[${new Date().toISOString()}] 🛑 SIGINT received, shutting down gracefully`);
  server.close(() => {
    console.log(`[${new Date().toISOString()}] ✅ Process terminated`);
    process.exit(0);
  });
});

export default app;