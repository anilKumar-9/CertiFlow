import { Router } from 'express';
import { ReportsController } from './reportsController.js';
import { authenticate } from '../../middleware/auth.js';

export const reportsRouter = Router();

reportsRouter.use(authenticate);

reportsRouter.get('/overview', ReportsController.getOverview);
reportsRouter.get('/export/batches', ReportsController.exportBatches);
