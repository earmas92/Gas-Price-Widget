export function validateEnvironment() {
  const requiredEnvVars = [];
  const optionalEnvVars = [
    'PORT',
    'NODE_ENV',
    'GASBUDDY_API_URL',
    'GASBUDDY_CSRF_TOKEN',
    'GASBUDDY_REFERER',
    'USER_AGENT',
    'REQUEST_TIMEOUT',
    'RATE_LIMIT_MAX',
    'RATE_LIMIT_WINDOW',
    'ALLOWED_ORIGINS'
  ];

  // Check required environment variables
  const missingRequired = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingRequired.length > 0) {
    console.error('❌ Missing required environment variables:', missingRequired);
    process.exit(1);
  }

  // Set defaults for Render deployment
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }

  if (!process.env.PORT) {
    process.env.PORT = '3000';
  }

  // Log environment configuration for Render
  console.log('🔧 Environment Configuration (Render):');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   PORT: ${process.env.PORT}`);
  console.log(`   RATE_LIMIT_MAX: ${process.env.RATE_LIMIT_MAX || '100'}`);
  console.log(`   REQUEST_TIMEOUT: ${process.env.REQUEST_TIMEOUT || '15000'}ms`);
  console.log(`   Platform: ${process.env.RENDER ? 'Render' : 'Local'}`);
  
  // Warn about missing optional variables
  const missingOptional = optionalEnvVars.filter(envVar => !process.env[envVar]);
  if (missingOptional.length > 0) {
    console.log('⚠️  Using default values for:', missingOptional.join(', '));
  }

  // Render-specific environment info
  if (process.env.RENDER) {
    console.log('☁️  Render Environment Detected:');
    console.log(`   Service: ${process.env.RENDER_SERVICE_NAME || 'Unknown'}`);
    console.log(`   Git Commit: ${process.env.RENDER_GIT_COMMIT || 'Unknown'}`);
    console.log(`   External URL: ${process.env.RENDER_EXTERNAL_URL || 'Not set'}`);
  }
}