export type Role =
  | 'TRAINING_CENTRE'
  | 'DISTRICT_OFFICER'
  | 'QUALITY_OFFICER'
  | 'STATE_OFFICER'
  | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  districtId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface District {
  id: string;
  name: string;
  code: string;
  state: string;
}

export type BatchStatus =
  | 'DRAFT'
  | 'VALIDATING'
  | 'NEEDS_REVISION'
  | 'SUBMITTED'
  | 'DISTRICT_PARTIALLY_APPROVED'
  | 'DISTRICT_APPROVED'
  | 'QUALITY_REVIEW'
  | 'STATE_APPROVED'
  | 'REJECTED'
  | 'CERTIFICATES_ISSUED';

export interface Batch {
  id: string;
  batchNumber: string;
  trainingCentreId: string;
  trainingCentre?: {
    name: string;
    email: string;
  };
  districtId: string;
  district?: District;
  courseName: string;
  startDate: string;
  endDate: string;
  version: number;
  status: BatchStatus;
  candidateCount: number;
  qualityFlag?: boolean;
  qualityReviewRequired?: boolean;
  stageDeadline?: string | null;
  isOverdue?: boolean;
  submittedAt?: string | null;
  stateApprovedAt?: string | null;
  stateApproverId?: string | null;
  createdAt: string;
  updatedAt: string;
  approvals?: Approval[];
}

export type CandidateStatus = 'VALID' | 'INVALID' | 'PROCESSED';

export interface Candidate {
  id: string;
  batchId: string;
  batchVersion: number;
  fullName: string;
  fatherName: string;
  dob: string;
  gender: string;
  aadhaarHash: string;
  phone: string;
  email: string;
  enrollmentNumber: string;
  status: CandidateStatus;
  validationErrors?: Record<string, string[]> | null;
  createdAt: string;
  certificate?: Certificate | null;
}

export type CertificateStatus = 'ISSUED' | 'REVOKED' | 'SUSPENDED';

export type RevocationReason =
  | 'FRAUDULENT_ASSESSMENT'
  | 'DUPLICATE_ISSUANCE'
  | 'IDENTITY_MISMATCH'
  | 'ATTENDANCE_SHORTFALL'
  | 'ADMINISTRATIVE_ERROR';

export interface Certificate {
  id: string;
  certificateNumber: string;
  candidateId: string;
  candidate?: Candidate;
  batchId: string;
  batch?: Batch;
  opaqueToken: string;
  qrCodeDataUrl?: string;
  pdfStorageKey?: string;
  pdfUrl?: string;
  issuedAt: string;
  status: CertificateStatus;
}

export interface PublicVerificationResult {
  status: 'GENUINE' | 'REVOKED' | 'NOT_FOUND';
  certificateNumber?: string;
  candidateName?: string;
  courseName?: string;
  completionDate?: string;
  issuingAuthority?: string;
  issuedAt?: string;
  revocationDate?: string;
  revocationReason?: string;
}

export type ApprovalTier = 'DISTRICT' | 'QUALITY' | 'STATE';
export type ApprovalDecision = 'APPROVED' | 'REJECTED';

export interface Approval {
  id: string;
  batchId: string;
  batchVersion: number;
  tier: ApprovalTier;
  approverId: string;
  approver?: {
    name: string;
    role: Role;
  };
  decision: ApprovalDecision;
  remarks?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  targetEntity: string;
  targetId: string;
  actionType: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  diffPayload?: Record<string, unknown> | null;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  recipientPhone: string;
  certificateId: string;
  channel: 'WHATSAPP' | 'EMAIL';
  templateName: string;
  providerMessageId?: string | null;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  sentAt?: string | null;
  deliveredAt?: string | null;
  errorMessage?: string | null;
  createdAt: string;
}

export interface ReportingOverview {
  totalBatches: number;
  totalCandidates: number;
  totalCertificatesIssued: number;
  totalCertificatesRevoked: number;
  slaComplianceRate: number;
  activeBatchesCount: number;
  districtBreakdown: Array<{
    districtId: string;
    districtName: string;
    batchCount: number;
    candidateCount: number;
    issuedCount: number;
  }>;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  expiresIn: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
