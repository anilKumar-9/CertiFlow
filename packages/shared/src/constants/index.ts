export const ROLES = {
  TRAINING_CENTRE: 'TRAINING_CENTRE',
  DISTRICT_OFFICER: 'DISTRICT_OFFICER',
  QUALITY_OFFICER: 'QUALITY_OFFICER',
  STATE_OFFICER: 'STATE_OFFICER',
  ADMIN: 'ADMIN',
} as const;

export const BATCH_STATUSES = {
  DRAFT: 'DRAFT',
  VALIDATING: 'VALIDATING',
  NEEDS_REVISION: 'NEEDS_REVISION',
  SUBMITTED: 'SUBMITTED',
  DISTRICT_PARTIALLY_APPROVED: 'DISTRICT_PARTIALLY_APPROVED',
  DISTRICT_APPROVED: 'DISTRICT_APPROVED',
  QUALITY_REVIEW: 'QUALITY_REVIEW',
  STATE_APPROVED: 'STATE_APPROVED',
  REJECTED: 'REJECTED',
  CERTIFICATES_ISSUED: 'CERTIFICATES_ISSUED',
} as const;

export const CERTIFICATE_STATUSES = {
  ISSUED: 'ISSUED',
  REVOKED: 'REVOKED',
  SUSPENDED: 'SUSPENDED',
} as const;

export const REVOCATION_REASONS = {
  FRAUDULENT_ASSESSMENT: 'FRAUDULENT_ASSESSMENT',
  DUPLICATE_ISSUANCE: 'DUPLICATE_ISSUANCE',
  IDENTITY_MISMATCH: 'IDENTITY_MISMATCH',
  ATTENDANCE_SHORTFALL: 'ATTENDANCE_SHORTFALL',
  ADMINISTRATIVE_ERROR: 'ADMINISTRATIVE_ERROR',
} as const;

export const QUEUE_NAMES = {
  EXCEL_PROCESSING: 'excel-processing',
  BATCH_VALIDATION: 'batch-validation',
  CERTIFICATE_GENERATION: 'certificate-generation',
  NOTIFICATIONS: 'notifications',
  SLA_REMINDERS: 'sla-reminders',
} as const;

export const EVENT_TOPICS = {
  BATCH_CREATED: 'batch.created',
  BATCH_SUBMITTED: 'batch.submitted',
  BATCH_DISTRICT_APPROVED: 'batch.district_approved',
  BATCH_QUALITY_REVIEWED: 'batch.quality_reviewed',
  BATCH_STATE_APPROVED: 'batch.state_approved',
  CERTIFICATE_BATCH_CLEARED: 'certificate.batch_cleared',
  CERTIFICATE_ISSUED: 'certificate.issued',
  CERTIFICATE_REVOKED: 'certificate.revoked',
  NOTIFICATION_DISPATCHED: 'notification.dispatched',
  SLA_BREACHED: 'sla.breached',
} as const;

export const DESIGN_TOKENS = {
  colors: {
    navy: '#163A5F',
    blue: '#245B85',
    gold: '#C49A3A',
    teal: '#0F766E',
    white: '#FFFFFF',
    background: '#F4F7FA',
    border: '#DCE3EA',
    text: '#172B3A',
  },
  contrastRules: {
    goldTextOnLightAllowed: false,
    accessibleGoldPairing: {
      background: '#163A5F',
      textOnGoldBadge: '#172B3A',
    },
  },
} as const;
