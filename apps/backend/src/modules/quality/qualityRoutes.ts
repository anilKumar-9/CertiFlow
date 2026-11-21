import { Router } from 'express';
import { QualityController } from './qualityController.js';
import { authenticate, authorizeRoles } from '../../middleware/auth.js';

export const qualityRouter = Router();

qualityRouter.use(authenticate);
qualityRouter.use(authorizeRoles('QUALITY_OFFICER', 'ADMIN'));

qualityRouter.get('/queue', QualityController.getQueue);
qualityRouter.get('/batches/:id/sample', QualityController.getSampleCandidates);
qualityRouter.post('/batches/:id/approve', QualityController.approve);
qualityRouter.post('/batches/:id/reject', QualityController.reject);
