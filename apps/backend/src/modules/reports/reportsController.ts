import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reportsService.js';

export class ReportsController {
  public static async getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const overview = await ReportsService.getOverview(user);

      res.status(200).json({
        success: true,
        data: overview,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  public static async exportBatches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const buffer = await ReportsService.exportBatchesWorkbook(user);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=certiflow_governance_report_${Date.now()}.xlsx`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  }
}
