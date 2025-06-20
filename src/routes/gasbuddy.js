import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation.js';
import { GasBuddyService } from '../services/gasBuddyService.js';
import { createSlowDown } from '../middleware/rateLimiter.js';

const router = express.Router();
const gasBuddyService = new GasBuddyService();

// Slow down middleware for expensive operations
const slowDown = createSlowDown();

// Validation rules for gas station requests
const stationValidation = [
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
    .isLength({ min: 1, max: 200 })
    .withMessage('Search term must be a string between 1-200 characters'),
  
  body('brandId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Brand ID must be a positive integer'),
  
  body('cursor')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Cursor must be a string with max 100 characters'),

  body('radius')
    .optional()
    .isFloat({ min: 0.1, max: 50 })
    .withMessage('Radius must be between 0.1 and 50 kilometers')
];

// Get gas stations
router.post('/gasbuddy/stations', slowDown, stationValidation, validateRequest, async (req, res, next) => {
  try {
    const result = await gasBuddyService.getStations(req.body);
    
    // Add metadata to response
    const response = {
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id,
        version: '2.0.0'
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get available fuel types
router.get('/gasbuddy/fuel-types', (req, res) => {
  const fuelTypes = [
    { id: 1, name: 'Regular', description: '87 Octane' },
    { id: 2, name: 'Mid-Grade', description: '89 Octane' },
    { id: 3, name: 'Premium', description: '91+ Octane' },
    { id: 4, name: 'Diesel', description: 'Diesel Fuel' },
    { id: 5, name: 'E85', description: 'Ethanol 85%' }
  ];

  res.json({
    data: fuelTypes,
    meta: {
      timestamp: new Date().toISOString(),
      count: fuelTypes.length
    }
  });
});

export default router;