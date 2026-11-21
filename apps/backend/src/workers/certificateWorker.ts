import crypto from 'crypto';
import { Job } from 'bullmq';
import { prisma } from '../config/database.js';
import { createOutboxEvent } from '../events/outbox.js';
import { CertificateGeneratorService, generateCertificateNumber } from '../modules/certificates/pdfGenerator.js';
import { SseManager } from '../modules/events/sseManager.js';
import { EVENT_TOPICS } from '@certiflow/shared';

export interface CertificateJobData {
  batchId: string;
  batchNumber: string;
  districtCode: string;
  candidateCount: number;
}

export async function processCertificateGeneration(job: Job<CertificateJobData>): Promise<void> {
  const { batchId, districtCode } = job.data;
  console.log(`[CertificateWorker] Starting issuance for batch ${batchId}`);

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      candidates: { where: { status: 'VALID' } },
      district: true,
    },
  });

  if (!batch) {
    console.warn(`[CertificateWorker] Batch ${batchId} not found`);
    return;
  }

  const currentYear = new Date().getFullYear();
  let sequenceStart = await prisma.certificate.count();

  for (let i = 0; i < batch.candidates.length; i++) {
    const candidate = batch.candidates[i];

    // Idempotency: skip already issued certificate
    const existing = await prisma.certificate.findUnique({
      where: { candidateId: candidate.id },
    });

    if (existing) {
      console.log(`[CertificateWorker] Certificate already exists for candidate ${candidate.id}, skipping`);
      continue;
    }

    sequenceStart++;
    const certNumber = generateCertificateNumber(currentYear, districtCode || 'DL', sequenceStart);
    const opaqueToken = crypto.randomUUID();
    const verificationUrl = `https://certiflow.gov.in/verify/${opaqueToken}`;

    // Generate QR code and PDF
    const qrBuffer = await CertificateGeneratorService.generateQrCodeBuffer(verificationUrl);
    const qrCodeDataUrl = `data:image/png;base64,${qrBuffer.toString('base64')}`;

    const pdfBuffer = await CertificateGeneratorService.renderCertificatePdf({
      candidateName: candidate.fullName,
      courseName: batch.courseName,
      completionDate: batch.endDate,
      certificateNumber: certNumber,
      opaqueToken,
      issuingAuthority: `State Skill Development Mission (${batch.district?.state || 'State Government'})`,
    });

    await prisma.$transaction(async (tx) => {
      const cert = await tx.certificate.create({
        data: {
          certificateNumber: certNumber,
          candidateId: candidate.id,
          batchId: batch.id,
          opaqueToken,
          qrCodeDataUrl,
          pdfStorageKey: `certificates/${certNumber}.pdf`,
          status: 'ISSUED',
        },
      });

      // Emit outbox event for WhatsApp notification
      await createOutboxEvent(
        EVENT_TOPICS.CERTIFICATE_ISSUED,
        {
          certificateId: cert.id,
          candidateId: candidate.id,
          fullName: candidate.fullName,
          phone: candidate.phone,
          certificateNumber: cert.certificateNumber,
          verificationUrl,
          courseName: batch.courseName,
        },
        tx
      );
    });
  }

  // Update batch governance status to CERTIFICATES_ISSUED
  await prisma.batch.update({
    where: { id: batch.id },
    data: { status: 'CERTIFICATES_ISSUED' },
  });

  // Real-time broadcast to connected UI clients
  SseManager.broadcast('BATCH_UPDATED', {
    batchId: batch.id,
    status: 'CERTIFICATES_ISSUED',
    message: `All certificates generated and issued for ${batch.batchNumber}`,
  });

  console.log(`[CertificateWorker] Completed issuance for batch ${batch.batchNumber}`);
}
