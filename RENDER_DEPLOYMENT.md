# Render Deployment Guide

## Quick Deploy to Render

### Option 1: One-Click Deploy (Recommended)
1. Fork this repository to your GitHub account
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Web Service"
4. Connect your GitHub account and select this repository
5. Configure the service:
   - **Name**: `gas-price-api`
   - **Environment**: `Node`
   - **Build Command**: `npm ci`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

### Option 2: Using render.yaml (Infrastructure as Code)
1. The included `render.yaml` file will automatically configure your deployment
2. Simply connect your repository and Render will use the configuration

## Environment Variables

Render will automatically set these from the `render.yaml` file, but you can also set them manually in the dashboard:

```
NODE_ENV=production
GASBUDDY_API_URL=https://www.gasbuddy.com/graphql
GASBUDDY_CSRF_TOKEN=1.ZZjgVN9S4RtbF6zO
GASBUDDY_REFERER=https://www.gasbuddy.com/home
USER_AGENT=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
REQUEST_TIMEOUT=15000
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
ALLOWED_ORIGINS=*
```

## Render-Specific Optimizations

This deployment includes several Render-specific optimizations:

### 1. Health Checks
- **Health Check Path**: `/health/live`
- Render will automatically monitor this endpoint
- Service will restart if health checks fail

### 2. Performance
- Compression enabled with optimal settings
- Trust proxy configuration for proper IP detection
- Memory-efficient request handling

### 3. Security
- CORS configured for production use
- Helmet.js with cloud-friendly settings
- Rate limiting with proper proxy support

### 4. Logging
- Structured logging for Render's log aggregation
- Request correlation IDs
- Performance metrics

## Post-Deployment Testing

Once deployed, test your API:

```bash
# Replace YOUR_APP_NAME with your actual Render app name
export API_URL="https://YOUR_APP_NAME.onrender.com"

# Health check
curl $API_URL/health

# Test gas station endpoint
curl -X POST $API_URL/api/v1/gasbuddy/stations \
  -H "Content-Type: application/json" \
  -d '{"lat": 40.7128, "lng": -74.0060}'

# Get fuel types
curl $API_URL/api/v1/gasbuddy/fuel-types
```

## Monitoring on Render

### Built-in Monitoring
- **Metrics**: CPU, Memory, Response times
- **Logs**: Real-time log streaming
- **Alerts**: Configure alerts for downtime or errors

### Health Check Endpoints
- `/health` - Basic health with system info
- `/health/ready` - Readiness check with dependencies
- `/health/live` - Liveness check (used by Render)

## Scaling

### Free Tier Limitations
- Sleeps after 15 minutes of inactivity
- 512MB RAM, shared CPU
- 100GB bandwidth/month

### Paid Tier Benefits
- Always-on service
- Dedicated resources
- Auto-scaling capabilities
- Custom domains

## Troubleshooting

### Common Issues

1. **Service Won't Start**
   - Check logs in Render dashboard
   - Verify environment variables are set
   - Ensure Node.js version compatibility

2. **Health Check Failures**
   - Verify `/health/live` endpoint responds
   - Check if service is binding to correct port
   - Review application logs for errors

3. **API Errors**
   - Check GasBuddy service availability
   - Verify CSRF token is current
   - Review rate limiting settings

### Debug Commands

```bash
# Check service status
curl https://YOUR_APP_NAME.onrender.com/health

# View detailed health info
curl https://YOUR_APP_NAME.onrender.com/health/ready

# Test with verbose output
curl -v https://YOUR_APP_NAME.onrender.com/
```

## Support

- **Render Documentation**: https://render.com/docs
- **API Issues**: Create an issue in the GitHub repository
- **Render Support**: Available through Render dashboard

## Cost Optimization

### Free Tier Usage
- Use for development and testing
- Expect cold starts after inactivity
- Monitor bandwidth usage

### Production Recommendations
- Use Starter plan ($7/month) minimum
- Enable auto-scaling for traffic spikes
- Set up monitoring and alerts
- Consider CDN for static assets

## Security Best Practices

1. **Environment Variables**: Never commit secrets to code
2. **CORS**: Configure specific origins for production
3. **Rate Limiting**: Adjust limits based on usage patterns
4. **Monitoring**: Set up alerts for unusual activity
5. **Updates**: Keep dependencies updated regularly