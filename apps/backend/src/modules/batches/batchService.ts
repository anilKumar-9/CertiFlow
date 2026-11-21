import crypto from 'crypto';
import { prisma } from '../../config/database.js';
import { ExcelParserService } from './excelParser.js';
import { createOutboxEvent } from '../../events/outbox.js';
import { AuditService } from '../audit/auditService.js';
import {
  AppError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
  ConflictError,
} from '../../middleware/errorHandler.js';
import {
  CreateBatchInput,
  PaginationQueryInput,
  EVENT_TOPICS,
  PaginatedResponse,
  Batch as BatchDto,
} from '@certiflow/shared';

export class BatchService {
  private static hashAadhaar(aadhaar: string): string {
    return crypto.createHash('sha256').update(aadhaar).digest('hex');
  }

  public static async createBatch(
    trainingCentreId: string,
    input: CreateBatchInput
  ): Promise<any> {
    const district = await prisma.district.findUnique({
      where: { id: input.districtId },
    });

    if (!district) {
      throw new NotFoundError('Selected district not found');
    }

    const currentYear = new Date().getFullYear();
    const count = await prisma.batch.count({
      where: { districtId: input.districtId },
    });
    const sequence = String(count + 1).padStart(4, '0');
    const batchNumber = `BATCH-${currentYear}-${district.code.toUpperCase()}-${sequence}`;

    const batch = await prisma.batch.create({
      data: {
        batchNumber,
        trainingCentreId,
        districtId: input.districtId,
        courseName: input.courseName,
        startDate: input.startDate,
        endDate: input.endDate,
        status: 'DRAFT',
      },
      include: { district: true },
    });

    await AuditService.logAction({
      actorId: trainingCentreId,
      actorRole: 'TRAINING_CENTRE',
      targetEntity: 'Batch',
      targetId: batch.id,
      actionType: 'BATCH_CREATED',
      diffPayload: { batchNumber, courseName: input.courseName },
    });

    return batch;
  }

  public static async uploadRoster(
    batchId: string,
    trainingCentreId: string,
    buffer: Buffer
  ): Promise<{ candidateCount: number; qualityReviewRequired: boolean }> {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundError('Batch not found');
    }

    if (batch.trainingCentreId !== trainingCentreId) {
      throw new ForbiddenError('Unauthorized: You do not own this batch');
    }

    if (batch.status !== 'DRAFT' && batch.status !== 'NEEDS_REVISION') {
      throw new ConflictError(`Cannot upload roster for batch with status ${batch.status}`);
    }

    // Parse and validate via ExcelJS streaming parser
    const parseResult = await ExcelParserService.parseCandidateWorkbook(buffer);

    if (parseResult.errors.length > 0) {
      const err = new ValidationError('Excel roster contains validation errors');
      (err as any).details = parseResult.errors;
      throw err;
    }

    if (parseResult.validCandidates.length === 0) {
      throw new ValidationError('Workbook contains no valid candidate rows');
    }

    // Check duplicate Aadhaar or Enrollment within uploaded rows
    const seenAadhaar = new Set<string>();
    const seenEnrollment = new Set<string>();
    for (const c of parseResult.validCandidates) {
      const aHash = this.hashAadhaar(c.aadhaar);
      if (seenAadhaar.has(aHash)) {
        throw new ConflictError(`Duplicate Aadhaar detected within batch roster for ${c.fullName}`);
      }
      seenAadhaar.add(aHash);

      if (seenEnrollment.has(c.enrollmentNumber)) {
        throw new ConflictError(`Duplicate Enrollment Number detected within batch roster: ${c.enrollmentNumber}`);
      }
      seenEnrollment.add(c.enrollmentNumber);
    }

    const candidateCount = parseResult.validCandidates.length;
    const qualityReviewRequired = candidateCount >= 100;

    // All-or-nothing transactional staging: clean existing candidates for current batch and insert new
    await prisma.$transaction(async (tx) => {
      await tx.candidate.deleteMany({
        where: { batchId: batch.id },
      });

      const candidateData = parseResult.validCandidates.map((c) => ({
        batchId: batch.id,
        batchVersion: batch.version,
        fullName: c.fullName,
        fatherName: c.fatherName,
        dob: c.dob,
        gender: c.gender,
        aadhaarHash: this.hashAadhaar(c.aadhaar),
        phone: c.phone,
        email: c.email,
        enrollmentNumber: c.enrollmentNumber,
        status: 'VALID' as const,
      }));

      await tx.candidate.createMany({
        data: candidateData,
      });

      await tx.batch.update({
        where: { id: batch.id },
        data: {
          candidateCount,
          qualityReviewRequired,
          qualityFlag: qualityReviewRequired,
          status: 'DRAFT',
        },
      });
    });

    await AuditService.logAction({
      actorId: trainingCentreId,
      actorRole: 'TRAINING_CENTRE',
      targetEntity: 'Batch',
      targetId: batch.id,
      actionType: 'ROSTER_UPLOADED',
      diffPayload: { candidateCount, qualityReviewRequired },
    });

    return { candidateCount, qualityReviewRequired };
  }

  public static async submitBatch(
    batchId: string,
    trainingCentreId: string
  ): Promise<any> {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundError('Batch not found');
    }

    if (batch.trainingCentreId !== trainingCentreId) {
      throw new ForbiddenError('Unauthorized: You do not own this batch');
    }

    if (batch.candidateCount === 0) {
      throw new ValidationError('Cannot submit an empty batch. Upload a candidate roster first.');
    }

    if (batch.status !== 'DRAFT' && batch.status !== 'NEEDS_REVISION') {
      throw new ConflictError(`Batch cannot be submitted in status: ${batch.status}`);
    }

    // 48-hour SLA deadline for District Review
    const stageDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const updatedBatch = await prisma.$transaction(async (tx) => {
      const updated = await tx.batch.update({
        where: { id: batch.id },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
          stageDeadline,
          isOverdue: false,
        },
        include: { district: true },
      });

      await createOutboxEvent(
        EVENT_TOPICS.BATCH_SUBMITTED,
        {
          batchId: updated.id,
          batchNumber: updated.batchNumber,
          districtId: updated.districtId,
          version: updated.version,
          candidateCount: updated.candidateCount,
          qualityReviewRequired: updated.qualityReviewRequired,
        },
        tx
      );

      return updated;
    });

    await AuditService.logAction({
      actorId: trainingCentreId,
      actorRole: 'TRAINING_CENTRE',
      targetEntity: 'Batch',
      targetId: batch.id,
      actionType: 'BATCH_SUBMITTED',
      diffPayload: { status: 'SUBMITTED', stageDeadline: stageDeadline.toISOString() },
    });

    return updatedBatch;
  }

  public static async getBatches(
    user: { userId: string; role: string; districtId?: string | null },
    query: PaginationQueryInput
  ): Promise<PaginatedResponse<any>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Role-based scoping
    if (user.role === 'TRAINING_CENTRE') {
      where.trainingCentreId = user.userId;
    } else if (user.role === 'DISTRICT_OFFICER' && user.districtId) {
      where.districtId = user.districtId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.districtId && user.role !== 'DISTRICT_OFFICER') {
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
            include: {
              approver: { select: { name: true, role: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
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

  public static async getBatchById(
    batchId: string,
    user: { userId: string; role: string; districtId?: string | null }
  ): Promise<any> {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        district: true,
        trainingCentre: { select: { id: true, name: true, email: true } },
        candidates: {
          select: {
            id: true,
            fullName: true,
            fatherName: true,
            dob: true,
            gender: true,
            phone: true,
            email: true,
            enrollmentNumber: true,
            status: true,
            createdAt: true,
          },
        },
        approvals: {
          include: {
            approver: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!batch) {
      throw new NotFoundError('Batch not found');
    }

    // Access authorization
    if (user.role === 'TRAINING_CENTRE' && batch.trainingCentreId !== user.userId) {
      throw new ForbiddenError('Unauthorized: Access restricted to owning training centre');
    }

    if (user.role === 'DISTRICT_OFFICER' && batch.districtId !== user.districtId) {
      throw new ForbiddenError('Unauthorized: Cross-district batch access denied');
    }

    return batch;
  }
}
