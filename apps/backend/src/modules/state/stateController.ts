import { Request, Response, NextFunction } from 'express';
import { StateService } from './stateService.js';
import { paginationQuerySchema, approvalSchema, rejectionSchema, revokeCertificateSchema } from '@certiflow/shared';

export class StateController {
  public static async getQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = paginationQuerySchema.parse(req.query);
      const result = await StateService.getStateQueue(query);

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
      const body = approvalSchema.parse(req.body);

      const batch = await StateService.grantStateApproval(id, user, body.remarks);

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

      const batch = await StateService.rejectState(id, user, body.reasonCode, body.remarks);

      res.status(200).json({
        success: true,
        data: batch,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  public static async revoke(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const body = revokeCertificateSchema.parse(req.body);

      const certificate = await StateService.revokeCertificate(body, user);

      res.status(200).json({
        success: true,
        data: {
          certificate,
          message: `Certificate ${body.certificateNumber} has been permanently REVOKED.`,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}
