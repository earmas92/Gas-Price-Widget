import fetch from 'node-fetch';
import { createHeaders } from '../utils/headers.js';
import { AppError } from '../utils/errors.js';

export class GasBuddyService {
  constructor() {
    this.baseUrl = process.env.GASBUDDY_API_URL || 'https://www.gasbuddy.com/graphql';
    this.timeout = parseInt(process.env.REQUEST_TIMEOUT || '15000');
  }

  // GraphQL query for station data
  static STATION_QUERY = `
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

  async getStations(params) {
    const startTime = Date.now();
    
    try {
      const graphqlRequest = {
        query: GasBuddyService.STATION_QUERY,
        variables: params
      };

      const requestOptions = {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(graphqlRequest),
        timeout: this.timeout
      };

      console.log(`[${new Date().toISOString()}] 🔍 Fetching stations for lat: ${params.lat}, lng: ${params.lng}`);

      const response = await fetch(this.baseUrl, requestOptions);
      
      await this._handleResponseErrors(response);

      const result = await response.text();
      const parsedResult = this._parseResponse(result);
      
      // Check for GraphQL errors
      if (parsedResult.errors && parsedResult.errors.length > 0) {
        console.error(`[${new Date().toISOString()}] ❌ GraphQL errors:`, parsedResult.errors);
        throw new AppError('Query execution failed', 400, parsedResult.errors);
      }

      const duration = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] ✅ Successfully retrieved station data (${duration}ms)`);
      
      return parsedResult;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[${new Date().toISOString()}] ❌ Station request failed (${duration}ms):`, error.message);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      // Handle specific error types
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new AppError('Unable to connect to GasBuddy service', 503);
      }
      
      if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
        throw new AppError('Request timeout. Please try again.', 504);
      }
      
      throw new AppError('Failed to fetch station data', 500);
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          query: '{ __typename }' // Minimal GraphQL introspection query
        }),
        timeout: 5000
      });

      if (!response.ok) {
        throw new Error(`Health check failed with status ${response.status}`);
      }

      return true;
    } catch (error) {
      throw new Error(`GasBuddy service unavailable: ${error.message}`);
    }
  }

  async _handleResponseErrors(response) {
    if (response.status === 429) {
      throw new AppError('Rate limit exceeded by upstream service. Please try again later.', 429);
    }

    if (response.status === 403) {
      throw new AppError('Access forbidden. API token may be invalid or expired.', 403);
    }

    if (response.status >= 500) {
      throw new AppError('Upstream service error. Please try again later.', 502);
    }

    if (!response.ok) {
      throw new AppError(`API request failed with status ${response.status}`, response.status);
    }
  }

  _parseResponse(responseText) {
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[${new Date().toISOString()}] ❌ Failed to parse response:`, parseError);
      throw new AppError('Invalid response from upstream service', 502);
    }
  }
}