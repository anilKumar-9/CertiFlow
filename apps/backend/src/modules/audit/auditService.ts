import { prisma } from '../../config/database.js';
import { Prisma } from '@prisma/client';

export interface AuditLogInput {
  actorId: string;
  actorRole: string;
  targetEntity: string;
  targetId: string;
  actionType: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  diffPayload?: Record<string, unknown> | null;
}

export class AuditService {
  public static async logAction(input: AuditLogInput): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: input.actorId,
          actorRole: input.actorRole,
          targetEntity: input.targetEntity,
          targetId: input.targetId,
          actionType: input.actionType,
          ipAddress: input.ipAddress || null,
          userAgent: input.userAgent || null,
          diffPayload: (input.diffPayload as Prisma.InputJsonValue) || undefined,
        },
      });
    } catch (error) {
      // Log failure without halting primary transaction if outside atomic boundary
      console.error('[AuditService Error]', error);
    }
  }
}
