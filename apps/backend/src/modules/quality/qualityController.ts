import { Request, Response, NextFunction } from 'express';
import { QualityService } from './qualityService.js';
import { paginationQuerySchema, qualityAuditSchema, rejectionSchema } from '@certiflow/shared';

export class QualityController {
  public static async getQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = paginationQuerySchema.parse(req.query);
      const result = await QualityService.getQualityQueue(query);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getSampleCandidates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await QualityService.getSampleCandidates(id);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  public static async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const body = qualityAuditSchema.parse(req.body);

      const batch = await QualityService.certifyQualityPass(id, user, body);

      res.status(200).json({
        success: true,
        data: batch,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  public static async reject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const body = rejectionSchema.parse(req.body);

      const batch = await QualityService.rejectQuality(id, user, body.reasonCode, body.remarks);

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
