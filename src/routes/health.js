import express from 'express';
import { GasBuddyService } from '../services/gasBuddyService.js';

const router = express.Router();
const gasBuddyService = new GasBuddyService();

// Basic health check
router.get('/', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  res.status(200).json(healthData);
});

// Readiness check (includes external dependencies)
router.get('/ready', async (req, res) => {
  const checks = {
    server: 'healthy',
    gasbuddy: 'unknown',
    timestamp: new Date().toISOString()
  };

  let overallStatus = 200;

  try {
    // Test GasBuddy connectivity with a minimal request
    await gasBuddyService.healthCheck();
    checks.gasbuddy = 'healthy';
  } catch (error) {
    checks.gasbuddy = 'unhealthy';
    checks.gasBuddyError = error.message;
    overallStatus = 503;
  }

  res.status(overallStatus).json({
    status: overallStatus === 200 ? 'ready' : 'not ready',
    checks
  });
});

// Liveness check (minimal check for container orchestration)
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

export default router;