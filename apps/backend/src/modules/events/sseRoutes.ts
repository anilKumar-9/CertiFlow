import { Router } from 'express';
import { SseController } from './sseController.js';
import { authenticate } from '../../middleware/auth.js';

export const sseRouter = Router();

// Allow authenticated users to connect for real-time domain notifications
sseRouter.get('/stream', authenticate, SseController.stream);
