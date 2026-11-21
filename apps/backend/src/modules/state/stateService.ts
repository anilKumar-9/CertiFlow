import { prisma } from '../../config/database.js';
import { createOutboxEvent } from '../../events/outbox.js';
import { AuditService } from '../audit/auditService.js';
import { NotFoundError, ConflictError } from '../../middleware/errorHandler.js';
import {
  EVENT_TOPICS,
  PaginatedResponse,
  PaginationQueryInput,
  RevokeCertificateInput,
} from '@certiflow/shared';

export class StateService {
  public static async getStateQueue(query: PaginationQueryInput): Promise<PaginatedResponse<any>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'DISTRICT_APPROVED',
    };

    if (query.districtId) {
      where.districtId = query.districtId;
    }

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
          district: true,
          trainingCentre: { select: { name: true, email: true } },
          approvals: {
            include: { approver: { select: { name: true, role: true } } },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { updatedAt: 'asc' },
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

  public static async grantStateApproval(
    batchId: string,
    officer: { userId: string; role: string },
    remarks?: string
  ): Promise<any> {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundError('Batch not found');
    }

    if (batch.status !== 'DISTRICT_APPROVED') {
      throw new ConflictError(
        `Batch is not cleared for State Issuance. Current status: ${batch.status}`
      );
    }

    return await prisma.$transaction(async (tx) => {
      await tx.approval.create({
        data: {
          batchId: batch.id,
          batchVersion: batch.version,
          tier: 'STATE',
          approverId: officer.userId,
          decision: 'APPROVED',
          remarks: remarks || 'Executive State Clearance Granted. Dispatched for generation.',
        },
      });

      const updatedBatch = await tx.batch.update({
        where: { id: batch.id },
        data: {
          status: 'STATE_APPROVED',
          stateApprovedAt: new Date(),
          stateApproverId: officer.userId,
        },
        include: { district: true },
      });

      // Atomically enqueue domain event for BullMQ certificate generation worker
      await createOutboxEvent(
        EVENT_TOPICS.CERTIFICATE_BATCH_CLEARED,
        {
          batchId: updatedBatch.id,
          batchNumber: updatedBatch.batchNumber,
          districtCode: updatedBatch.district?.code || 'DL',
          candidateCount: updatedBatch.candidateCount,
          version: updatedBatch.version,
        },
        tx
      );

      await AuditService.logAction({
        actorId: officer.userId,
        actorRole: officer.role,
        targetEntity: 'Batch',
        targetId: batch.id,
        actionType: 'STATE_APPROVAL_GRANTED',
        diffPayload: { remarks },
      });

      return updatedBatch;
    });
  }

  public static async rejectState(
    batchId: string,
    officer: { userId: string; role: string },
    reasonCode: string,
    remarks: string
  ): Promise<any> {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundError('Batch not found');
    }

    return await prisma.$transaction(async (tx) => {
      await tx.approval.create({
        data: {
          batchId: batch.id,
          batchVersion: batch.version,
          tier: 'STATE',
          approverId: officer.userId,
          decision: 'REJECTED',
          remarks: `[${reasonCode}] ${remarks}`,
        },
      });

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
        actionType: 'STATE_APPROVAL_REJECTED',
        diffPayload: { reasonCode, remarks },
      });

      return updatedBatch;
    });
  }

  public static async revokeCertificate(
    input: RevokeCertificateInput,
    officer: { userId: string; role: string }
  ): Promise<any> {
    const cert = await prisma.certificate.findUnique({
      where: { certificateNumber: input.certificateNumber },
      include: { candidate: true, batch: true },
    });

    if (!cert) {
      throw new NotFoundError(`Certificate with number ${input.certificateNumber} not found`);
    }

    if (cert.status === 'REVOKED') {
      throw new ConflictError('Certificate is already marked as REVOKED');
    }

    return await prisma.$transaction(async (tx) => {
      const revoked = await tx.certificate.update({
        where: { id: cert.id },
        data: { status: 'REVOKED' },
      });

      await createOutboxEvent(
        EVENT_TOPICS.CERTIFICATE_REVOKED,
        {
          certificateId: cert.id,
          certificateNumber: cert.certificateNumber,
          opaqueToken: cert.opaqueToken,
          reason: input.reason,
          remarks: input.remarks,
          revokedAt: new Date().toISOString(),
        },
        tx
      );

      await AuditService.logAction({
        actorId: officer.userId,
        actorRole: officer.role,
        targetEntity: 'Certificate',
        targetId: cert.id,
        actionType: 'CERTIFICATE_REVOKED',
        diffPayload: {
          certificateNumber: cert.certificateNumber,
          candidateName: cert.candidate?.fullName,
          reason: input.reason,
          remarks: input.remarks,
        },
      });

      return revoked;
    });
  }
}
