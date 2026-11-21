import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createBatchSchema = z.object({
  courseName: z.string().min(2, 'Course name must be at least 2 characters').max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
  districtId: z.string().uuid('Invalid district identifier'),
});

export type CreateBatchInput = z.infer<typeof createBatchSchema>;

export const candidateRowSchema = z.object({
  fullName: z.string().min(2, 'Full name required').max(100),
  fatherName: z.string().min(2, 'Father name required').max(100),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  aadhaar: z.string().regex(/^\d{12}$/, 'Aadhaar must be a 12-digit number'),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email format'),
  enrollmentNumber: z.string().min(3, 'Enrollment number required').max(50),
});

export type CandidateRowInput = z.infer<typeof candidateRowSchema>;

export const approvalSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  remarks: z.string().max(500).optional(),
});

export type ApprovalInput = z.infer<typeof approvalSchema>;

export const rejectionSchema = z.object({
  decision: z.literal('REJECTED'),
  reasonCode: z.string().min(2, 'Reason code required').default('REVISION_REQUESTED'),
  remarks: z.string().min(10, 'Remarks must provide clear rejection details').max(1000),
});

export type RejectionInput = z.infer<typeof rejectionSchema>;

export const qualityAuditSchema = z.object({
  sampleCandidateIds: z.array(z.string().uuid()).min(1, 'At least one sampled candidate must be audited'),
  passedIdentityHash: z.boolean(),
  passedScoreThreshold: z.boolean(),
  passedAttendanceThreshold: z.boolean(),
  remarks: z.string().max(500).optional(),
});

export type QualityAuditInput = z.infer<typeof qualityAuditSchema>;

export const revokeCertificateSchema = z.object({
  certificateNumber: z.string().min(5, 'Certificate number is required'),
  reason: z.enum([
    'FRAUDULENT_ASSESSMENT',
    'DUPLICATE_ISSUANCE',
    'IDENTITY_MISMATCH',
    'ATTENDANCE_SHORTFALL',
    'ADMINISTRATIVE_ERROR',
  ]),
  remarks: z.string().min(10, 'Mandatory audit remarks describing revocation justification').max(1000),
});

export type RevokeCertificateInput = z.infer<typeof revokeCertificateSchema>;

export const verifyCertificateQuerySchema = z.object({
  token: z.string().uuid().optional(),
  certNumber: z.string().min(5).optional(),
}).refine(data => data.token || data.certNumber, {
  message: 'Either verification token or certificate number must be provided',
});

export type VerifyCertificateQueryInput = z.infer<typeof verifyCertificateQuerySchema>;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  status: z.string().optional(),
  districtId: z.string().uuid().optional(),
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;
