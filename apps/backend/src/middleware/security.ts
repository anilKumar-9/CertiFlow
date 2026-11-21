import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { ValidationError } from './errorHandler.js';

export const generalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded. Please try again later.',
    },
    timestamp: new Date().toISOString(),
  },
});

export const publicVerificationRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: env.PUBLIC_VERIFY_RATE_LIMIT_MAX, // 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Verification rate limit exceeded. Maximum 10 verification requests per minute.',
    },
    timestamp: new Date().toISOString(),
  },
});

export function validateSpreadsheetUpload(req: Request, _res: Response, next: NextFunction): void {
  const contentType = req.headers['content-type'] || '';
  const contentLength = Number(req.headers['content-length'] || 0);

  // Maximum 10MB file limit
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  if (contentLength > MAX_FILE_SIZE) {
    throw new ValidationError('File size exceeds the 10MB maximum limit');
  }

  // Check multipart or excel mime
  if (
    !contentType.includes('multipart/form-data') &&
    !contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') &&
    !contentType.includes('application/octet-stream')
  ) {
    throw new ValidationError('Invalid upload format. Spreadsheet workbook (.xlsx) required');
  }

  next();
}

export const spreadsheetUploadValidator = validateSpreadsheetUpload;
