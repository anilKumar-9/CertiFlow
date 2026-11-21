import { Router } from 'express';
import { VerificationController } from './verificationController.js';
import { publicVerificationRateLimiter } from '../../middleware/security.js';

export const verificationRouter = Router();

// PDF Download endpoint
verificationRouter.get('/:identifier/pdf', VerificationController.downloadPdf);

// Publicly accessible, rate-limited to 10 requests per minute per IP
verificationRouter.get('/:identifier', publicVerificationRateLimiter, VerificationController.verify);
