import express, { json } from 'express';
import fetch, { Headers } from 'node-fetch';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(json());
app.use(cors());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all requests
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Gas Price Widget API',
    version: '1.0.0',
    endpoints: {
      '/health': 'GET - Health check',
      '/gasbuddy': 'POST - Get gas station data'
    }
  });
});

// Input validation middleware
const validateGasBuddyRequest = [
  body('fuel')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Fuel type must be an integer between 1-10'),
  
  body('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),
  
  body('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),
  
  body('maxAge')
    .optional()
    .isInt({ min: 0, max: 168 })
    .withMessage('Max age must be an integer between 0-168 hours'),
  
  body('search')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search term must be a string with max 200 characters'),
  
  body('brandId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Brand ID must be a positive integer'),
  
  body('cursor')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Cursor must be a string with max 100 characters')
];

// GraphQL query template
const GASBUDDY_QUERY = `
  query LocationBySearchTerm($brandId: Int, $cursor: String, $fuel: Int, $lat: Float, $lng: Float, $maxAge: Int, $search: String) {
    locationBySearchTerm(lat: $lat, lng: $lng, search: $search) {
      countryCode
      displayName
      latitude
      longitude
      regionCode
      stations(
        brandId: $brandId
        cursor: $cursor
        fuel: $fuel
        lat: $lat
        lng: $lng
        maxAge: $maxAge
      ) {
        count
        cursor {
          next
          __typename
        }
        results {
          address {
            country
            line1
            line2
            locality
            postalCode
            region
            __typename
          }
          brands {
            brandId
            imageUrl
            name
            __typename
          }
          distance
          fuels
          id
          name
          prices {
            cash {
              nickname
              postedTime
              price
              formattedPrice
              __typename
            }
            credit {
              nickname
              postedTime
              price
              formattedPrice
              __typename
            }
            discount
            fuelProduct
            __typename
          }
          priceUnit
          ratingsCount
          starRating
          __typename
        }
        __typename
      }
      trends {
        areaName
        country
        today
        todayLow
        trend
        __typename
      }
      __typename
    }
  }
`;

// Create request headers
function createHeaders() {
  const headers = new Headers();
  headers.append("authority", "www.gasbuddy.com");
  headers.append("accept", "*/*");
  headers.append("accept-language", "en-US,en;q=0.9");
  headers.append("apollo-require-preflight", "true");
  headers.append("content-type", "application/json");
  headers.append("gbcsrf", process.env.GASBUDDY_CSRF_TOKEN || "1.ZZjgVN9S4RtbF6zO");
  headers.append("origin", "https://www.gasbuddy.com");
  headers.append("referer", process.env.GASBUDDY_REFERER || "https://www.gasbuddy.com/home");
  headers.append("sec-ch-ua", '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"');
  headers.append("sec-ch-ua-mobile", "?0");
  headers.append("sec-ch-ua-platform", '"macOS"');
  headers.append("sec-fetch-dest", "empty");
  headers.append("sec-fetch-mode", "cors");
  headers.append("sec-fetch-site", "same-origin");
  headers.append("user-agent", process.env.USER_AGENT || "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
  
  return headers;
}

// Error response helper
function createErrorResponse(status, message, details = null) {
  const response = {
    error: message,
    timestamp: new Date().toISOString()
  };
  
  if (details) {
    response.details = details;
  }
  
  return { status, response };
}

app.post('/gasbuddy', validateGasBuddyRequest, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const { status, response } = createErrorResponse(
        400, 
        'Invalid request parameters', 
        errors.array()
      );
      return res.status(status).json(response);
    }

    // Prepare GraphQL request
    const graphqlRequest = {
      query: GASBUDDY_QUERY,
      variables: req.body
    };

    const requestOptions = {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(graphqlRequest),
      timeout: parseInt(process.env.REQUEST_TIMEOUT || '10000') // 10 second timeout
    };

    console.log(`[${new Date().toISOString()}] Making request to GasBuddy API for lat: ${req.body.lat}, lng: ${req.body.lng}`);

    const response = await fetch(
      process.env.GASBUDDY_API_URL || "https://www.gasbuddy.com/graphql", 
      requestOptions
    );

    // Handle different HTTP status codes
    if (response.status === 429) {
      const { status, response: errorResponse } = createErrorResponse(
        429, 
        'Rate limit exceeded by upstream service. Please try again later.'
      );
      return res.status(status).json(errorResponse);
    }

    if (response.status === 403) {
      const { status, response: errorResponse } = createErrorResponse(
        403, 
        'Access forbidden. API token may be invalid or expired.'
      );
      return res.status(status).json(errorResponse);
    }

    if (response.status >= 500) {
      const { status, response: errorResponse } = createErrorResponse(
        502, 
        'Upstream service error. Please try again later.'
      );
      return res.status(status).json(errorResponse);
    }

    if (!response.ok) {
      const { status, response: errorResponse } = createErrorResponse(
        response.status, 
        `API request failed with status ${response.status}`
      );
      return res.status(status).json(errorResponse);
    }

    const result = await response.text();
    let parsedResult;
    
    try {
      parsedResult = JSON.parse(result);
    } catch (parseError) {
      console.error(`[${new Date().toISOString()}] Failed to parse GasBuddy response:`, parseError);
      const { status, response: errorResponse } = createErrorResponse(
        502, 
        'Invalid response from upstream service'
      );
      return res.status(status).json(errorResponse);
    }

    // Check for GraphQL errors
    if (parsedResult.errors && parsedResult.errors.length > 0) {
      console.error(`[${new Date().toISOString()}] GraphQL errors:`, parsedResult.errors);
      const { status, response: errorResponse } = createErrorResponse(
        400, 
        'Query execution failed',
        parsedResult.errors
      );
      return res.status(status).json(errorResponse);
    }

    console.log(`[${new Date().toISOString()}] Successfully retrieved gas station data`);
    res.json(parsedResult);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Unexpected error:`, error);
    
    // Handle specific error types
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      const { status, response: errorResponse } = createErrorResponse(
        503, 
        'Unable to connect to upstream service'
      );
      return res.status(status).json(errorResponse);
    }
    
    if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
      const { status, response: errorResponse } = createErrorResponse(
        504, 
        'Request timeout. Please try again.'
      );
      return res.status(status).json(errorResponse);
    }
    
    // Generic error response
    const { status, response: errorResponse } = createErrorResponse(
      500, 
      'Internal server error'
    );
    res.status(status).json(errorResponse);
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Unhandled error:`, err);
  const { status, response } = createErrorResponse(500, 'Internal server error');
  res.status(status).json(response);
});

// 404 handler
app.use('*', (req, res) => {
  const { status, response } = createErrorResponse(404, 'Endpoint not found');
  res.status(status).json(response);
});

app.listen(port, () => {
  console.log(`[${new Date().toISOString()}] Gas Price Widget server is running on port ${port}`);
  console.log(`[${new Date().toISOString()}] Environment: ${process.env.NODE_ENV || 'development'}`);
});
