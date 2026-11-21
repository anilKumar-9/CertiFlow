import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  candidateRowSchema,
  rejectionSchema,
  verifyCertificateQuerySchema,
  DESIGN_TOKENS,
  ROLES,
  QUEUE_NAMES,
} from './index.js';

describe('@certiflow/shared Validation & Constants', () => {
  it('validates correct login payload', () => {
    const valid = loginSchema.safeParse({
      email: 'officer@gov.in',
      password: 'StrongPassword123!',
    });
    expect(valid.success).toBe(true);
  });

  it('rejects invalid email or short password', () => {
    const invalid = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'short',
    });
    expect(invalid.success).toBe(false);
  });

  it('validates candidate row data format', () => {
    const candidate = candidateRowSchema.safeParse({
      fullName: 'Rahul Sharma',
      fatherName: 'Suresh Sharma',
      dob: '2001-05-15',
      gender: 'MALE',
      aadhaar: '123456789012',
      phone: '+919876543210',
      email: 'rahul@example.com',
      enrollmentNumber: 'ENR-2026-001',
    });
    expect(candidate.success).toBe(true);
  });

  it('enforces detailed remarks on rejection', () => {
    const shortRemarks = rejectionSchema.safeParse({
      decision: 'REJECTED',
      reasonCode: 'INCOMPLETE_DOCS',
      remarks: 'Too short',
    });
    expect(shortRemarks.success).toBe(false);

    const validRejection = rejectionSchema.safeParse({
      decision: 'REJECTED',
      reasonCode: 'INCOMPLETE_DOCS',
      remarks: 'Candidate roster missing mandatory father name columns for row 4 to 12.',
    });
    expect(validRejection.success).toBe(true);
  });

  it('verifies public query schema requires token or certNumber', () => {
    expect(verifyCertificateQuerySchema.safeParse({}).success).toBe(false);
    expect(
      verifyCertificateQuerySchema.safeParse({
        token: '123e4567-e89b-12d3-a456-426614174000',
      }).success
    ).toBe(true);
  });

  it('exports centralized design tokens with accessible contrast constraints', () => {
    expect(DESIGN_TOKENS.colors.navy).toBe('#163A5F');
    expect(DESIGN_TOKENS.colors.blue).toBe('#245B85');
    expect(DESIGN_TOKENS.colors.gold).toBe('#C49A3A');
    expect(DESIGN_TOKENS.contrastRules.goldTextOnLightAllowed).toBe(false);
    expect(ROLES.TRAINING_CENTRE).toBe('TRAINING_CENTRE');
    expect(QUEUE_NAMES.EXCEL_PROCESSING).toBe('excel-processing');
  });
});
