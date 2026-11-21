import { Router } from 'express';
import { DistrictController } from './districtController.js';
import { authenticate, authorizeRoles } from '../../middleware/auth.js';

export const districtRouter = Router();

districtRouter.use(authenticate);
districtRouter.use(authorizeRoles('DISTRICT_OFFICER', 'ADMIN'));

districtRouter.get('/queue', DistrictController.getQueue);
districtRouter.post('/batches/:id/approve', DistrictController.approve);
districtRouter.post('/batches/:id/reject', DistrictController.reject);
