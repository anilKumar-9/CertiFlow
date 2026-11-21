import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../apps/backend/src/app';

// Mock database and redis pings for integration health test
vi.mock('../../apps/backend/src/config/database', () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
    $disconnect: vi.fn(),
    certificate: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
    verificationLog: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock('../../apps/backend/src/config/redis', () => ({
  redisClient: {
    ping: vi.fn().mockResolvedValue('PONG'),
    status: 'ready',
    on: vi.fn(),
  },
  checkRedisHealth: vi.fn().mockResolvedValue(true),
}));

describe('Integration Tests: /health & API Runtime', () => {
  it('GET /health should return 200 with service status, timestamp, and dependencies', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.version).toBe('1.0.0');
    expect(res.body.services.database).toBe('connected');
    expect(res.body.services.redis).toBe('connected');
    expect(res.body.timestamp).toBeDefined();
  });

  it('Response should include Helmet security headers', async () => {
    const res = await request(app).get('/health');

    expect(res.headers['x-dns-prefetch-control']).toBe('off');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('GET /api/v1/status should return 200 with active status', async () => {
    const res = await request(app).get('/api/v1/status');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('active');
    expect(res.body.version).toBe('v1');
  });

  it('GET /api/v1/verification/unknown should return 404 with certificate not found', async () => {
    const res = await request(app).get('/api/v1/verification/unknown');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CERTIFICATE_NOT_FOUND');
  });
});
