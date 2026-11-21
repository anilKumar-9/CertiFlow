import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, verifyAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from '../utils/jwt.js';
import { sanitizeCellForExport } from '../modules/batches/excelParser.js';
import { generateCertificateNumber } from '../modules/certificates/pdfGenerator.js';
import { AppError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError } from '../middleware/errorHandler.js';

describe('Backend Security & Infrastructure Foundation', () => {
  describe('Password Hashing (bcrypt 12 rounds)', () => {
    it('should hash a password and produce a valid bcrypt hash with salt rounds >= 12', async () => {
      const password = 'GovSecurePassword@2026';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[aby]\$12\$/);

      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await comparePassword('WrongPassword123', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Dual-Token Security', () => {
    const payload: TokenPayload = {
      userId: 'usr-state-001',
      role: 'STATE_OFFICER',
      districtId: 'dist-01',
    };

    it('should sign and verify valid access tokens', () => {
      const token = generateAccessToken(payload);
      expect(token).toBeDefined();

      const decoded = verifyAccessToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.districtId).toBe(payload.districtId);
    });

    it('should sign and verify valid refresh tokens', () => {
      const refreshToken = generateRefreshToken(payload);
      expect(refreshToken).toBeDefined();

      const decoded = verifyRefreshToken(refreshToken);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe(payload.role);
    });
  });

  describe('Excel Formula Injection Defense (CSV/Excel Neutralization)', () => {
    it('should prepend a single quote to cells beginning with dangerous characters', () => {
      expect(sanitizeCellForExport('=CMD|"/C calc"!A0')).toBe('\'=CMD|"/C calc"!A0');
      expect(sanitizeCellForExport('+SUM(1+1)')).toBe('\'+SUM(1+1)');
      expect(sanitizeCellForExport('-20*5')).toBe('\'-20*5');
      expect(sanitizeCellForExport('@malicious_call()')).toBe('\'@malicious_call()');
    });

    it('should leave safe values unchanged', () => {
      expect(sanitizeCellForExport('Aadhaar Verified')).toBe('Aadhaar Verified');
      expect(sanitizeCellForExport(100)).toBe('100');
      expect(sanitizeCellForExport(null)).toBe('');
    });
  });

  describe('Certificate Number Determinism & Format', () => {
    it('should generate formatted certificate identifiers conforming to state numbering rules', () => {
      const currentYear = new Date().getFullYear();
      const certNo = generateCertificateNumber(currentYear, 'DL', 42);
      expect(certNo).toBe(`CF-${currentYear}-DL-000042`);
    });
  });

  describe('Standardized Error Envelopes', () => {
    it('should correctly initialize custom AppErrors with expected status codes', () => {
      const notFound = new NotFoundError('Batch roster not found');
      expect(notFound.statusCode).toBe(404);
      expect(notFound.isOperational).toBe(true);

      const unauthorized = new UnauthorizedError();
      expect(unauthorized.statusCode).toBe(401);
      expect(unauthorized.isOperational).toBe(true);

      const forbidden = new ForbiddenError();
      expect(forbidden.statusCode).toBe(403);
      expect(forbidden.isOperational).toBe(true);

      const conflict = new ConflictError('Aadhaar hash collision detected');
      expect(conflict.statusCode).toBe(409);
      expect(conflict.isOperational).toBe(true);
    });
  });
});
