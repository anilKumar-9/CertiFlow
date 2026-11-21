import { prisma } from '../../config/database.js';
import { createOutboxEvent } from '../../events/outbox.js';
import { AuditService } from '../audit/auditService.js';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from '../../middleware/errorHandler.js';
import { EVENT_TOPICS, PaginatedResponse, PaginationQueryInput } from '@certiflow/shared';

export class DistrictService {
  public static async getQueue(
    districtId: string,
    query: PaginationQueryInput
  ): Promise<PaginatedResponse<any>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      districtId,
      status: { in: ['SUBMITTED', 'DISTRICT_PARTIALLY_APPROVED'] },
    };

    if (query.search) {
      where.OR = [
        { batchNumber: { contains: query.search, mode: 'insensitive' } },
        { courseName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.batch.findMany({
        where,
        include: {
          trainingCentre: { select: { name: true, email: true } },
          district: true,
          approvals: {
            where: { tier: 'DISTRICT' },
            include: {
              approver: { select: { id: true, name: true, role: true } },
            },
          },
        },
        orderBy: { submittedAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.batch.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  public static async approveBatch(
    batchId: string,
    officer: { userId: string; districtId?: string | null; role: string },
    remarks?: string
  ): Promise<any> {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundError('Batch not found');
    }

    if (batch.districtId !== officer.districtId) {
      throw new ForbiddenError('Unauthorized: Batch belongs to another district jurisdiction');
    }

    if (batch.status !== 'SUBMITTED' && batch.status !== 'DISTRICT_PARTIALLY_APPROVED') {
      throw new ConflictError(`Batch is not pending district review (current status: ${batch.status})`);
    }

    // Dual-officer enforcement: verify this officer has not already signed for this version
    const existingApproval = await prisma.approval.findFirst({
      where: {
        batchId: batch.id,
        batchVersion: batch.version,
        tier: 'DISTRICT',
        approverId: officer.userId,
      },
    });

    if (existingApproval) {
      throw new ConflictError('Dual-Officer Governance Rule: You have already applied digital sign-off to this batch version.');
    }

    // Check count of district approvals on current batch version
    const priorDistrictApprovals = await prisma.approval.count({
      where: {
        batchId: batch.id,
        batchVersion: batch.version,
        tier: 'DISTRICT',
        decision: 'APPROVED',
      },
    });

    const isFirstOfficer = priorDistrictApprovals === 0;

    return await prisma.$transaction(async (tx) => {
      // 1. Record Approval
      await tx.approval.create({
        data: {
          batchId: batch.id,
          batchVersion: batch.version,
          tier: 'DISTRICT',
          approverId: officer.userId,
          decision: 'APPROVED',
          remarks: remarks || (isFirstOfficer ? 'Officer 1 Inspection Approved' : 'Officer 2 Inspection Approved'),
        },
      });

      let nextStatus: any;
      if (isFirstOfficer) {
        nextStatus = 'DISTRICT_PARTIALLY_APPROVED';
      } else {
        // Both district officers have signed!
        nextStatus = batch.qualityReviewRequired ? 'QUALITY_REVIEW' : 'DISTRICT_APPROVED';
      }

      const updatedBatch = await tx.batch.update({
        where: { id: batch.id },
        data: { status: nextStatus },
        include: { district: true },
      });

      if (!isFirstOfficer) {
        // Outbox event for next tier escalation
        await createOutboxEvent(
          EVENT_TOPICS.BATCH_DISTRICT_APPROVED,
          {
            batchId: updatedBatch.id,
            batchNumber: updatedBatch.batchNumber,
            version: updatedBatch.version,
            districtId: updatedBatch.districtId,
            qualityReviewRequired: updatedBatch.qualityReviewRequired,
            nextStatus,
          },
          tx
        );
      }

      await AuditService.logAction({
        actorId: officer.userId,
        actorRole: officer.role,
        targetEntity: 'Batch',
        targetId: batch.id,
        actionType: isFirstOfficer ? 'DISTRICT_OFFICER_1_SIGNED' : 'DISTRICT_OFFICER_2_SIGNED',
        diffPayload: { previousStatus: batch.status, newStatus: nextStatus, remarks },
      });

      return updatedBatch;
    });
  }

  public static async rejectBatch(
    batchId: string,
    officer: { userId: string; districtId?: string | null; role: string },
    reasonCode: string,
    remarks: string
  ): Promise<any> {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundError('Batch not found');
    }

    if (batch.districtId !== officer.districtId) {
      throw new ForbiddenError('Unauthorized: Batch belongs to another district jurisdiction');
    }

    return await prisma.$transaction(async (tx) => {
      // Log rejection approval record under current version
      await tx.approval.create({
        data: {
          batchId: batch.id,
          batchVersion: batch.version,
          tier: 'DISTRICT',
          approverId: officer.userId,
          decision: 'REJECTED',
          remarks: `[${reasonCode}] ${remarks}`,
        },
      });

      // Increment batch version on return for revision
      const updatedBatch = await tx.batch.update({
        where: { id: batch.id },
        data: {
          status: 'NEEDS_REVISION',
          version: batch.version + 1,
        },
      });

      await AuditService.logAction({
        actorId: officer.userId,
        actorRole: officer.role,
        targetEntity: 'Batch',
        targetId: batch.id,
        actionType: 'BATCH_RETURNED_FOR_REVISION',
        diffPayload: {
          previousStatus: batch.status,
          newStatus: 'NEEDS_REVISION',
          newVersion: batch.version + 1,
          reasonCode,
          remarks,
        },
      });

      return updatedBatch;
    });
  }
}
