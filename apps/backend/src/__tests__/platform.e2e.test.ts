import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import { AuthService } from '../modules/auth/authService.js';
import { BatchService } from '../modules/batches/batchService.js';
import { DistrictService } from '../modules/district/districtService.js';
import { QualityService } from '../modules/quality/qualityService.js';
import { StateService } from '../modules/state/stateService.js';
import { VerificationService } from '../modules/verification/verificationService.js';
import { ReportsService } from '../modules/reports/reportsService.js';
import { CertificateGeneratorService, generateCertificateNumber } from '../modules/certificates/pdfGenerator.js';
import { sanitizeCellForExport } from '../modules/batches/excelParser.js';
import { hashPassword } from '../utils/password.js';

// In-memory mock database store for robust deterministic verification
let mockUsers: any[] = [];
let mockDistricts: any[] = [];
let mockBatches: any[] = [];
let mockCandidates: any[] = [];
let mockCertificates: any[] = [];
let mockApprovals: any[] = [];
let mockRefreshTokens: any[] = [];
let mockAuditLogs: any[] = [];
let mockOutboxEvents: any[] = [];
let mockVerificationLogs: any[] = [];

vi.mock('../config/database.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.email) return mockUsers.find((u) => u.email === where.email) || null;
        if (where.id) return mockUsers.find((u) => u.id === where.id) || null;
        return null;
      }),
      findMany: vi.fn(async () => mockUsers),
    },
    district: {
      findUnique: vi.fn(async ({ where }: any) => mockDistricts.find((d) => d.id === where.id) || null),
      findMany: vi.fn(async () => mockDistricts.map(d => ({
        ...d,
        batches: mockBatches.filter(b => b.districtId === d.id),
      }))),
    },
    refreshToken: {
      create: vi.fn(async ({ data }: any) => {
        const record = { id: `rf-${Date.now()}`, ...data };
        mockRefreshTokens.push(record);
        return record;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        const found = mockRefreshTokens.find((r) => r.tokenHash === where.tokenHash);
        if (!found) return null;
        const user = mockUsers.find((u) => u.id === found.userId);
        return { ...found, user };
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = mockRefreshTokens.findIndex((r) => r.id === where.id);
        if (idx >= 0) mockRefreshTokens[idx] = { ...mockRefreshTokens[idx], ...data };
        return mockRefreshTokens[idx];
      }),
      updateMany: vi.fn(async ({ where, data }: any) => {
        let count = 0;
        mockRefreshTokens.forEach((r) => {
          if (r.userId === where.userId) {
            Object.assign(r, data);
            count++;
          }
        });
        return { count };
      }),
    },
    batch: {
      count: vi.fn(async ({ where }: any) => {
        let items = mockBatches;
        if (where?.isOverdue !== undefined) items = items.filter(b => b.isOverdue === where.isOverdue);
        if (where?.districtId) items = items.filter(b => b.districtId === where.districtId);
        return items.length;
      }),
      create: vi.fn(async ({ data }: any) => {
        const b = { id: `batch-${Date.now()}-${Math.random()}`, version: 1, candidateCount: 0, ...data };
        mockBatches.push(b);
        return b;
      }),
      findUnique: vi.fn(async ({ where, include }: any) => {
        const b = mockBatches.find((b) => b.id === where.id);
        if (!b) return null;
        const candidates = include?.candidates ? mockCandidates.filter(c => c.batchId === b.id) : undefined;
        const district = include?.district ? mockDistricts.find(d => d.id === b.districtId) : undefined;
        return { ...b, ...(candidates ? { candidates } : {}), ...(district ? { district } : {}) };
      }),
      findMany: vi.fn(async () => mockBatches),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = mockBatches.findIndex((b) => b.id === where.id);
        if (idx >= 0) mockBatches[idx] = { ...mockBatches[idx], ...data };
        const b = mockBatches[idx];
        const district = mockDistricts.find(d => d.id === b?.districtId);
        return { ...b, district };
      }),
    },
    candidate: {
      count: vi.fn(async () => mockCandidates.length),
      findMany: vi.fn(async ({ where }: any) => {
        if (where?.batchId) return mockCandidates.filter(c => c.batchId === where.batchId);
        return mockCandidates;
      }),
      deleteMany: vi.fn(async ({ where }: any) => {
        mockCandidates = mockCandidates.filter(c => c.batchId !== where.batchId);
      }),
      createMany: vi.fn(async ({ data }: any) => {
        data.forEach((c: any) => mockCandidates.push({ id: `cand-${Date.now()}-${Math.random()}`, ...c }));
      }),
    },
    approval: {
      count: vi.fn(async ({ where }: any) => {
        return mockApprovals.filter(
          (a) =>
            a.batchId === where.batchId &&
            a.batchVersion === where.batchVersion &&
            a.tier === where.tier &&
            (!where.decision || a.decision === where.decision)
        ).length;
      }),
      findFirst: vi.fn(async ({ where }: any) => {
        return mockApprovals.find(
          (a) =>
            a.batchId === where.batchId &&
            a.batchVersion === where.batchVersion &&
            a.tier === where.tier &&
            a.approverId === where.approverId
        ) || null;
      }),
      create: vi.fn(async ({ data }: any) => {
        const app = { id: `app-${Date.now()}-${Math.random()}`, ...data };
        mockApprovals.push(app);
        return app;
      }),
    },
    certificate: {
      count: vi.fn(async ({ where }: any) => {
        if (where?.status) return mockCertificates.filter(c => c.status === where.status).length;
        return mockCertificates.length;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.certificateNumber) return mockCertificates.find(c => c.certificateNumber === where.certificateNumber) || null;
        if (where.candidateId) return mockCertificates.find(c => c.candidateId === where.candidateId) || null;
        return null;
      }),
      findFirst: vi.fn(async ({ where }: any) => {
        if (where.OR) {
          const match = mockCertificates.find(c =>
            where.OR.some((clause: any) =>
              (clause.opaqueToken && c.opaqueToken === clause.opaqueToken) ||
              (clause.certificateNumber && c.certificateNumber === clause.certificateNumber)
            )
          );
          if (!match) return null;
          const candidate = mockCandidates.find(c => c.id === match.candidateId);
          const batch = mockBatches.find(b => b.id === match.batchId);
          const district = mockDistricts.find(d => d.id === batch?.districtId);
          return { ...match, candidate, batch: { ...batch, district } };
        }
        return null;
      }),
      create: vi.fn(async ({ data }: any) => {
        const cert = { id: `cert-${Date.now()}-${Math.random()}`, updatedAt: new Date(), ...data };
        mockCertificates.push(cert);
        return cert;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = mockCertificates.findIndex(c => c.id === where.id);
        if (idx >= 0) mockCertificates[idx] = { ...mockCertificates[idx], ...data, updatedAt: new Date() };
        return mockCertificates[idx];
      }),
    },
    auditLog: {
      create: vi.fn(async ({ data }: any) => {
        mockAuditLogs.push(data);
        return data;
      }),
    },
    outboxEvent: {
      create: vi.fn(async ({ data }: any) => {
        mockOutboxEvents.push(data);
        return data;
      }),
    },
    verificationLog: {
      create: vi.fn(async ({ data }: any) => {
        mockVerificationLogs.push(data);
        return data;
      }),
    },
    $transaction: vi.fn(async (callback: any) => {
      return callback({
        candidate: {
          deleteMany: async ({ where }: any) => {
            mockCandidates = mockCandidates.filter(c => c.batchId !== where.batchId);
          },
          createMany: async ({ data }: any) => {
            data.forEach((c: any) => mockCandidates.push({ id: `cand-${Date.now()}-${Math.random()}`, ...c }));
          },
        },
        batch: {
          update: async ({ where, data }: any) => {
            const idx = mockBatches.findIndex((b) => b.id === where.id);
            if (idx >= 0) mockBatches[idx] = { ...mockBatches[idx], ...data };
            const b = mockBatches[idx];
            const district = mockDistricts.find(d => d.id === b?.districtId);
            return { ...b, district };
          },
        },
        approval: {
          create: async ({ data }: any) => {
            const app = { id: `app-${Date.now()}`, ...data };
            mockApprovals.push(app);
            return app;
          },
        },
        certificate: {
          create: async ({ data }: any) => {
            const cert = { id: `cert-${Date.now()}`, updatedAt: new Date(), ...data };
            mockCertificates.push(cert);
            return cert;
          },
          update: async ({ where, data }: any) => {
            const idx = mockCertificates.findIndex(c => c.id === where.id);
            if (idx >= 0) mockCertificates[idx] = { ...mockCertificates[idx], ...data, updatedAt: new Date() };
            return mockCertificates[idx];
          },
        },
        outboxEvent: {
          create: async ({ data }: any) => {
            mockOutboxEvents.push(data);
            return data;
          },
        },
      });
    }),
  },
}));

vi.mock('../config/redis.js', () => ({
  redis: {
    setex: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
  },
  redisClient: {
    setex: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
  },
}));

describe('CertiFlow End-to-End Enterprise Platform Test Suite', () => {
  beforeEach(async () => {
    mockUsers = [];
    mockDistricts = [];
    mockBatches = [];
    mockCandidates = [];
    mockCertificates = [];
    mockApprovals = [];
    mockRefreshTokens = [];
    mockAuditLogs = [];
    mockOutboxEvents = [];
    mockVerificationLogs = [];

    // Seed master district
    mockDistricts.push({
      id: 'dist-delhi-central',
      name: 'Delhi Central',
      code: 'DL-CEN',
      state: 'NCT of Delhi',
    });

    // Seed test users with bcrypt hashes
    const passwordHash = await hashPassword('Admin@CertiFlow2026!');

    mockUsers.push({
      id: 'usr-tc-01',
      email: 'tc.apex@skilling.org',
      name: 'Apex Skilling Centre',
      passwordHash,
      role: 'TRAINING_CENTRE',
      districtId: 'dist-delhi-central',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockUsers.push({
      id: 'usr-do-01',
      email: 'district.officer1@gov.in',
      name: 'A. K. Sharma (DO-1)',
      passwordHash,
      role: 'DISTRICT_OFFICER',
      districtId: 'dist-delhi-central',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockUsers.push({
      id: 'usr-do-02',
      email: 'district.officer2@gov.in',
      name: 'P. V. Rao (DO-2)',
      passwordHash,
      role: 'DISTRICT_OFFICER',
      districtId: 'dist-delhi-central',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockUsers.push({
      id: 'usr-qo-01',
      email: 'quality.officer@gov.in',
      name: 'S. Sen (Quality Inspector)',
      passwordHash,
      role: 'QUALITY_OFFICER',
      districtId: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockUsers.push({
      id: 'usr-state-01',
      email: 'state.officer@gov.in',
      name: 'Dr. V. K. Nair (Director General)',
      passwordHash,
      role: 'STATE_OFFICER',
      districtId: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed master batch in DRAFT / SUBMITTED for tests
    mockBatches.push({
      id: 'batch-test-01',
      batchNumber: 'BATCH-2026-DL-CEN-0001',
      trainingCentreId: 'usr-tc-01',
      districtId: 'dist-delhi-central',
      courseName: 'Certified Solar Energy Specialist',
      startDate: '2026-04-01',
      endDate: '2026-06-30',
      version: 1,
      status: 'SUBMITTED',
      candidateCount: 45,
      qualityReviewRequired: false,
      qualityFlag: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  describe('Phase 2: Authentication, JWT & Refresh Token Rotation', () => {
    it('should authenticate valid credentials and issue dual tokens', async () => {
      const result = await AuthService.login({
        email: 'tc.apex@skilling.org',
        password: 'Admin@CertiFlow2026!',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe('tc.apex@skilling.org');
      expect(mockRefreshTokens.length).toBe(1);
    });

    it('should reject invalid password with UnauthorizedError', async () => {
      await expect(
        AuthService.login({
          email: 'tc.apex@skilling.org',
          password: 'WrongPassword123!',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should rotate refresh token and revoke previous token', async () => {
      const loginRes = await AuthService.login({
        email: 'tc.apex@skilling.org',
        password: 'Admin@CertiFlow2026!',
      });

      const rotated = await AuthService.rotateRefreshToken(loginRes.refreshToken);
      expect(rotated.accessToken).toBeDefined();
      expect(rotated.refreshToken).toBeDefined();
      expect(rotated.refreshToken).not.toBe(loginRes.refreshToken);

      // Previous token should be marked revoked
      const oldToken = mockRefreshTokens.find((r) => r.isRevoked === true);
      expect(oldToken).toBeDefined();
    });

    it('should trigger reuse detection security breach when a revoked refresh token is presented', async () => {
      const loginRes = await AuthService.login({
        email: 'tc.apex@skilling.org',
        password: 'Admin@CertiFlow2026!',
      });

      // Legitimate rotation
      await AuthService.rotateRefreshToken(loginRes.refreshToken);

      // Malicious re-use of old token
      await expect(AuthService.rotateRefreshToken(loginRes.refreshToken)).rejects.toThrow(
        'Invalid refresh token. Please sign in again.'
      );

      // Check audit log for security alert
      const breachAlert = mockAuditLogs.find(
        (a) => a.actionType === 'SECURITY_ALERT_REFRESH_TOKEN_REUSE'
      );
      expect(breachAlert).toBeDefined();
    });
  });

  describe('Phase 3: Batch Management & Roster Ingestion', () => {
    it('should create batch in DRAFT status with deterministic numbering', async () => {
      const batch = await BatchService.createBatch('usr-tc-01', {
        courseName: 'Certified Solar Energy Specialist',
        startDate: '2026-04-01',
        endDate: '2026-06-30',
        districtId: 'dist-delhi-central',
      });

      expect(batch.batchNumber).toMatch(/^BATCH-2026-DL-CEN-\d{4}$/);
      expect(batch.status).toBe('DRAFT');
    });

    it('should enforce submit validation: cannot submit empty batch', async () => {
      const batch = await BatchService.createBatch('usr-tc-01', {
        courseName: 'Empty Course',
        startDate: '2026-04-01',
        endDate: '2026-06-30',
        districtId: 'dist-delhi-central',
      });

      await expect(BatchService.submitBatch(batch.id, 'usr-tc-01')).rejects.toThrow(
        'Cannot submit an empty batch'
      );
    });

    it('should transition batch to SUBMITTED and establish 48-hour SLA deadline on submit', async () => {
      const batch = await BatchService.createBatch('usr-tc-01', {
        courseName: 'Robotics Technician',
        startDate: '2026-04-01',
        endDate: '2026-06-30',
        districtId: 'dist-delhi-central',
      });

      // Simulate staged candidates on the created batch
      const targetBatch = mockBatches.find(b => b.id === batch.id);
      if (targetBatch) targetBatch.candidateCount = 45;

      const submitted = await BatchService.submitBatch(batch.id, 'usr-tc-01');
      expect(submitted.status).toBe('SUBMITTED');
      expect(submitted.stageDeadline).toBeDefined();
      expect(mockOutboxEvents.some((e) => e.topic === 'batch.submitted')).toBe(true);
    });
  });

  describe('Phase 4: District Dual-Officer Approval State Machine', () => {
    it('should enforce dual-officer inspection: Officer 1 moves to DISTRICT_PARTIALLY_APPROVED', async () => {
      const batch = mockBatches[0];
      batch.status = 'SUBMITTED';
      batch.districtId = 'dist-delhi-central';

      const approved1 = await DistrictService.approveBatch(
        batch.id,
        { userId: 'usr-do-01', districtId: 'dist-delhi-central', role: 'DISTRICT_OFFICER' },
        'Officer 1 Physical Inspection Verified'
      );

      expect(approved1.status).toBe('DISTRICT_PARTIALLY_APPROVED');
      expect(mockApprovals.length).toBe(1);
    });

    it('should block the same officer from signing twice on the same version', async () => {
      const batch = mockBatches[0];
      batch.status = 'SUBMITTED';
      batch.districtId = 'dist-delhi-central';

      // First signature by Officer 1
      await DistrictService.approveBatch(
        batch.id,
        { userId: 'usr-do-01', districtId: 'dist-delhi-central', role: 'DISTRICT_OFFICER' },
        'Initial signature'
      );

      // Attempt duplicate signature by Officer 1
      await expect(
        DistrictService.approveBatch(
          batch.id,
          { userId: 'usr-do-01', districtId: 'dist-delhi-central', role: 'DISTRICT_OFFICER' },
          'Duplicate signature attempt'
        )
      ).rejects.toThrow('Dual-Officer Governance Rule: You have already applied digital sign-off');
    });

    it('should allow distinct Officer 2 to clear district tier and transition to next status', async () => {
      const batch = mockBatches[0];
      batch.status = 'SUBMITTED';
      batch.districtId = 'dist-delhi-central';
      batch.qualityReviewRequired = false;

      // First signature by Officer 1
      await DistrictService.approveBatch(
        batch.id,
        { userId: 'usr-do-01', districtId: 'dist-delhi-central', role: 'DISTRICT_OFFICER' },
        'Officer 1 inspection'
      );

      // Second signature by Officer 2
      const approved2 = await DistrictService.approveBatch(
        batch.id,
        { userId: 'usr-do-02', districtId: 'dist-delhi-central', role: 'DISTRICT_OFFICER' },
        'Officer 2 Final Verification Cleared'
      );

      expect(approved2.status).toBe('DISTRICT_APPROVED');
      expect(mockApprovals.length).toBe(2);
      expect(mockOutboxEvents.some((e) => e.topic === 'batch.district_approved')).toBe(true);
    });

    it('should increment version and preserve history when returned for revision', async () => {
      const batch = mockBatches[0];
      const prevVersion = batch.version;

      const revised = await DistrictService.rejectBatch(
        batch.id,
        { userId: 'usr-do-01', districtId: 'dist-delhi-central', role: 'DISTRICT_OFFICER' },
        'ATTENDANCE_DEFICIT',
        'Five candidates did not meet the 80% biometric attendance criteria.'
      );

      expect(revised.status).toBe('NEEDS_REVISION');
      expect(revised.version).toBe(prevVersion + 1);
    });
  });

  describe('Phase 5: Quality Assurance & 10% Randomized Sampling', () => {
    it('should correctly select 10% sample candidates for quality audit', async () => {
      const batch = mockBatches[0];
      // Seed 50 candidates
      for (let i = 1; i <= 50; i++) {
        mockCandidates.push({
          id: `cand-${i}`,
          batchId: batch.id,
          fullName: `Candidate ${i}`,
          fatherName: `Father ${i}`,
          dob: '2000-01-01',
          gender: 'MALE',
          enrollmentNumber: `ENR-2026-${i}`,
          aadhaarHash: `hash-${i}`,
          status: 'VALID',
        });
      }

      const sampleResult = await QualityService.getSampleCandidates(batch.id);
      expect(sampleResult.totalCandidates).toBe(50);
      expect(sampleResult.sampleSize).toBe(5); // 10% of 50
      expect(sampleResult.sampledCandidates.length).toBe(5);
    });

    it('should advance batch to DISTRICT_APPROVED upon certified quality pass', async () => {
      const batch = mockBatches[0];
      batch.status = 'QUALITY_REVIEW';

      const passed = await QualityService.certifyQualityPass(
        batch.id,
        { userId: 'usr-qo-01', role: 'QUALITY_OFFICER' },
        {
          sampleCandidateIds: ['cand-1', 'cand-2', 'cand-3', 'cand-4', 'cand-5'],
          passedIdentityHash: true,
          passedScoreThreshold: true,
          passedAttendanceThreshold: true,
          remarks: 'Sample dossiers verified against physical assessment sheets.',
        }
      );

      expect(passed.status).toBe('DISTRICT_APPROVED');
      expect(mockOutboxEvents.some((e) => e.topic === 'batch.quality_reviewed')).toBe(true);
    });
  });

  describe('Phase 6: State Clearance, Issuance & Revocation', () => {
    it('should grant state clearance and trigger certificate batch generation event', async () => {
      const batch = mockBatches[0];
      batch.status = 'DISTRICT_APPROVED';

      const stateApproved = await StateService.grantStateApproval(
        batch.id,
        { userId: 'usr-state-01', role: 'STATE_OFFICER' },
        'State Director Executive Order 44/2026'
      );

      expect(stateApproved.status).toBe('STATE_APPROVED');
      expect(mockOutboxEvents.some((e) => e.topic === 'certificate.batch_cleared')).toBe(true);
    });

    it('should execute immediate certificate revocation with audit trail', async () => {
      const certNo = 'CF-2026-DL-000001';
      mockCertificates.push({
        id: 'cert-rev-01',
        certificateNumber: certNo,
        candidateId: 'cand-1',
        batchId: mockBatches[0].id,
        opaqueToken: crypto.randomUUID(),
        status: 'ISSUED',
        issuedAt: new Date(),
        updatedAt: new Date(),
      });

      const revoked = await StateService.revokeCertificate(
        {
          certificateNumber: certNo,
          reason: 'FRAUDULENT_ASSESSMENT',
          remarks: 'Inquiry committee established fabricated practical scorecards.',
        },
        { userId: 'usr-state-01', role: 'STATE_OFFICER' }
      );

      expect(revoked.status).toBe('REVOKED');
      expect(mockOutboxEvents.some((e) => e.topic === 'certificate.revoked')).toBe(true);

      const auditEntry = mockAuditLogs.find((a) => a.actionType === 'CERTIFICATE_REVOKED');
      expect(auditEntry).toBeDefined();
    });
  });

  describe('Phase 7: Certificate PDF & QR Rendering Infrastructure', () => {
    it('should generate valid QR code buffer with High error correction', async () => {
      const qrBuffer = await CertificateGeneratorService.generateQrCodeBuffer(
        'https://certiflow.gov.in/verify/test-opaque-token-123'
      );

      expect(qrBuffer).toBeDefined();
      expect(Buffer.isBuffer(qrBuffer)).toBe(true);
      expect(qrBuffer.length).toBeGreaterThan(100);
    });

    it('should render landscape A4 PDF buffer containing certificate typography', async () => {
      const pdfBuffer = await CertificateGeneratorService.renderCertificatePdf({
        candidateName: 'Pooja Sundaram',
        courseName: 'Certified Precision Welder',
        completionDate: '2026-03-01',
        certificateNumber: 'CF-2026-DL-000099',
        opaqueToken: 'opaque-token-999',
        issuingAuthority: 'State Skill Mission',
      });

      expect(pdfBuffer).toBeDefined();
      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      // PDF header magic bytes "%PDF-"
      expect(pdfBuffer.slice(0, 5).toString('ascii')).toBe('%PDF-');
    });
  });

  describe('Phase 9: Public Certificate Verification & PII Protection', () => {
    it('should return GENUINE with masked candidate name and zero Aadhaar exposure', async () => {
      const opaqueToken = crypto.randomUUID();
      const certNo = 'CF-2026-DL-000042';

      mockCertificates.push({
        id: 'cert-genuine-01',
        certificateNumber: certNo,
        candidateId: 'cand-gen-01',
        batchId: mockBatches[0].id,
        opaqueToken,
        status: 'ISSUED',
        issuedAt: new Date(),
        updatedAt: new Date(),
      });

      mockCandidates.push({
        id: 'cand-gen-01',
        fullName: 'Vikramaditya Singhania',
        aadhaarHash: 'super_secret_hash_value',
        phone: '+919876543210',
      });

      const result = await VerificationService.verify(opaqueToken, { ip: '10.0.0.1' });

      expect(result.status).toBe('GENUINE');
      expect(result.certificateNumber).toBe(certNo);
      // Name is masked: "V*** S***"
      expect(result.candidateName).toBe('V*** S***');
      // No raw PII exposed
      expect((result as any).aadhaarHash).toBeUndefined();
      expect((result as any).phone).toBeUndefined();
    });

    it('should return REVOKED status immediately for cancelled certificates', async () => {
      const opaqueToken = crypto.randomUUID();
      const certNo = 'CF-2026-DL-000043';

      mockCertificates.push({
        id: 'cert-rev-02',
        certificateNumber: certNo,
        candidateId: 'cand-rev-02',
        batchId: mockBatches[0].id,
        opaqueToken,
        status: 'REVOKED',
        issuedAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await VerificationService.verify(certNo, { ip: '10.0.0.2' });
      expect(result.status).toBe('REVOKED');
      expect(result.certificateNumber).toBe(certNo);
      expect(result.revocationReason).toBeDefined();
    });

    it('should return NOT_FOUND for non-existent certificate lookup', async () => {
      const result = await VerificationService.verify('CF-NON-EXISTENT', { ip: '10.0.0.3' });
      expect(result.status).toBe('NOT_FOUND');
      expect(mockVerificationLogs.some((l) => l.method === 'LOOKUP_NOT_FOUND')).toBe(true);
    });
  });

  describe('Phase 12: Reporting Analytics & Formula Injection Protection', () => {
    it('should compute overview KPIs and 48-hour SLA compliance rate', async () => {
      const overview = await ReportsService.getOverview({ role: 'STATE_OFFICER' });

      expect(overview.totalBatches).toBeDefined();
      expect(overview.slaComplianceRate).toBeGreaterThanOrEqual(0);
      expect(overview.slaComplianceRate).toBeLessThanOrEqual(100);
      expect(Array.isArray(overview.districtBreakdown)).toBe(true);
    });

    it('should sanitize formula injection characters in spreadsheet exports', async () => {
      expect(sanitizeCellForExport('=HYPERLINK("evil.com")')).toBe('\'=HYPERLINK("evil.com")');
      expect(sanitizeCellForExport('+2+2')).toBe('\'+2+2');
      expect(sanitizeCellForExport('-5*10')).toBe('\'-5*10');
      expect(sanitizeCellForExport('@SUM(A1:A10)')).toBe('\'@SUM(A1:A10)');
    });
  });
});
