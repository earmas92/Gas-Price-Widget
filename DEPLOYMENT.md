# Deployment Guide

## GitHub Repository Setup

### 1. Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `gas-price-api` or your preferred name
3. Don't initialize with README (we already have one)
4. Copy the repository URL

### 2. Initialize Git and Push Code

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Production-ready Gas Price API v2.0.0"

# Add remote origin (replace with your repository URL)
git remote add origin https://github.com/yourusername/gas-price-api.git

# Push to GitHub
git push -u origin main
```

## Deployment Options

### Option 1: Railway (Recommended)
1. Go to [Railway](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect it's a Node.js app
6. Add environment variables in Railway dashboard
7. Deploy automatically

### Option 2: Render
1. Go to [Render](https://render.com)
2. Sign up/login with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add environment variables
7. Deploy

### Option 3: Heroku
1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables: `heroku config:set NODE_ENV=production`
5. Deploy: `git push heroku main`

### Option 4: Docker Deployment
Use the included Dockerfile and docker-compose.yml:

```bash
# Build and run locally
docker-compose up -d

# Or deploy to any cloud provider supporting Docker
```

## Environment Variables

Set these in your deployment platform:

```
NODE_ENV=production
PORT=3000
GASBUDDY_API_URL=https://www.gasbuddy.com/graphql
GASBUDDY_CSRF_TOKEN=1.ZZjgVN9S4RtbF6zO
GASBUDDY_REFERER=https://www.gasbuddy.com/home
USER_AGENT=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
REQUEST_TIMEOUT=15000
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
ALLOWED_ORIGINS=*
```

## Post-Deployment Testing

Test your deployed API:

```bash
# Health check
curl https://your-app-url.com/health

# Test gas station endpoint
curl -X POST https://your-app-url.com/api/v1/gasbuddy/stations \
  -H "Content-Type: application/json" \
  -d '{"lat": 40.7128, "lng": -74.0060}'
```

## Monitoring

- Check logs in your deployment platform
- Monitor `/health/ready` endpoint for service health
- Set up alerts for error rates and response times