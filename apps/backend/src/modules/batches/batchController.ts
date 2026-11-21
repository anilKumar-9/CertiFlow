import { Request, Response, NextFunction } from 'express';
import { BatchService } from './batchService.js';
import { createBatchSchema, paginationQuerySchema } from '@certiflow/shared';

export class BatchController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createBatchSchema.parse(req.body);
      const user = (req as any).user;

      const batch = await BatchService.createBatch(user.userId, validated);

      res.status(201).json({
        success: true,
        data: batch,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  public static async uploadRoster(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const file = req.file;

      if (!file || !file.buffer) {
        res.status(400).json({
          success: false,
          error: { code: 'FILE_REQUIRED', message: 'Excel workbook file is required' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await BatchService.uploadRoster(id, user.userId, file.buffer);

      res.status(200).json({
        success: true,
        data: {
          batchId: id,
          candidateCount: result.candidateCount,
          qualityReviewRequired: result.qualityReviewRequired,
          message: `Roster uploaded successfully with ${result.candidateCount} candidates`,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  public static async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const batch = await BatchService.submitBatch(id, user.userId);

      res.status(200).json({
        success: true,
        data: batch,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = paginationQuerySchema.parse(req.query);
      const user = (req as any).user;

      const result = await BatchService.getBatches(user, query);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const batch = await BatchService.getBatchById(id, user);

      res.status(200).json({
        success: true,
        data: batch,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}
