import { validationResult } from 'express-validator';
import { AppError } from '../utils/errors.js';

export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    throw new AppError('Invalid request parameters', 400, formattedErrors);
  }
  
  next();
}