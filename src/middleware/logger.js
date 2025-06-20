import crypto from 'crypto';

export function requestLogger(req, res, next) {
  // Generate unique request ID
  req.id = crypto.randomUUID();
  
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log incoming request
  console.log(`[${timestamp}] 📥 ${req.method} ${req.path} - ${req.ip} - ID: ${req.id}`);
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    const responseTimestamp = new Date().toISOString();
    
    console.log(`[${responseTimestamp}] 📤 ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ID: ${req.id}`);
    
    return originalJson.call(this, data);
  };
  
  next();
}