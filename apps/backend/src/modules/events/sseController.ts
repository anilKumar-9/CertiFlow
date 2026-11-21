import { Request, Response } from 'express';
import crypto from 'crypto';
import { SseManager } from './sseManager.js';

export class SseController {
  public static stream(req: Request, res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering on Nginx reverse proxy
    res.flushHeaders();

    const user = (req as any).user || { userId: 'anonymous', role: 'PUBLIC' };
    const clientId = crypto.randomUUID();

    SseManager.addClient({
      id: clientId,
      res,
      userId: user.userId,
      role: user.role,
      districtId: user.districtId,
    });
  }
}
