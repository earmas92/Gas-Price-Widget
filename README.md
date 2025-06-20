# Gas Price API

A production-ready REST API for fetching gas station data from GasBuddy. Built with Node.js, Express, and comprehensive error handling, rate limiting, and monitoring capabilities.

## 🚀 Features

- **Production Ready**: Comprehensive error handling, logging, and monitoring
- **Security**: Helmet.js security headers, rate limiting, input validation
- **Performance**: Compression, request caching, optimized responses
- **Monitoring**: Health checks, readiness probes, structured logging
- **Docker Support**: Multi-stage builds, non-root user, health checks
- **API Versioning**: RESTful API design with versioned endpoints

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (optional)

## 🛠️ Installation

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd gas-price-api
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment configuration:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

### Docker Deployment

1. Build the Docker image:
```bash
docker build -t gas-price-api .
```

2. Run with Docker Compose:
```bash
docker-compose up -d
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `GASBUDDY_API_URL` | GasBuddy GraphQL endpoint | `https://www.gasbuddy.com/graphql` |
| `GASBUDDY_CSRF_TOKEN` | CSRF token for GasBuddy | `1.ZZjgVN9S4RtbF6zO` |
| `REQUEST_TIMEOUT` | Request timeout in ms | `15000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `RATE_LIMIT_WINDOW` | Rate limit window in ms | `900000` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `*` |

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### Health Checks
- `GET /health` - Basic health check
- `GET /health/ready` - Readiness check (includes dependencies)
- `GET /health/live` - Liveness check (minimal)

#### Gas Station Data
- `POST /api/v1/gasbuddy/stations` - Get gas station data
- `GET /api/v1/gasbuddy/fuel-types` - Get available fuel types

### Example Request

```bash
curl -X POST http://localhost:3000/api/v1/gasbuddy/stations \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 40.7128,
    "lng": -74.0060,
    "fuel": 1,
    "maxAge": 24
  }'
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | Float | Yes | Latitude (-90 to 90) |
| `lng` | Float | Yes | Longitude (-180 to 180) |
| `fuel` | Integer | No | Fuel type (1-10) |
| `maxAge` | Integer | No | Max age in hours (0-168) |
| `search` | String | No | Search term (max 200 chars) |
| `brandId` | Integer | No | Brand ID filter |
| `cursor` | String | No | Pagination cursor |
| `radius` | Float | No | Search radius in km (0.1-50) |

## 🔒 Security Features

- **Helmet.js**: Security headers (CSP, HSTS, etc.)
- **Rate Limiting**: Configurable request limits
- **Input Validation**: Comprehensive request validation
- **CORS**: Configurable cross-origin policies
- **Request Logging**: Structured logging with request IDs

## 📊 Monitoring

### Health Checks
- **Basic Health**: Server status and uptime
- **Readiness**: Includes external dependency checks
- **Liveness**: Minimal check for container orchestration

### Logging
- Structured JSON logging
- Request/response correlation IDs
- Performance metrics
- Error tracking

## 🚀 Deployment

### Docker
```bash
docker build -t gas-price-api .
docker run -p 3000:3000 --env-file .env gas-price-api
```

### Docker Compose
```bash
docker-compose up -d
```

### Cloud Platforms
The API is ready for deployment on:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- Kubernetes
- Heroku
- Railway
- Render

## 🧪 Testing

```bash
# Run tests
npm test

# Health check
curl http://localhost:3000/health

# Load test endpoint
curl -X POST http://localhost:3000/api/v1/gasbuddy/stations \
  -H "Content-Type: application/json" \
  -d '{"lat": 40.7128, "lng": -74.0060}'
```

## 📈 Performance

- **Compression**: Gzip compression enabled
- **Request Caching**: Intelligent caching strategies  
- **Connection Pooling**: Optimized HTTP connections
- **Memory Management**: Efficient memory usage patterns

## 🛡️ Error Handling

- **Structured Errors**: Consistent error response format
- **Error Classification**: Operational vs programming errors
- **Graceful Degradation**: Fallback mechanisms
- **Circuit Breaker**: Protection against cascading failures

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the logs for debugging information