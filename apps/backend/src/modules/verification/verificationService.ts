import crypto from 'crypto';
import { prisma } from '../../config/database.js';
import { PublicVerificationResult } from '@certiflow/shared';

export class VerificationService {
  private static hashIp(ip: string): string {
    return crypto.createHash('sha256').update(ip + '_certiflow_salt_2026').digest('hex');
  }

  private static maskName(fullName: string): string {
    return fullName
      .split(' ')
      .map((part) => (part.length > 1 ? part[0] + '***' : part))
      .join(' ');
  }

  public static async verify(
    identifier: string,
    metadata: { ip: string; userAgent?: string }
  ): Promise<PublicVerificationResult> {
    const ipHash = this.hashIp(metadata.ip || '127.0.0.1');

    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [{ opaqueToken: identifier }, { certificateNumber: identifier.toUpperCase() }],
      },
      include: {
        candidate: true,
        batch: { include: { district: true } },
      },
    });

    if (!cert) {
      // Log unauthenticated failed attempt
      try {
        await prisma.verificationLog.create({
          data: {
            ipHash,
            userAgent: metadata.userAgent || null,
            method: 'LOOKUP_NOT_FOUND',
          },
        });
      } catch (err) {
        console.warn('[VerificationLog Error]', err);
      }

      return { status: 'NOT_FOUND' };
    }

    // Log verification lookup
    try {
      await prisma.verificationLog.create({
        data: {
          certificateId: cert.id,
          ipHash,
          userAgent: metadata.userAgent || null,
          method: 'LOOKUP_SUCCESS',
        },
      });
    } catch (err) {
      console.warn('[VerificationLog Error]', err);
    }

    if (cert.status === 'REVOKED') {
      return {
        status: 'REVOKED',
        certificateNumber: cert.certificateNumber,
        revocationDate: cert.updatedAt.toISOString(),
        revocationReason: 'Revoked by State Directorate order due to audit irregularities',
      };
    }

    return {
      status: 'GENUINE',
      certificateNumber: cert.certificateNumber,
      candidateName: this.maskName(cert.candidate?.fullName || 'Authorized Candidate'),
      courseName: cert.batch?.courseName || 'Certified Skilling Program',
      completionDate: cert.batch?.endDate || '2026-03-01',
      issuingAuthority: `State Skill Development Mission (${cert.batch?.district?.state || 'State Government'})`,
      issuedAt: cert.issuedAt.toISOString(),
    };
  }
}
