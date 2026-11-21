import { prisma } from '../../config/database.js';
import { createOutboxEvent } from '../../events/outbox.js';
import { AuditService } from '../audit/auditService.js';
import { NotFoundError, ConflictError, ValidationError } from '../../middleware/errorHandler.js';
import { EVENT_TOPICS, PaginatedResponse, PaginationQueryInput, QualityAuditInput } from '@certiflow/shared';

export class QualityService {
  public static async getQualityQueue(query: PaginationQueryInput): Promise<PaginatedResponse<any>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'QUALITY_REVIEW',
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

  public static async getSampleCandidates(batchId: string): Promise<any> {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { candidates: true, district: true },
    });

    if (!batch) {
      throw new NotFoundError('Batch not found');
    }

    const candidates = batch.candidates;
    const totalCount = candidates.length;
    const sampleSize = Math.max(1, Math.ceil(totalCount * 0.10));

    // Deterministic pseudo-random selection using batch ID hash
    const sorted = [...candidates].sort((a, b) => a.id.localeCompare(b.id));
    const step = Math.max(1, Math.floor(totalCount / sampleSize));
    const sampledCandidates = [];
    for (let i = 0; i < totalCount && sampledCandidates.length < sampleSize; i += step) {
      sampledCandidates.push(sorted[i]);
    }

    return {
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      totalCandidates: totalCount,
      sampleSize: sampledCandidates.length,
      samplePercentage: '10%',
      isHighVolume: totalCount >= 100,
      sampledCandidates: sampledCandidates.map((c) => ({
        id: c.id,
        fullName: c.fullName,
        fatherName: c.fatherName,
        dob: c.dob,
        gender: c.gender,
        enrollmentNumber: c.enrollmentNumber,
        maskedAadhaar: 'XXXXXXXX' + c.aadhaarHash.slice(-4),
        status: c.status,
      })),
    };
  }

  public static async certifyQualityPass(
    batchId: string,
    officer: { userId: string; role: string },
    input: QualityAuditInput
  ): Promise<any> {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundError('Batch not found');
    }

    if (batch.status !== 'QUALITY_REVIEW') {
      throw new ConflictError(`Batch is not pending quality review (current status: ${batch.status})`);
    }

    if (!input.passedIdentityHash || !input.passedScoreThreshold || !input.passedAttendanceThreshold) {
      throw new ValidationError('All mandatory quality compliance checkpoints must be certified before approval.');
    }

    return await prisma.$transaction(async (tx) => {
      await tx.approval.create({
        data: {
          batchId: batch.id,
          batchVersion: batch.version,
          tier: 'QUALITY',
          approverId: officer.userId,
          decision: 'APPROVED',
          remarks: input.remarks || '10% Statistical Sampling Dossiers Audited & Passed',
        },
      });

      // Once quality passes, batch moves to DISTRICT_APPROVED (ready for final state clearance)
      const updatedBatch = await tx.batch.update({
        where: { id: batch.id },
        data: {
          status: 'DISTRICT_APPROVED',
        },
      });

      await createOutboxEvent(
        EVENT_TOPICS.BATCH_QUALITY_REVIEWED,
        {
          batchId: updatedBatch.id,
          batchNumber: updatedBatch.batchNumber,
          version: updatedBatch.version,
          auditedCount: input.sampleCandidateIds.length,
        },
        tx
      );

      await AuditService.logAction({
        actorId: officer.userId,
        actorRole: officer.role,
        targetEntity: 'Batch',
        targetId: batch.id,
        actionType: 'QUALITY_AUDIT_PASSED',
        diffPayload: {
          sampleSize: input.sampleCandidateIds.length,
          remarks: input.remarks,
        },
      });

      return updatedBatch;
    });
  }

  public static async rejectQuality(
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
          tier: 'QUALITY',
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
        actionType: 'QUALITY_AUDIT_FAILED',
        diffPayload: { reasonCode, remarks },
      });

      return updatedBatch;
    });
  }
}
