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

  // Log environment configuration
  console.log('🔧 Environment Configuration:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   PORT: ${process.env.PORT || '3000'}`);
  console.log(`   RATE_LIMIT_MAX: ${process.env.RATE_LIMIT_MAX || '100'}`);
  console.log(`   REQUEST_TIMEOUT: ${process.env.REQUEST_TIMEOUT || '15000'}ms`);
  
  // Warn about missing optional variables
  const missingOptional = optionalEnvVars.filter(envVar => !process.env[envVar]);
  if (missingOptional.length > 0) {
    console.log('⚠️  Using default values for:', missingOptional.join(', '));
  }
}