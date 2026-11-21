import { Request, Response, NextFunction } from 'express';
import { DistrictService } from './districtService.js';
import { paginationQuerySchema, approvalSchema, rejectionSchema } from '@certiflow/shared';

export class DistrictController {
  public static async getQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = paginationQuerySchema.parse(req.query);
      const user = (req as any).user;

      if (!user.districtId) {
        res.status(403).json({
          success: false,
          error: { code: 'DISTRICT_REQUIRED', message: 'User is not assigned to a district jurisdiction' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const queue = await DistrictService.getQueue(user.districtId, query);

      res.status(200).json({
        success: true,
        data: queue,
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
      const body = approvalSchema.parse(req.body);

      const batch = await DistrictService.approveBatch(id, user, body.remarks);

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

      const batch = await DistrictService.rejectBatch(id, user, body.reasonCode, body.remarks);

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
