import { Router } from 'express';
import multer from 'multer';
import { BatchController } from './batchController.js';
import { authenticate, authorizeRoles } from '../../middleware/auth.js';
import { spreadsheetUploadValidator } from '../../middleware/security.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export const batchRouter = Router();

batchRouter.use(authenticate);

// Training Centre actions
batchRouter.post('/', authorizeRoles('TRAINING_CENTRE', 'ADMIN'), BatchController.create);
batchRouter.post(
  '/:id/upload',
  authorizeRoles('TRAINING_CENTRE', 'ADMIN'),
  upload.single('file'),
  spreadsheetUploadValidator,
  BatchController.uploadRoster
);
batchRouter.post('/:id/submit', authorizeRoles('TRAINING_CENTRE', 'ADMIN'), BatchController.submit);

// Read actions
batchRouter.get('/', BatchController.list);
batchRouter.get('/:id', BatchController.getById);
