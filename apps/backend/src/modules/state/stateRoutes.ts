import { Router } from 'express';
import { StateController } from './stateController.js';
import { authenticate, authorizeRoles } from '../../middleware/auth.js';

export const stateRouter = Router();

stateRouter.use(authenticate);
stateRouter.use(authorizeRoles('STATE_OFFICER', 'ADMIN'));

stateRouter.get('/queue', StateController.getQueue);
stateRouter.post('/batches/:id/approve', StateController.approve);
stateRouter.post('/batches/:id/reject', StateController.reject);
stateRouter.post('/certificates/revoke', StateController.revoke);
