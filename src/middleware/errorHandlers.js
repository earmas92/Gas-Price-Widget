import { AppError } from '../utils/errors.js';

export function errorHandler(err, req, res, next) {
  const timestamp = new Date().toISOString();
  
  // Log error details
  console.error(`[${timestamp}] ❌ Error:`, {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle known application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
      timestamp,
      requestId: req.id
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details,
      timestamp,
      requestId: req.id
    });
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON in request body',
      timestamp,
      requestId: req.id
    });
  }

  // Generic error response
  res.status(500).json({
    error: 'Internal server error',
    timestamp,
    requestId: req.id
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /health/ready',
      'GET /health/live',
      'POST /api/v1/gasbuddy/stations',
      'GET /api/v1/gasbuddy/fuel-types'
    ]
  });
}